'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, PenTool, Shield, ExternalLink } from 'lucide-react'

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
      
      // Show verification link in toast if available
      if (data.t16zVerificationUrl) {
        toast.info(
          <div className="flex flex-col gap-2">
            <span>🔗 Attestation generated!</span>
            <a 
              href={data.t16zVerificationUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 underline text-xs"
            >
              Verify on t16z Explorer →
            </a>
          </div>,
          { duration: 10000 }
        )
      }
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
            
            {/* Attestation Verification Links */}
            {(signatureData.phalaVerificationUrl || signatureData.t16zVerificationUrl) && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded space-y-2">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Shield className="h-4 w-4" />
                  <span className="font-semibold text-sm">TEE Attestation Generated</span>
                </div>
                <div className="flex flex-col gap-2">
                  {signatureData.t16zVerificationUrl && (
                    <a
                      href={signatureData.t16zVerificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Verify on t16z Explorer
                    </a>
                  )}
                  {signatureData.phalaVerificationUrl && (
                    <a
                      href={signatureData.phalaVerificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Verify on Phala Cloud
                    </a>
                  )}
                </div>
                {signatureData.attestation?.checksum && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Checksum:</span>
                    <p className="font-mono text-xs bg-background/50 p-1 rounded mt-1 break-all">
                      {signatureData.attestation.checksum}
                    </p>
                  </div>
                )}
              </div>
            )}
            
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