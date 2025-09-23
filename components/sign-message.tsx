'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, PenTool, Shield, ExternalLink, Copy, CheckCircle } from 'lucide-react'

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
      toast.success('Message signed successfully!')
      
      // Show verification link in toast if available
      if (data.t16zVerificationUrl) {
        toast.info('Attestation generated! Check verification links below.')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-gray-900/10 flex items-center justify-center">
            <PenTool className="h-6 w-6 text-gray-900" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Sign Message</h2>
          <p className="text-gray-600">
            Cryptographically sign a message using your TEE-backed private key
          </p>
        </div>
        <div className="space-y-6">
          <form onSubmit={handleSign} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sign-userId" className="text-sm font-medium">User ID</Label>
              <Input
                id="sign-userId"
                placeholder="alice"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                disabled={loading}
                className="h-11 w-full max-w-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">Message</Label>
              <Input
                id="message"
                placeholder="Hello, dstack!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={loading}
                className="h-11 w-full max-w-md"
              />
            </div>
            <Button type="submit" className="w-full max-w-md h-11" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Signing...' : 'Sign Message'}
            </Button>
          </form>
        </div>
      </div>

      {signatureData && (
        <div className="bg-white/80 backdrop-blur border border-blue-200 rounded-2xl p-6 space-y-6">
          <div className="flex items-center space-x-2 text-blue-700">
            <CheckCircle className="h-5 w-5" />
            <h3 className="text-blue-900 font-semibold">Message Signed Successfully</h3>
          </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Message
                </Label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white rounded-md border text-sm font-mono">
                    "{signatureData.message}"
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(signatureData.message, 'Message')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Signature
                </Label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white rounded-md border text-xs font-mono break-all">
                    {signatureData.signature}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(signatureData.signature, 'Signature')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Signer Address
                </Label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white rounded-md border text-xs font-mono break-all">
                    {signatureData.address}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(signatureData.address, 'Address')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {signatureData.publicKey && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Public Key
                  </Label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-white rounded-md border text-xs font-mono break-all">
                      {signatureData.publicKey}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(signatureData.publicKey, 'Public Key')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                Signed at: {new Date(signatureData.timestamp).toLocaleString()}
              </div>
            </div>

            {/* Attestation Verification Links */}
            {(signatureData.phalaVerificationUrl || signatureData.t16zVerificationUrl) && (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2 text-green-700">
                    <Shield className="h-4 w-4" />
                    <CardTitle className="text-sm text-green-900">TEE Attestation Generated</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex flex-col gap-2">
                    {signatureData.t16zVerificationUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={signatureData.t16zVerificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="justify-start"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Verify on t16z Explorer
                        </a>
                      </Button>
                    )}
                    {signatureData.phalaVerificationUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={signatureData.phalaVerificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="justify-start"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Verify on Phala Cloud
                        </a>
                      </Button>
                    )}
                  </div>
                  {signatureData.attestation?.checksum && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Attestation Checksum
                      </Label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 px-3 py-2 bg-white rounded-md border text-xs font-mono break-all">
                          {signatureData.attestation.checksum}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(signatureData.attestation.checksum, 'Checksum')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>💡 Tip:</strong> Copy the signature and use it in the Verify tab to test verification!
              </p>
            </div>
        </div>
      )}
    </div>
  )
}