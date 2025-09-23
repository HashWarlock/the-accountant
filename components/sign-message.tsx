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
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-2xl bg-phala-g09/20 backdrop-blur-sm flex items-center justify-center border border-phala-g08/30">
            <PenTool className="h-7 w-7 text-phala-lime" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-phala-g00">Sign Message</h2>
          <p className="text-phala-g02">
            Cryptographically sign a message using your TEE-backed private key
          </p>
        </div>
        <div className="space-y-6">
          <form onSubmit={handleSign} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sign-userId" className="text-sm font-medium text-phala-g01">User ID</Label>
              <Input
                id="sign-userId"
                placeholder="alice"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                disabled={loading}
                className="h-12 w-full max-w-sm mx-auto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium text-phala-g01">Message</Label>
              <Input
                id="message"
                placeholder="Hello, dstack!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={loading}
                className="h-12 w-full max-w-sm mx-auto"
              />
            </div>
            <Button type="submit" className="w-full max-w-sm h-12 mx-auto" variant="phala" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Signing...' : 'Sign Message'}
            </Button>
          </form>
        </div>
      </div>

      {signatureData && (
        <div className="bg-phala-g00/95 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-xl border border-phala-lime/20">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg">Message Signed Successfully</h3>
          </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Message
                </Label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-mono hover:bg-slate-100 transition-colors duration-200">
                    "{signatureData.message}"
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(signatureData.message, 'Message')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Signature
                </Label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono break-all hover:bg-slate-100 transition-colors duration-200">
                    {signatureData.signature}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(signatureData.signature, 'Signature')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Signer Address
                </Label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono break-all hover:bg-slate-100 transition-colors duration-200">
                    {signatureData.address}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(signatureData.address, 'Address')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {signatureData.publicKey && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Public Key
                  </Label>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono break-all hover:bg-slate-100 transition-colors duration-200">
                      {signatureData.publicKey}
                    </code>
                    <Button
                      variant="ghost"
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
              <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg shadow-emerald-100/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    <CardTitle className="text-base font-bold text-slate-900">TEE Attestation Generated</CardTitle>
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
                      <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Attestation Checksum
                      </Label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono break-all hover:bg-slate-100 transition-colors duration-200">
                          {signatureData.attestation.checksum}
                        </code>
                        <Button
                          variant="ghost"
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

            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl">
              <p className="text-sm text-amber-900 font-medium">
                <strong>💡 Tip:</strong> Copy the signature and use it in the Verify tab to test verification!
              </p>
            </div>
        </div>
      )}
    </div>
  )
}