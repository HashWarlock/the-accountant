'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Shield, X, ExternalLink } from 'lucide-react'

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
        toast.success('✅ Signature is valid!')
        
        // Show verification link in toast if available
        if (data.t16zVerificationUrl) {
          toast.info(
            <div className="flex flex-col gap-2">
              <span>🔗 Attestation generated for verification!</span>
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
      } else {
        toast.error('❌ Signature is invalid!')
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
        <CardTitle>Verify Signature</CardTitle>
        <CardDescription>
          Verify a message signature against an address or user ID
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verify-message">Message</Label>
            <Input
              id="verify-message"
              placeholder="Hello, dstack!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signature">Signature</Label>
            <Input
              id="signature"
              placeholder="0x..."
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressOrUserId">Address or User ID</Label>
            <Input
              id="addressOrUserId"
              placeholder="0x... or alice"
              value={addressOrUserId}
              onChange={(e) => setAddressOrUserId(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {loading ? 'Verifying...' : 'Verify Signature'}
          </Button>
        </form>

        {verificationResult && (
          <div className={`mt-6 p-4 rounded-lg space-y-3 ${
            verificationResult.valid 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <div className={`flex items-center gap-2 ${verificationResult.valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {verificationResult.valid ? <Shield className="h-5 w-5" /> : <X className="h-5 w-5" />}
              <span className="font-bold text-lg">
                {verificationResult.valid ? '✅ Valid Signature' : '❌ Invalid Signature'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              {verificationResult.userId && (
                <div>
                  <span className="text-muted-foreground">User ID:</span>
                  <p className="font-mono bg-background/50 p-2 rounded mt-1">
                    {verificationResult.userId}
                  </p>
                </div>
              )}
              
              <div>
                <span className="text-muted-foreground">Expected Address:</span>
                <p className="font-mono text-xs bg-background/50 p-2 rounded mt-1 break-all">
                  {verificationResult.expectedAddress}
                </p>
              </div>
              
              {verificationResult.publicKey && (
                <div>
                  <span className="text-muted-foreground">Public Key:</span>
                  <p className="font-mono text-xs bg-background/50 p-2 rounded mt-1 break-all">
                    {verificationResult.publicKey}
                  </p>
                </div>
              )}
              
              {verificationResult.recoveredAddress && !verificationResult.valid && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>⚠️ Mismatch Detected:</strong>
                  </p>
                  <p className="font-mono text-xs mt-1 break-all">
                    Actual signer: {verificationResult.recoveredAddress}
                  </p>
                  <p className="text-xs mt-1">
                    {verificationResult.error}
                  </p>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground pt-2">
                Verified at: {new Date(verificationResult.timestamp).toLocaleString()}
              </div>
            </div>
            
            {/* Attestation Verification Links */}
            {(verificationResult.phalaVerificationUrl || verificationResult.t16zVerificationUrl) && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded space-y-2">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Shield className="h-4 w-4" />
                  <span className="font-semibold text-sm">TEE Attestation for Verification</span>
                </div>
                <div className="flex flex-col gap-2">
                  {verificationResult.t16zVerificationUrl && (
                    <a
                      href={verificationResult.t16zVerificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Verify on t16z Explorer
                    </a>
                  )}
                  {verificationResult.phalaVerificationUrl && (
                    <a
                      href={verificationResult.phalaVerificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Verify on Phala Cloud
                    </a>
                  )}
                </div>
                {verificationResult.attestation?.checksum && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Checksum:</span>
                    <p className="font-mono text-xs bg-background/50 p-1 rounded mt-1 break-all">
                      {verificationResult.attestation.checksum}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}