'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Shield, CheckCircle, X, ExternalLink, Copy } from 'lucide-react'
import { CollapsibleDetails, DetailItem } from '@/components/ui/collapsible-details'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-phala-lime/20 to-phala-lime/10 backdrop-blur-sm flex items-center justify-center border border-phala-lime/30 shadow-lg shadow-phala-lime/20">
            <Shield className="h-8 w-8 text-phala-lime" />
          </div>
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-br from-phala-g00 to-phala-g01 bg-clip-text text-transparent">Verify Signature</h2>
          <p className="text-phala-g02 max-w-md mx-auto">
            Verify a cryptographic signature using an address or user ID
          </p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-phala-g09/5 backdrop-blur-sm rounded-2xl p-8 border border-phala-g08/20"
      >
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="verify-message" className="flex items-center gap-2 text-phala-g01">Message</Label>
            <Input
              id="verify-message"
              placeholder="Hello, dstack!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={loading}
              className="h-12 bg-phala-g09/10 border-phala-g08/30 focus:border-phala-lime transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signature" className="flex items-center gap-2 text-phala-g01">Signature</Label>
            <Input
              id="signature"
              placeholder="0x..."
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              required
              disabled={loading}
              className="h-12 bg-phala-g09/10 border-phala-g08/30 focus:border-phala-lime transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressOrUserId" className="flex items-center gap-2 text-phala-g01">Address or User ID</Label>
            <Input
              id="addressOrUserId"
              placeholder="0x... or alice"
              value={addressOrUserId}
              onChange={(e) => setAddressOrUserId(e.target.value)}
              required
              disabled={loading}
              className="h-12 bg-phala-g09/10 border-phala-g08/30 focus:border-phala-lime transition-colors"
            />
          </div>
          <Button type="submit" className="w-full h-12" variant="phala" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? 'Verifying...' : 'Verify Signature'}
          </Button>
        </form>
      </motion.div>

      <AnimatePresence>
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <CollapsibleDetails
              title={verificationResult.valid ? 'Signature Valid' : 'Signature Invalid'}
              summary={verificationResult.valid ? `Verified: ${verificationResult.expectedAddress.slice(0, 6)}...${verificationResult.expectedAddress.slice(-4)}` : 'Verification failed'}
              defaultOpen={true}
              icon={
                verificationResult.valid ? (
                  <CheckCircle className="h-6 w-6 text-phala-lime" />
                ) : (
                  <X className="h-6 w-6 text-red-500" />
                )
              }
              badge={
                <Badge
                  variant="outline"
                  className={verificationResult.valid ? "border-phala-lime/30 text-phala-lime bg-phala-lime/10" : "border-red-500/30 text-red-500 bg-red-500/10"}
                >
                  {verificationResult.valid ? 'Valid' : 'Invalid'}
                </Badge>
              }
              className={verificationResult.valid ? "border-phala-lime/30 bg-gradient-to-br from-phala-lime/10 to-phala-g09/10" : "border-red-500/30 bg-gradient-to-br from-red-500/10 to-phala-g09/10"}
            >
              <div className="grid gap-3">
                <DetailItem
                  label="Message"
                  value={`"${verificationResult.message}"`}
                  onCopy={() => copyToClipboard(verificationResult.message, 'Message')}
                />
                <DetailItem
                  label="Signature"
                  value={verificationResult.signature}
                  onCopy={() => copyToClipboard(verificationResult.signature, 'Signature')}
                  mono
                />

                {verificationResult.valid && (
                  <>
                    <DetailItem
                      label="Verified Address"
                      value={verificationResult.expectedAddress}
                      onCopy={() => copyToClipboard(verificationResult.expectedAddress, 'Address')}
                      mono
                    />
                    {verificationResult.userId && (
                      <DetailItem
                        label="User ID"
                        value={verificationResult.userId}
                        onCopy={() => copyToClipboard(verificationResult.userId, 'User ID')}
                      />
                    )}
                  </>
                )}
              </div>

              {verificationResult.valid && (
                <div className="text-sm text-phala-g02">
                  Verified at: {new Date(verificationResult.timestamp).toLocaleString()}
                </div>
              )}

              {/* Attestation Verification Links */}
              {verificationResult.valid && (verificationResult.phalaVerificationUrl || verificationResult.t16zVerificationUrl) && (
                <Card className="border-phala-lime/30 bg-gradient-to-br from-phala-lime/10 to-phala-g09/10 shadow-lg shadow-phala-lime/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-phala-lime" />
                      <CardTitle className="text-base font-bold text-phala-g00">TEE Attestation Generated</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex flex-col gap-2">
                      {verificationResult.t16zVerificationUrl && (
                        <Button variant="outline" size="sm" asChild className="border-phala-g08/30 hover:border-phala-lime hover:bg-phala-lime/10">
                          <a
                            href={verificationResult.t16zVerificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="justify-start text-phala-g01"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Verify on t16z Explorer
                          </a>
                        </Button>
                      )}
                      {verificationResult.phalaVerificationUrl && (
                        <Button variant="outline" size="sm" asChild className="border-phala-g08/30 hover:border-phala-lime hover:bg-phala-lime/10">
                          <a
                            href={verificationResult.phalaVerificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="justify-start text-phala-g01"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Verify on Phala Cloud
                          </a>
                        </Button>
                      )}
                    </div>
                    {verificationResult.attestation?.checksum && (
                      <DetailItem
                        label="Attestation Checksum"
                        value={verificationResult.attestation.checksum}
                        onCopy={() => copyToClipboard(verificationResult.attestation.checksum, 'Checksum')}
                        mono
                      />
                    )}
                  </CardContent>
                </Card>
              )}
            </CollapsibleDetails>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}