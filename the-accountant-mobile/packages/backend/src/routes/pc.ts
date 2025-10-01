import { Router, Request, Response } from 'express'
import { authenticateSession, AuthRequest } from '../middleware/auth.js'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const router = Router()

// Initialize AI clients based on available API keys
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

const redpill = process.env.REDPILL_API_KEY
  ? new OpenAI({
      apiKey: process.env.REDPILL_API_KEY,
      baseURL: 'https://api.redpill.ai/v1',
    })
  : null

// Determine which AI provider to use (Redpill takes priority for TEE protection)
const aiProvider = redpill ? 'redpill' : anthropic ? 'anthropic' : null

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface PCChatRequest {
  message: string
  pcUrl: string
  history: ChatMessage[]
  username?: string
  password?: string
}

// Map tool names to actual PC API endpoints
function getApiEndpoint(toolName: string): string {
  const mapping: Record<string, string> = {
    shell_exec: '/v1/shell/exec',
    file_read: '/v1/file/read',
    file_write: '/v1/file/write',
    jupyter_execute: '/v1/jupyter/execute',
    browser_screenshot: '/browser/screenshot', // Adjust if different
  }
  return mapping[toolName] || `/api/${toolName}`
}

/**
 * POST /api/pc/chat
 * Chat with LLM to control PC via API calls
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, pcUrl, history = [], username, password }: PCChatRequest = req.body

    if (!message || !pcUrl) {
      return res.status(400).json({ error: 'message and pcUrl are required' })
    }

    // Prepare auth headers if credentials provided
    const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
    if (username && password) {
      const authString = Buffer.from(`${username}:${password}`).toString('base64')
      authHeaders['Authorization'] = `Basic ${authString}`
    }

    const toolCalls: any[] = []
    let response = ''

    // Use Redpill AI (TEE-protected) if available
    if (aiProvider === 'redpill' && redpill) {
      try {
        // Define tools in OpenAI format for Redpill
        const tools: OpenAI.ChatCompletionTool[] = [
          {
            type: 'function',
            function: {
              name: 'shell_exec',
              description: 'Execute a shell command on the target PC',
              parameters: {
                type: 'object',
                properties: {
                  command: {
                    type: 'string',
                    description: 'The shell command to execute',
                  },
                },
                required: ['command'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'file_read',
              description: 'Read the contents of a file',
              parameters: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string',
                    description: 'The path to the file to read',
                  },
                },
                required: ['path'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'file_write',
              description: 'Write content to a file',
              parameters: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string',
                    description: 'The path to the file to write',
                  },
                  content: {
                    type: 'string',
                    description: 'The content to write to the file',
                  },
                },
                required: ['path', 'content'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'jupyter_execute',
              description: 'Execute Python code in Jupyter',
              parameters: {
                type: 'object',
                properties: {
                  code: {
                    type: 'string',
                    description: 'The Python code to execute',
                  },
                },
                required: ['code'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'browser_screenshot',
              description: 'Take a screenshot of the browser',
              parameters: {
                type: 'object',
                properties: {},
              },
            },
          },
        ]

        const systemPrompt = `You are a helpful AI assistant that can control a development environment.
The target PC is accessible at: ${pcUrl}

Use the available tools to help the user accomplish their tasks. Be clear and concise in your responses.`

        const redpillMessages: OpenAI.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
          ...history
            .filter((m) => m.role !== 'system')
            .map(
              (m) =>
                ({
                  role: m.role,
                  content: m.content,
                }) as OpenAI.ChatCompletionMessageParam
            ),
          { role: 'user', content: message },
        ]

        const completion = await redpill.chat.completions.create({
          model: 'anthropic/claude-3-5-sonnet-20241022',
          messages: redpillMessages,
          tools,
          tool_choice: 'auto',
        })

        const assistantMessage = completion.choices[0]?.message

        if (assistantMessage) {
          // Extract text response
          if (assistantMessage.content) {
            response = assistantMessage.content
          }

          // Extract tool calls
          if (assistantMessage.tool_calls) {
            for (const toolCall of assistantMessage.tool_calls) {
              const functionName = toolCall.function.name
              const functionArgs = JSON.parse(toolCall.function.arguments)

              // Call the actual PC API endpoint
              try {
                const endpoint = getApiEndpoint(functionName)
                const apiUrl = `${pcUrl}${endpoint}`

                console.log(`[PC API] Calling ${apiUrl} with params:`, functionArgs)

                const apiResponse = await fetch(apiUrl, {
                  method: 'POST',
                  headers: authHeaders,
                  body: JSON.stringify(functionArgs),
                })

                console.log(`[PC API] Response status:`, apiResponse.status)

                if (!apiResponse.ok) {
                  const text = await apiResponse.text()
                  console.error(`[PC API] Error response:`, text.substring(0, 200))
                  throw new Error(`API returned ${apiResponse.status}: ${text.substring(0, 100)}`)
                }

                const result = await apiResponse.json()
                console.log(`[PC API] Success:`, result)

                toolCalls.push({
                  tool: functionName,
                  params: functionArgs,
                  result,
                })
              } catch (error) {
                console.error(`[PC API] Error:`, error)
                toolCalls.push({
                  tool: functionName,
                  params: functionArgs,
                  error: error instanceof Error ? error.message : 'Unknown error',
                })
              }
            }
          }

          if (!response && toolCalls.length > 0) {
            response = `I executed ${toolCalls.length} tool(s) for you. Check the results below.`
          }
        }
      } catch (error) {
        console.error('Redpill API error:', error)
        response = `Error calling Redpill AI: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    } else if (aiProvider === 'anthropic' && anthropic) {
      try {
        // Define tools for Claude
        const tools = [
          {
            name: 'shell_exec',
            description: 'Execute a shell command on the target PC',
            input_schema: {
              type: 'object',
              properties: {
                command: {
                  type: 'string',
                  description: 'The shell command to execute',
                },
              },
              required: ['command'],
            },
          },
          {
            name: 'file_read',
            description: 'Read the contents of a file',
            input_schema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'The path to the file to read',
                },
              },
              required: ['path'],
            },
          },
          {
            name: 'file_write',
            description: 'Write content to a file',
            input_schema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'The path to the file to write',
                },
                content: {
                  type: 'string',
                  description: 'The content to write to the file',
                },
              },
              required: ['path', 'content'],
            },
          },
          {
            name: 'jupyter_execute',
            description: 'Execute Python code in Jupyter',
            input_schema: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'The Python code to execute',
                },
              },
              required: ['code'],
            },
          },
          {
            name: 'browser_screenshot',
            description: 'Take a screenshot of the browser',
            input_schema: {
              type: 'object',
              properties: {},
            },
          },
        ]

        const systemPrompt = `You are a helpful AI assistant that can control a development environment.
The target PC is accessible at: ${pcUrl}

Use the available tools to help the user accomplish their tasks. Be clear and concise in your responses.`

        const claudeMessages = [
          ...history
            .filter((m) => m.role !== 'system')
            .map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          { role: 'user' as const, content: message },
        ]

        const claudeResponse = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: systemPrompt,
          tools,
          messages: claudeMessages,
        })

        // Extract response and tool calls
        for (const block of claudeResponse.content) {
          if (block.type === 'text') {
            response += block.text
          } else if (block.type === 'tool_use') {
            // Call the actual PC API endpoint
            try {
              const endpoint = getApiEndpoint(block.name)
              const apiUrl = `${pcUrl}${endpoint}`

              console.log(`[PC API] Calling ${apiUrl} with params:`, block.input)

              const apiResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify(block.input),
              })

              console.log(`[PC API] Response status:`, apiResponse.status)

              if (!apiResponse.ok) {
                const text = await apiResponse.text()
                console.error(`[PC API] Error response:`, text.substring(0, 200))
                throw new Error(`API returned ${apiResponse.status}: ${text.substring(0, 100)}`)
              }

              const result = await apiResponse.json()
              console.log(`[PC API] Success:`, result)

              toolCalls.push({
                tool: block.name,
                params: block.input,
                result,
              })
            } catch (error) {
              console.error(`[PC API] Error:`, error)
              toolCalls.push({
                tool: block.name,
                params: block.input,
                error: error instanceof Error ? error.message : 'Unknown error',
              })
            }
          }
        }

        if (!response && toolCalls.length > 0) {
          response = `I executed ${toolCalls.length} tool(s) for you. Check the results below.`
        }
      } catch (error) {
        console.error('Anthropic API error:', error)
        response = `Error calling AI service: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    } else {
      // Fallback to simple pattern matching if no API key
      if (message.toLowerCase().includes('list') && message.toLowerCase().includes('file')) {
        toolCalls.push({
          tool: 'shell_exec',
          params: { command: 'ls -la' },
          result: 'Demo: Would execute ls -la on the target PC',
        })
        response = "I would list files using 'ls -la'. To enable actual execution, set ANTHROPIC_API_KEY."
      } else if (message.toLowerCase().includes('read') && message.toLowerCase().includes('file')) {
        const match = message.match(/read.*?['"](.+?)['"]/)
        const file = match ? match[1] : 'file.txt'
        toolCalls.push({
          tool: 'file_read',
          params: { path: file },
          result: `Demo: Would read ${file} from the target PC`,
        })
        response = `I would read the file '${file}'. To enable actual execution, set ANTHROPIC_API_KEY.`
      } else {
        response = `AI service not configured. To enable full LLM-powered chat:

**Option 1 (Recommended - TEE Protected):**
1. Set REDPILL_API_KEY in your environment
2. Sign up at https://redpill.ai and generate your API key
3. Restart the backend server

**Option 2 (Direct Anthropic):**
1. Set ANTHROPIC_API_KEY in your environment
2. Restart the backend server

For now, I can only respond to simple pattern matching:
- "list files" - simulates file listing
- "read file 'filename'" - simulates file reading

The PC would be controlled via: ${pcUrl}`
      }
    }

    res.json({
      response,
      toolCalls,
    })
  } catch (error) {
    console.error('Error in PC chat:', error)
    res.status(500).json({ error: 'Failed to process chat message' })
  }
})

export default router
