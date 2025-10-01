import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { TerminalComponent } from './terminal'
import { Loader2, Send, Settings, Terminal as TerminalIcon } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
}

interface ToolCall {
  tool: string
  params: any
  result?: any
  error?: string
}

interface PCControllerChatProps {
  sessionToken?: string
}

export function PCControllerChat({ sessionToken }: PCControllerChatProps) {
  const [pcUrl, setPcUrl] = useState('http://localhost:8000')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Call backend API to process the message with LLM
      const response = await fetch('/api/pc/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
        },
        body: JSON.stringify({
          message: input,
          pcUrl,
          username,
          password,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        toolCalls: data.toolCalls,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle>PC Controller Chat</CardTitle>
        <CardDescription>Chat with AI to control your development environment</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="chat" className="w-full">
          <div className="px-6 pb-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="terminal">
                <TerminalIcon className="h-4 w-4 mr-2" />
                Terminal
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="mt-0 space-y-4">
            {/* Settings Section */}
            <div className="px-4 py-3 border-y bg-muted/30 space-y-2">
              <div className="space-y-1.5">
                <Label htmlFor="pc-url" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Settings className="h-3 w-3" />
                  PC URL
                </Label>
                <Input
                  id="pc-url"
                  value={pcUrl}
                  onChange={(e) => setPcUrl(e.target.value)}
                  placeholder="https://sandbox-url.phala.network"
                  className="h-8 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="chat-username" className="text-xs font-medium text-muted-foreground">
                    Username
                  </Label>
                  <Input
                    id="chat-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="chat-password" className="text-xs font-medium text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="chat-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="admin123"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[400px] overflow-y-auto px-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-12">
                  <p className="font-medium">Start a conversation to control your PC</p>
                  <p className="text-xs mt-2 text-muted-foreground/80">
                    Try: "List files in the current directory" or "Execute 'ls -la' in terminal"
                  </p>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.role === 'system'
                        ? 'bg-destructive/10 text-destructive border border-destructive/20'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {message.content}
                    </div>
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/20 space-y-2">
                        <div className="text-[10px] font-semibold opacity-60 uppercase tracking-wide">
                          Executed Commands
                        </div>
                        {message.toolCalls.map((call, i) => (
                          <div key={i} className="bg-background/60 rounded-lg p-2 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                                {call.tool}
                              </span>
                            </div>
                            {call.result && (
                              <div className="text-[11px] font-mono text-muted-foreground bg-black/5 dark:bg-white/5 p-2 rounded overflow-x-auto max-h-32 overflow-y-auto leading-relaxed">
                                {typeof call.result === 'string'
                                  ? call.result
                                  : JSON.stringify(call.result, null, 2)}
                              </div>
                            )}
                            {call.error && (
                              <div className="text-[11px] font-mono text-destructive bg-destructive/10 p-2 rounded">
                                ⚠️ {call.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-[10px] opacity-40 mt-1.5">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 border-t pt-3">
              <div className="flex gap-2 items-end">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="resize-none min-h-[60px] text-sm"
                  rows={2}
                  disabled={loading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="h-[60px] w-[60px] rounded-full flex-shrink-0"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="terminal" className="mt-0 h-[600px]">
            <TerminalComponent baseUrl={pcUrl} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
