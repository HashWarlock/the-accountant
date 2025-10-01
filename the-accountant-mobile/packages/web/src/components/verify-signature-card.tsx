import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Loader2, CheckCircle2, XCircle, Shield } from 'lucide-react'

interface VerifySignatureCardProps {
  onVerify: (message: string, signature: string, address: string) => Promise<{
    valid: boolean
    recoveredAddress: string
    user?: { userId: string; email: string; address: string }
  }>
}

export function VerifySignatureCard({ onVerify }: VerifySignatureCardProps) {
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [address, setAddress] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<{
    valid: boolean
    recoveredAddress: string
    user?: { userId: string; email: string; address: string }
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    if (!message || !signature) {
      setError('Message and signature are required')
      return
    }

    try {
      setIsVerifying(true)
      setError(null)
      setResult(null)

      const verifyResult = await onVerify(message, signature, address)
      setResult(verifyResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify signature')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleClear = () => {
    setMessage('')
    setSignature('')
    setAddress('')
    setResult(null)
    setError(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Verify Signature</CardTitle>
        </div>
        <CardDescription>
          Verify a signature to confirm message authenticity and recover the signer's address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Message Input */}
        <div className="space-y-2">
          <Label htmlFor="verify-message">Message</Label>
          <Textarea
            id="verify-message"
            placeholder="Enter the original message that was signed..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            disabled={isVerifying}
            className="font-mono text-sm"
          />
        </div>

        {/* Signature Input */}
        <div className="space-y-2">
          <Label htmlFor="signature">Signature</Label>
          <Textarea
            id="signature"
            placeholder="0x..."
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            rows={3}
            disabled={isVerifying}
            className="font-mono text-sm break-all"
          />
        </div>

        {/* Optional Address Input */}
        <div className="space-y-2">
          <Label htmlFor="expected-address">
            Expected Address <span className="text-xs text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="expected-address"
            placeholder="0x... (leave empty to recover from signature)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isVerifying}
            className="font-mono text-sm break-all"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <XCircle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Verification Result */}
        {result && (
          <div
            className={`p-4 rounded-lg border ${
              result.valid
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-destructive/10 border-destructive/20'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.valid ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <h3 className={`font-semibold text-sm ${
                  result.valid ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                }`}>
                  {result.valid ? '✓ Valid Signature' : '✗ Invalid Signature'}
                </h3>

                <div className="space-y-2 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Recovered Address:</p>
                    <code className="block p-2 bg-muted rounded break-all">
                      {result.recoveredAddress}
                    </code>
                  </div>

                  {result.user && (
                    <div className="pt-2 border-t">
                      <p className="text-muted-foreground mb-2">Matched User:</p>
                      <div className="space-y-1">
                        <p>
                          <span className="font-medium">User ID:</span> {result.user.userId}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {result.user.email}
                        </p>
                        <div>
                          <p className="font-medium mb-1">Address:</p>
                          <code className="block p-2 bg-muted rounded break-all text-xs">
                            {result.user.address}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}

                  {!result.valid && address && (
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      The signature does not match the expected address. The recovered address is
                      shown above.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleVerify}
            disabled={isVerifying || !message || !signature}
            className="flex-1"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Verify Signature
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleClear} disabled={isVerifying}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
