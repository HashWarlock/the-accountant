import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { TerminalComponent } from './terminal'
import { Loader2, Send, Settings, Terminal as TerminalIcon, Shield } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
  attestationUrl?: string
  attestationData?: any
  model?: string
  signatureData?: {
    messageId: string
    requestHash?: string
    responseHash?: string
    signature?: string
    publicKey?: string
    signingAddress?: string
    algorithm?: string
    curve?: string
    messageHash?: string
    timestamp?: string
    teeInstance?: string
    model?: string
    verified?: boolean
  }
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
  const [aiProvider, setAiProvider] = useState<'redpill' | 'anthropic'>('redpill')
  const [aiModel, setAiModel] = useState('phala/deepseek-chat-v3-0324')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [expandedAttestation, setExpandedAttestation] = useState<number | null>(null)
  const [expandedSignature, setExpandedSignature] = useState<number | null>(null)
  const [expandedToolCalls, setExpandedToolCalls] = useState<number | null>(null)
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
          aiProvider,
          aiModel,
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
        attestationUrl: data.attestationUrl,
        attestationData: data.attestationData,
        model: aiModel,
        signatureData: data.signatureData,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-0 shadow-none">
      <CardHeader className="pb-2 px-4">
        <CardTitle className="text-lg">PC Controller</CardTitle>
        <CardDescription className="text-xs">AI-powered development environment control</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="chat" className="w-full">
          <div className="px-4 pb-2">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="chat" className="text-sm">Chat</TabsTrigger>
              <TabsTrigger value="terminal" className="text-sm">
                <TerminalIcon className="h-4 w-4 mr-2" />
                Terminal
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="mt-0">
            {/* Settings Toggle */}
            <div className="px-4 py-2.5 border-b bg-muted/10">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground w-full transition-colors"
              >
                <Settings className="h-3.5 w-3.5" />
                <span className="font-medium">Settings</span>
                <span className="ml-auto text-[10px] font-mono">{showSettings ? '▼' : '▶'}</span>
              </button>
            </div>

            {/* Settings Section - Collapsible */}
            {showSettings && (
              <div className="px-4 py-3 border-b bg-muted/20 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium text-muted-foreground">
                    AI Provider
                  </Label>
                  <Select
                    value={aiProvider}
                    onValueChange={(value: 'redpill' | 'anthropic') => {
                      setAiProvider(value)
                      // Set default model for provider
                      if (value === 'redpill') {
                        setAiModel('phala/deepseek-chat-v3-0324')
                      } else {
                        setAiModel('claude-3-5-sonnet-20241022')
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="redpill">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3 text-green-600" />
                          <span>Redpill (Confidential)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="anthropic">Anthropic (Direct)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium text-muted-foreground">
                    {aiProvider === 'redpill' ? 'Model (TEE-Protected)' : 'Model'}
                  </Label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiProvider === 'redpill' ? (
                        <>
                          <SelectItem value="phala/deepseek-chat-v3-0324">DeepSeek Chat v3 (685B)</SelectItem>
                          <SelectItem value="phala/gpt-oss-120b">GPT-OSS 120B</SelectItem>
                          <SelectItem value="phala/gpt-oss-20b">GPT-OSS 20B</SelectItem>
                          <SelectItem value="phala/qwen2.5-vl-72b-instruct">Qwen2.5 VL 72B</SelectItem>
                          <SelectItem value="phala/qwen-2.5-7b-instruct">Qwen 2.5 7B</SelectItem>
                          <SelectItem value="phala/gemma-3-27b-it">Gemma 3 27B</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                          <SelectItem value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet</SelectItem>
                          <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                          <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pc-url" className="text-[11px] font-medium text-muted-foreground">
                    PC URL
                  </Label>
                  <Input
                    id="pc-url"
                    value={pcUrl}
                    onChange={(e) => setPcUrl(e.target.value)}
                    placeholder="https://sandbox-url.phala.network"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="chat-username" className="text-[11px] font-medium text-muted-foreground">
                      Username
                    </Label>
                    <Input
                      id="chat-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="chat-password" className="text-[11px] font-medium text-muted-foreground">
                      Password
                    </Label>
                    <Input
                      id="chat-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="admin123"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="h-[500px] overflow-y-auto px-4 py-4 space-y-4 bg-background">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground/60 text-sm py-16 px-6">
                  <p className="text-base font-normal">Start a conversation to control your PC</p>
                  <p className="text-xs mt-3 text-muted-foreground/50 leading-relaxed">
                    Try: "What project are we in?" or "List files in the current directory"
                  </p>
                </div>
              )}

              {messages.map((message, index) => (
                <div key={index} className="space-y-2">
                  {message.role === 'user' && (
                    <div className="text-sm text-muted-foreground/80 font-normal leading-relaxed">
                      {message.content}
                    </div>
                  )}
                  {message.role !== 'user' && (
                    <div className="space-y-3">
                      {/* Trust Badge */}
                      {message.attestationUrl && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <a
                              href={message.attestationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold bg-green-500/10 text-green-700 dark:text-green-400 rounded-md border border-green-500/30 hover:bg-green-500/20 transition-colors"
                            >
                              <Shield className="h-3 w-3" />
                              <span>Verified</span>
                            </a>
                            <span className="text-[10px] text-muted-foreground">
                              {message.model?.split('/')[1]?.replace(/-/g, ' ') || 'AI'}
                            </span>
                          </div>

                          {/* Expandable Attestation Details */}
                          {message.attestationData && (
                            <div className="border border-border/30 rounded-lg overflow-hidden bg-muted/20">
                              <button
                                onClick={() => setExpandedAttestation(expandedAttestation === index ? null : index)}
                                className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium text-muted-foreground hover:bg-muted/40 transition-colors"
                              >
                                <span className="flex items-center gap-1.5">
                                  {expandedAttestation === index ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                  Signed Message (Attestation)
                                </span>
                                <span className="text-[10px] text-muted-foreground/60">
                                  {message.attestationData.attestation?.type || 'TEE'}
                                </span>
                              </button>

                              {expandedAttestation === index && (
                                <div className="px-3 py-3 border-t border-border/30 space-y-3">
                                  {/* Model */}
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Model</p>
                                    <code className="text-[11px] font-mono text-foreground/90 break-all block">
                                      {message.model || message.attestationData?.model || 'Unknown'}
                                    </code>
                                  </div>

                                  {/* Attestation Type */}
                                  {message.attestationData?.attestation?.type && (
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Type</p>
                                      <code className="text-[11px] font-mono text-foreground/90">
                                        {message.attestationData.attestation.type}
                                      </code>
                                    </div>
                                  )}

                                  {/* Report Data */}
                                  {message.attestationData?.report_data && (
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Report Data</p>
                                      <code className="text-[11px] font-mono text-foreground/90 break-all block">
                                        {message.attestationData.report_data}
                                      </code>
                                    </div>
                                  )}

                                  {/* Quote (shortened) */}
                                  {message.attestationData?.quote && (
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Quote</p>
                                      <code className="text-[11px] font-mono text-foreground/90 break-all block">
                                        {message.attestationData.quote.substring(0, 100)}...
                                      </code>
                                    </div>
                                  )}

                                  {/* Verification Status */}
                                  <div className="pt-2 border-t border-border/30">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                        Verification
                                      </span>
                                      {message.attestationData?.verified || message.attestationData?.attestation?.verified ? (
                                        <span className="text-[11px] font-medium text-green-600">
                                          ✓ Verified
                                        </span>
                                      ) : (
                                        <span className="text-[11px] font-medium text-yellow-600">
                                          ⚠ Unverified
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted/50 prose-pre:text-foreground prose-code:text-foreground">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>

                      {/* Signature Verification */}
                      {message.signatureData && (
                        <div className="mt-3 border border-border/30 rounded-lg overflow-hidden bg-muted/20">
                          <button
                            onClick={() => setExpandedSignature(expandedSignature === index ? null : index)}
                            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium text-muted-foreground hover:bg-muted/40 transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              {expandedSignature === index ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                              Signature Details
                            </span>
                            <span className="text-[10px] text-muted-foreground/60">
                              {message.signatureData.algorithm?.toUpperCase() || 'ECDSA'}
                            </span>
                          </button>

                          {expandedSignature === index && (
                            <div className="px-3 py-3 border-t border-border/30 space-y-3">
                              {/* Message ID */}
                              <div className="space-y-1">
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Request ID</p>
                                <code className="text-[11px] font-mono text-foreground/90 break-all block">
                                  {message.signatureData.messageId}
                                </code>
                              </div>

                              {/* Model */}
                              {message.signatureData.model && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Model</p>
                                  <code className="text-[11px] font-mono text-foreground/90 break-all block">
                                    {message.signatureData.model}
                                  </code>
                                </div>
                              )}

                              {/* Timestamp */}
                              {message.signatureData.timestamp && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Timestamp</p>
                                  <code className="text-[11px] font-mono text-foreground/90 break-all block">
                                    {new Date(message.signatureData.timestamp).toISOString()}
                                  </code>
                                </div>
                              )}

                              {/* Request Hash */}
                              {message.signatureData.requestHash && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Request Hash</p>
                                  <code className="text-[11px] font-mono text-foreground/90 break-all block">
                                    {message.signatureData.requestHash}
                                  </code>
                                </div>
                              )}

                              {/* Response Hash */}
                              {message.signatureData.responseHash && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Response Hash</p>
                                  <code className="text-[11px] font-mono text-foreground/90 break-all block">
                                    {message.signatureData.responseHash}
                                  </code>
                                </div>
                              )}

                              {/* Signature */}
                              {message.signatureData.signature && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">ECDSA Signature</p>
                                  <code className="text-[11px] font-mono text-foreground/90 break-all block">
                                    {message.signatureData.signature}
                                  </code>
                                </div>
                              )}

                              {/* Public Key */}
                              {message.signatureData.publicKey && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Public Key</p>
                                  <code className="text-[11px] font-mono text-foreground/90 break-all block">
                                    {message.signatureData.publicKey}
                                  </code>
                                </div>
                              )}

                              {/* Signing Address */}
                              {message.signatureData.signingAddress && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Signing Address</p>
                                  <code className="text-[11px] font-mono text-foreground/90 break-all block">
                                    {message.signatureData.signingAddress}
                                  </code>
                                </div>
                              )}

                              {/* Curve */}
                              {message.signatureData.curve && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Curve</p>
                                  <code className="text-[11px] font-mono text-foreground/90">
                                    {message.signatureData.curve}
                                  </code>
                                </div>
                              )}

                              {/* TEE Instance */}
                              {message.signatureData.teeInstance && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">TEE Instance</p>
                                  <code className="text-[11px] font-mono text-foreground/90">
                                    {message.signatureData.teeInstance}
                                  </code>
                                </div>
                              )}

                              {/* Verification Status */}
                              <div className="pt-2 border-t border-border/30">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                    TEE Verification
                                  </span>
                                  {message.signatureData.verified ? (
                                    <span className="text-[11px] font-medium text-green-600">
                                      ✓ Verified
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-medium text-yellow-600">
                                      ⚠ Unverified
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tool Call Results */}
                      {message.toolCalls && message.toolCalls.length > 0 && (
                        <div className="mt-3 border border-border/30 rounded-lg overflow-hidden bg-muted/20">
                          <button
                            onClick={() => setExpandedToolCalls(expandedToolCalls === index ? null : index)}
                            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium text-muted-foreground hover:bg-muted/40 transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              {expandedToolCalls === index ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                              Tool Results ({message.toolCalls.length})
                            </span>
                          </button>

                          {expandedToolCalls === index && (
                            <div className="border-t border-border/30 px-3 py-3 space-y-2">
                              {message.toolCalls.map((call, i) => (
                                <div key={i} className="space-y-1">
                                  {call.tool && (
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                      {call.tool}
                                    </p>
                                  )}
                                  {call.result && (
                                    <div className="text-[10px] font-mono leading-relaxed text-foreground/80 bg-muted/30 p-2 rounded overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                                      {typeof call.result === 'object' && call.result.data?.output
                                        ? call.result.data.output
                                        : typeof call.result === 'object' && call.result.data?.content
                                        ? call.result.data.content
                                        : typeof call.result === 'string'
                                        ? call.result
                                        : JSON.stringify(call.result, null, 2)}
                                    </div>
                                  )}
                                  {call.error && (
                                    <div className="text-[10px] font-mono text-red-500 dark:text-red-400 bg-red-500/10 p-2 rounded border border-red-500/30">
                                      ✗ {call.error}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-3">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Message..."
                    className="resize-none min-h-[42px] max-h-[200px] text-sm rounded-xl border border-border/60 px-4 py-3 pr-12 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary bg-background shadow-sm transition-all"
                    rows={1}
                    disabled={loading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                    size="icon"
                    className="absolute bottom-2 right-2 h-[32px] w-[32px] rounded-lg"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
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
