import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { CopyButton } from './copy-button'
import { Loader2, MessageSquare } from 'lucide-react'

interface SignMessageCardProps {
  onSign: (message: string) => Promise<{ signature: string; address: string }>
  walletAddress: string
}

export function SignMessageCard({ onSign, walletAddress }: SignMessageCardProps) {
  const [message, setMessage] = useState('Hello, dstack!')
  const [signature, setSignature] = useState<string | null>(null)
  const [isSigning, setIsSigning] = useState(false)

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSigning(true)
    try {
      const result = await onSign(message)
      setSignature(result.signature)
    } catch (error) {
      console.error('Failed to sign:', error)
    } finally {
      setIsSigning(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Sign Message
        </CardTitle>
        <CardDescription>
          Sign arbitrary messages to prove ownership of your wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSign} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Message to sign</label>
            <Textarea
              placeholder="Enter message to sign..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Using {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} to sign the message
            </p>
          </div>

          {signature && (
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Signature</p>
                <CopyButton text={signature} />
              </div>
              <code className="text-xs break-all block">
                {signature}
              </code>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSigning}>
            {isSigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing...
              </>
            ) : (
              'Sign Message'
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-4">
          Sign arbitrary messages to prove ownership of your wallet
        </p>
      </CardContent>
    </Card>
  )
}
