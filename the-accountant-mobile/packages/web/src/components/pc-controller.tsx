import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Loader2 } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_PC_API_URL || 'http://localhost:8000'

interface PCControllerProps {
  sessionToken?: string
}

type ActionType = 'shell' | 'file' | 'jupyter' | 'browser'

export function PCController({ sessionToken }: PCControllerProps) {
  const [actionType, setActionType] = useState<ActionType>('shell')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  // Shell state
  const [shellCommand, setShellCommand] = useState('')
  const [sessionId, setSessionId] = useState('')

  // File state
  const [filePath, setFilePath] = useState('')
  const [fileContent, setFileContent] = useState('')

  // Jupyter state
  const [jupyterCode, setJupyterCode] = useState('')

  const handleShellExec = async () => {
    try {
      setLoading(true)
      setResult('')

      const response = await fetch(`${API_BASE_URL}/v1/shell/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: shellCommand,
          session_id: sessionId || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const cmdResult = data.data
        setResult(
          `Session: ${cmdResult.session_id}\n` +
          `Exit Code: ${cmdResult.exit_code}\n` +
          `Status: ${cmdResult.status}\n\n` +
          `Output:\n${cmdResult.output}\n\n` +
          `Error:\n${cmdResult.error || '(none)'}`
        )
        setSessionId(cmdResult.session_id)
      } else {
        setResult(`Error: ${data.message}`)
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFileRead = async () => {
    try {
      setLoading(true)
      setResult('')

      const response = await fetch(`${API_BASE_URL}/v1/file/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: filePath,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setFileContent(data.data.content)
        setResult(`Successfully read ${data.data.file}\n\nContent length: ${data.data.content.length} bytes`)
      } else {
        setResult(`Error: ${data.message}`)
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFileWrite = async () => {
    try {
      setLoading(true)
      setResult('')

      const response = await fetch(`${API_BASE_URL}/v1/file/write`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: filePath,
          content: fileContent,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(`Successfully wrote to ${data.data.file}\n\nBytes written: ${data.data.bytes_written}`)
      } else {
        setResult(`Error: ${data.message}`)
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleJupyterExecute = async () => {
    try {
      setLoading(true)
      setResult('')

      const response = await fetch(`${API_BASE_URL}/v1/jupyter/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: jupyterCode,
          session_id: sessionId || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const execResult = data.data
        setSessionId(execResult.session_id)

        let output = `Session: ${execResult.session_id}\n`
        output += `Kernel: ${execResult.kernel_name}\n`
        output += `Status: ${execResult.status}\n\n`

        if (execResult.outputs && execResult.outputs.length > 0) {
          output += 'Outputs:\n'
          execResult.outputs.forEach((out: any, idx: number) => {
            output += `\n[${idx + 1}] ${out.output_type}:\n`
            if (out.text) output += out.text
            if (out.data) output += JSON.stringify(out.data, null, 2)
            if (out.ename) output += `${out.ename}: ${out.evalue}`
            output += '\n'
          })
        }

        setResult(output)
      } else {
        setResult(`Error: ${data.message}`)
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBrowserScreenshot = async () => {
    try {
      setLoading(true)
      setResult('')

      const response = await fetch(`${API_BASE_URL}/v1/browser/screenshot`)

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setResult(`Screenshot captured!\n\nSize: ${blob.size} bytes\nURL: ${url}\n\n(View in browser tab)`)

        // Open in new tab
        window.open(url, '_blank')
      } else {
        setResult(`Error: ${response.statusText}`)
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>PC Controller</CardTitle>
        <CardDescription>
          Control your development environment via API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Action Type</Label>
          <Select value={actionType} onValueChange={(v) => setActionType(v as ActionType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shell">Shell Execution</SelectItem>
              <SelectItem value="file">File Operations</SelectItem>
              <SelectItem value="jupyter">Jupyter/Python</SelectItem>
              <SelectItem value="browser">Browser Control</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {actionType === 'shell' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Command</Label>
              <Input
                value={shellCommand}
                onChange={(e) => setShellCommand(e.target.value)}
                placeholder="ls -la"
              />
            </div>
            <div className="space-y-2">
              <Label>Session ID (optional)</Label>
              <Input
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Leave empty for new session"
              />
            </div>
            <Button onClick={handleShellExec} disabled={loading || !shellCommand} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Execute Command
            </Button>
          </div>
        )}

        {actionType === 'file' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>File Path</Label>
              <Input
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="/path/to/file.txt"
              />
            </div>
            <div className="space-y-2">
              <Label>File Content</Label>
              <Textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="File contents..."
                rows={6}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleFileRead} disabled={loading || !filePath} className="flex-1">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Read File
              </Button>
              <Button onClick={handleFileWrite} disabled={loading || !filePath} className="flex-1">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Write File
              </Button>
            </div>
          </div>
        )}

        {actionType === 'jupyter' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Python Code</Label>
              <Textarea
                value={jupyterCode}
                onChange={(e) => setJupyterCode(e.target.value)}
                placeholder="print('Hello from Jupyter!')"
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label>Session ID (optional)</Label>
              <Input
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Leave empty for new session"
              />
            </div>
            <Button onClick={handleJupyterExecute} disabled={loading || !jupyterCode} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Execute Python
            </Button>
          </div>
        )}

        {actionType === 'browser' && (
          <div className="space-y-3">
            <Button onClick={handleBrowserScreenshot} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Take Screenshot
            </Button>
          </div>
        )}

        {result && (
          <div className="mt-4">
            <Label>Result</Label>
            <Textarea
              value={result}
              readOnly
              rows={10}
              className="font-mono text-xs"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
