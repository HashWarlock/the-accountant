import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Settings } from 'lucide-react'

interface TerminalComponentProps {
  baseUrl?: string
  onConnect?: () => void
  onDisconnect?: () => void
}

export function TerminalComponent({ baseUrl: initialBaseUrl, onConnect, onDisconnect }: TerminalComponentProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstance = useRef<Terminal | null>(null)
  const websocketRef = useRef<WebSocket | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [connected, setConnected] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl || 'http://localhost:8000')

  useEffect(() => {
    if (!terminalRef.current) return

    // Create terminal
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
        cursor: '#ffffff',
        selection: '#ffffff40',
      },
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    fitAddonRef.current = fitAddon

    term.open(terminalRef.current)
    fitAddon.fit()

    terminalInstance.current = term

    // Handle terminal input
    term.onData((data) => {
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(
          JSON.stringify({
            type: 'input',
            data: data,
          })
        )
      }
    })

    // Handle terminal resize
    term.onResize(({ cols, rows }) => {
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(
          JSON.stringify({
            type: 'resize',
            data: { cols, rows },
          })
        )
      }
    })

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      term.dispose()
      window.removeEventListener('resize', handleResize)
      if (websocketRef.current) {
        websocketRef.current.close()
      }
    }
  }, [])

  const connect = () => {
    if (!terminalInstance.current) return

    // Convert http/https to ws/wss
    const wsUrl = baseUrl.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:')
    const finalWsUrl = `${wsUrl}/v1/shell/ws`

    console.log('Connecting to WebSocket:', finalWsUrl)
    terminalInstance.current.write(`\r\n*** Connecting to ${finalWsUrl} ***\r\n`)

    const ws = new WebSocket(finalWsUrl)

    ws.onopen = () => {
      setConnected(true)
      onConnect?.()
      terminalInstance.current?.write('\r\n*** Connected to terminal ***\r\n\r\n')
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        if (message.type === 'output') {
          terminalInstance.current?.write(message.data)
        } else if (message.type === 'session_id') {
          setSessionId(message.data)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      terminalInstance.current?.write('\r\n*** Connection error ***\r\n')
    }

    ws.onclose = () => {
      setConnected(false)
      onDisconnect?.()
      terminalInstance.current?.write('\r\n*** Disconnected ***\r\n')
    }

    websocketRef.current = ws
  }

  const disconnect = () => {
    if (websocketRef.current) {
      websocketRef.current.close()
      websocketRef.current = null
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Connection Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`h-2 w-2 rounded-full ${
              connected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://sandbox-url.phala.network"
            className="h-8 text-xs flex-1"
            disabled={connected}
          />
        </div>
        <button
          onClick={connected ? disconnect : connect}
          className="ml-3 px-4 py-1.5 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          disabled={!baseUrl.trim()}
        >
          {connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>

      {/* Terminal */}
      <div ref={terminalRef} className="flex-1 bg-[#1e1e1e]" />
    </div>
  )
}
