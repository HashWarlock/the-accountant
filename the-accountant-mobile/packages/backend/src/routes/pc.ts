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
  aiProvider?: 'redpill' | 'anthropic'
  aiModel?: string
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
    const {
      message,
      pcUrl,
      history = [],
      username,
      password,
      aiProvider = 'redpill',
      aiModel,
    }: PCChatRequest = req.body

    if (!message || !pcUrl) {
      return res.status(400).json({ error: 'message and pcUrl are required' })
    }

    // Set default model based on provider
    const selectedModel =
      aiModel || (aiProvider === 'redpill' ? 'phala/deepseek-chat-v3-0324' : 'claude-3-5-sonnet-20241022')

    // Prepare auth headers if credentials provided
    const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
    if (username && password) {
      const authString = Buffer.from(`${username}:${password}`).toString('base64')
      authHeaders['Authorization'] = `Basic ${authString}`
    }

    const toolCalls: any[] = []
    let response = ''
    let attestationUrl: string | undefined
    let attestationData: any = undefined

    // Use Redpill AI (TEE-protected) if selected
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
                  file: {
                    type: 'string',
                    description: 'The path to the file to read',
                  },
                },
                required: ['file'],
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
                  file: {
                    type: 'string',
                    description: 'The path to the file to write',
                  },
                  content: {
                    type: 'string',
                    description: 'The content to write to the file',
                  },
                },
                required: ['file', 'content'],
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

        const systemPrompt = `You are an AI assistant for controlling a development environment at ${pcUrl}.

RESPONSE FORMAT:
- Lead with key findings or status
- Use bullet points for lists
- Include relevant technical details (file paths, line numbers, error codes)
- Show actual output when it's concise and relevant
- Be direct - engineers want facts, not fluff

EXAMPLES:

Good: "Found 3 TypeScript errors:
• src/app.ts:42 - Type 'string' not assignable to 'number'
• src/utils.ts:15 - Missing return type
• tests/api.test.ts:89 - Unused variable 'result'"

Good: "Server running on port 3000.
Logs show 2 warnings about deprecated dependencies."

Bad: "I've checked the server and it seems to be working well! Everything looks good!"`

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
          model: selectedModel,
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

          // Extract tool calls and execute them
          if (assistantMessage.tool_calls) {
            const toolResults: any[] = []

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

                toolResults.push({
                  tool_call_id: toolCall.id,
                  role: 'tool' as const,
                  name: functionName,
                  content: JSON.stringify(result),
                })
              } catch (error) {
                console.error(`[PC API] Error:`, error)
                const errorMsg = error instanceof Error ? error.message : 'Unknown error'
                toolCalls.push({
                  tool: functionName,
                  params: functionArgs,
                  error: errorMsg,
                })

                toolResults.push({
                  tool_call_id: toolCall.id,
                  role: 'tool' as const,
                  name: functionName,
                  content: `Error: ${errorMsg}`,
                })
              }
            }

            // If there were tool calls, send results back to AI for interpretation
            if (toolResults.length > 0) {
              const followUpMessages: OpenAI.ChatCompletionMessageParam[] = [
                ...redpillMessages,
                {
                  role: 'assistant',
                  content: assistantMessage.content,
                  tool_calls: assistantMessage.tool_calls,
                },
                ...toolResults,
              ]

              const followUpCompletion = await redpill.chat.completions.create({
                model: selectedModel,
                messages: followUpMessages,
              })

              // Use the AI's interpretation of the tool results
              response = followUpCompletion.choices[0]?.message?.content || response
            }
          }
        }

        // Fetch attestation report for the model
        try {
          const attestationResponse = await fetch(
            `https://api.redpill.ai/v1/attestation/report?model=${encodeURIComponent(selectedModel)}`
          )
          if (attestationResponse.ok) {
            attestationData = await attestationResponse.json()
            attestationUrl =
              attestationData.url ||
              `https://api.redpill.ai/v1/attestation/report?model=${encodeURIComponent(selectedModel)}`
          }
        } catch (attestationError) {
          console.warn('Failed to fetch attestation report:', attestationError)
          // Non-critical, continue without attestation
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
                file: {
                  type: 'string',
                  description: 'The path to the file to read',
                },
              },
              required: ['file'],
            },
          },
          {
            name: 'file_write',
            description: 'Write content to a file',
            input_schema: {
              type: 'object',
              properties: {
                file: {
                  type: 'string',
                  description: 'The path to the file to write',
                },
                content: {
                  type: 'string',
                  description: 'The content to write to the file',
                },
              },
              required: ['file', 'content'],
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

        const systemPrompt = `You are an AI assistant for controlling a development environment at ${pcUrl}.

RESPONSE FORMAT:
- Lead with key findings or status
- Use bullet points for lists
- Include relevant technical details (file paths, line numbers, error codes)
- Show actual output when it's concise and relevant
- Be direct - engineers want facts, not fluff

EXAMPLES:

Good: "Found 3 TypeScript errors:
• src/app.ts:42 - Type 'string' not assignable to 'number'
• src/utils.ts:15 - Missing return type
• tests/api.test.ts:89 - Unused variable 'result'"

Good: "Server running on port 3000.
Logs show 2 warnings about deprecated dependencies."

Bad: "I've checked the server and it seems to be working well! Everything looks good!"`

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
          model: selectedModel,
          max_tokens: 1024,
          system: systemPrompt,
          tools,
          messages: claudeMessages,
        })

        // Extract response and tool calls
        const toolUseBlocks: any[] = []
        for (const block of claudeResponse.content) {
          if (block.type === 'text') {
            response += block.text
          } else if (block.type === 'tool_use') {
            toolUseBlocks.push(block)
          }
        }

        // Execute tool calls if any
        if (toolUseBlocks.length > 0) {
          const toolResults: any[] = []

          for (const block of toolUseBlocks) {
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

              toolResults.push({
                type: 'tool_result' as const,
                tool_use_id: block.id,
                content: JSON.stringify(result),
              })
            } catch (error) {
              console.error(`[PC API] Error:`, error)
              const errorMsg = error instanceof Error ? error.message : 'Unknown error'
              toolCalls.push({
                tool: block.name,
                params: block.input,
                error: errorMsg,
              })

              toolResults.push({
                type: 'tool_result' as const,
                tool_use_id: block.id,
                content: `Error: ${errorMsg}`,
                is_error: true,
              })
            }
          }

          // Send tool results back to Claude for interpretation
          const followUpMessages = [
            ...claudeMessages,
            { role: 'assistant' as const, content: claudeResponse.content },
            { role: 'user' as const, content: toolResults },
          ]

          const followUpResponse = await anthropic.messages.create({
            model: selectedModel,
            max_tokens: 1024,
            system: systemPrompt,
            messages: followUpMessages,
          })

          // Use Claude's interpretation of the tool results
          response = ''
          for (const block of followUpResponse.content) {
            if (block.type === 'text') {
              response += block.text
            }
          }
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
      attestationUrl,
      attestationData,
    })
  } catch (error) {
    console.error('Error in PC chat:', error)
    res.status(500).json({ error: 'Failed to process chat message' })
  }
})

export default router
