'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, PenTool } from 'lucide-react'

interface SignMessageProps {
  userId?: string
}

export function SignMessage({ userId: defaultUserId }: SignMessageProps) {
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(defaultUserId || '')
  const [message, setMessage] = useState('')
  const [signatureData, setSignatureData] = useState<any>(null)

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/users/${userId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signing failed')
      }

      setSignatureData(data)
      toast.success('✅ Message signed successfully!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign Message</CardTitle>
        <CardDescription>
          Sign a message using your TEE-backed private key
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSign} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sign-userId">User ID</Label>
            <Input
              id="sign-userId"
              placeholder="alice"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              placeholder="Hello, dstack!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {loading ? 'Signing...' : 'Sign Message'}
          </Button>
        </form>

        {signatureData && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <PenTool className="h-5 w-5" />
              <span className="font-bold">✅ Message Signed Successfully</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Message:</span>
                <p className="font-mono bg-background/50 p-2 rounded mt-1">
                  "{signatureData.message}"
                </p>
              </div>
              
              <div>
                <span className="text-muted-foreground">Signature:</span>
                <p className="font-mono text-xs bg-background/50 p-2 rounded mt-1 break-all">
                  {signatureData.signature}
                </p>
              </div>
              
              <div>
                <span className="text-muted-foreground">Signer Address:</span>
                <p className="font-mono text-xs bg-background/50 p-2 rounded mt-1 break-all">
                  {signatureData.address}
                </p>
              </div>
              
              {signatureData.publicKey && (
                <div>
                  <span className="text-muted-foreground">Public Key:</span>
                  <p className="font-mono text-xs bg-background/50 p-2 rounded mt-1 break-all">
                    {signatureData.publicKey}
                  </p>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground pt-2">
                Signed at: {new Date(signatureData.timestamp).toLocaleString()}
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>💡 Tip:</strong> Copy the signature and use it in the Verify tab to test verification!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}