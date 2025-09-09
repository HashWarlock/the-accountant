'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Shield, X } from 'lucide-react'

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
      toast.success(data.isValid ? 'Signature is valid!' : 'Signature is invalid')
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
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
            <div className={`flex items-center gap-2 ${verificationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
              {verificationResult.isValid ? <Shield className="h-4 w-4" /> : <X className="h-4 w-4" />}
              <span className="font-medium">
                {verificationResult.isValid ? 'Valid Signature' : 'Invalid Signature'}
              </span>
            </div>
            {verificationResult.user && (
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">User:</span> {verificationResult.user.userId}
                </p>
                <p className="font-mono text-xs">
                  <span className="text-muted-foreground">Address:</span> {verificationResult.user.address}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}