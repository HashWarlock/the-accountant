'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Shield, CheckCircle, X, ExternalLink, Copy } from 'lucide-react'

export function VerifySignature() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [addressOrUserId, setAddressOrUserId] = useState('')
  const [verificationResult, setVerificationResult] = useState<any>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setVerificationResult(null)

    try {
      const body: any = { message, signature }
      
      if (addressOrUserId.startsWith('0x')) {
        body.address = addressOrUserId
      } else {
        body.userId = addressOrUserId
      }

      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setVerificationResult(data)
      if (data.valid) {
        toast.success('Signature is valid!')
        if (data.t16zVerificationUrl) {
          toast.info('Attestation generated! Check verification links below.')
        }
      } else {
        toast.error('Signature is invalid!')
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
            <Shield className="h-6 w-6 text-gray-900" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Verify Signature</h2>
          <p className="text-gray-600">
            Verify a cryptographic signature using an address or user ID
          </p>
        </div>
        <div className="space-y-6">
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="verify-message" className="text-sm font-medium">Message</Label>
              <Input
                id="verify-message"
                placeholder="Hello, dstack!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={loading}
                className="h-11 w-80"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signature" className="text-sm font-medium">Signature</Label>
              <Input
                id="signature"
                placeholder="0x..."
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                required
                disabled={loading}
                className="h-11 w-80"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressOrUserId" className="text-sm font-medium">Address or User ID</Label>
              <Input
                id="addressOrUserId"
                placeholder="0x... or alice"
                value={addressOrUserId}
                onChange={(e) => setAddressOrUserId(e.target.value)}
                required
                disabled={loading}
                className="h-11 w-80"
              />
            </div>
            <Button type="submit" className="w-80 h-11" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Verifying...' : 'Verify Signature'}
            </Button>
          </form>
        </div>
      </div>

      {verificationResult && (
        <Card className={verificationResult.valid ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
          <CardHeader>
            <div className={`flex items-center space-x-2 ${verificationResult.valid ? 'text-green-700' : 'text-red-700'}`}>
              {verificationResult.valid ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
              <CardTitle className={verificationResult.valid ? 'text-green-900' : 'text-red-900'}>
                {verificationResult.valid ? 'Signature Valid' : 'Signature Invalid'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Message
                </Label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white rounded-md border text-sm font-mono">
                    "{verificationResult.message}"
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(verificationResult.message, 'Message')}
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
                    {verificationResult.signature}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(verificationResult.signature, 'Signature')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {verificationResult.valid && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Verified Address
                    </Label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 bg-white rounded-md border text-xs font-mono break-all">
                        {verificationResult.address}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(verificationResult.address, 'Address')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {verificationResult.userId && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        User ID
                      </Label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 px-3 py-2 bg-white rounded-md border text-sm font-mono">
                          {verificationResult.userId}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(verificationResult.userId, 'User ID')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    Verified at: {new Date(verificationResult.timestamp).toLocaleString()}
                  </div>
                </>
              )}
            </div>

            {/* Attestation Verification Links */}
            {verificationResult.valid && (verificationResult.phalaVerificationUrl || verificationResult.t16zVerificationUrl) && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <Shield className="h-4 w-4" />
                    <CardTitle className="text-sm text-blue-900">TEE Attestation Generated</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex flex-col gap-2">
                    {verificationResult.t16zVerificationUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={verificationResult.t16zVerificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="justify-start"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Verify on t16z Explorer
                        </a>
                      </Button>
                    )}
                    {verificationResult.phalaVerificationUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={verificationResult.phalaVerificationUrl}
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
                  {verificationResult.attestation?.checksum && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Attestation Checksum
                      </Label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 px-3 py-2 bg-white rounded-md border text-xs font-mono break-all">
                          {verificationResult.attestation.checksum}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(verificationResult.attestation.checksum, 'Checksum')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}