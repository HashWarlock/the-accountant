'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, PenTool, Shield, ExternalLink, Copy, CheckCircle } from 'lucide-react'
import { CollapsibleDetails, DetailItem } from '@/components/ui/collapsible-details'
import { motion, AnimatePresence } from 'framer-motion'

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
            <PenTool className="h-8 w-8 text-phala-lime" />
          </div>
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-br from-phala-g00 to-phala-g01 bg-clip-text text-transparent">Sign Message</h2>
          <p className="text-phala-g02 max-w-md mx-auto">
            Cryptographically sign a message using your TEE-backed private key
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-phala-g09/5 backdrop-blur-sm rounded-2xl p-8 border border-phala-g08/20"
      >
        <form onSubmit={handleSign} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sign-userId" className="flex items-center gap-2 text-phala-g01">
              User ID
            </Label>
            <Input
              id="sign-userId"
              placeholder="alice"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              disabled={loading}
              className="h-12 bg-phala-g09/10 border-phala-g08/30 focus:border-phala-lime transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2 text-phala-g01">Message</Label>
            <Input
              id="message"
              placeholder="Hello, dstack!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={loading}
              className="h-12 bg-phala-g09/10 border-phala-g08/30 focus:border-phala-lime transition-colors"
            />
          </div>
          <Button type="submit" className="w-full h-12" variant="phala" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? 'Signing...' : 'Sign Message'}
          </Button>
        </form>
      </motion.div>

      <AnimatePresence>
        {signatureData && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <CollapsibleDetails
              title="Message Signed Successfully!"
              summary={`"${signatureData.message}" • ${signatureData.signature.slice(0, 10)}...`}
              defaultOpen={true}
              icon={<CheckCircle className="h-6 w-6 text-phala-lime" />}
              badge={
                <Badge variant="outline" className="border-phala-lime/30 text-phala-lime bg-phala-lime/10">
                  Signed
                </Badge>
              }
              className="border-phala-lime/30 bg-gradient-to-br from-phala-lime/10 to-phala-g09/10"
            >
              <div className="grid gap-3">
                <DetailItem
                  label="Message"
                  value={`"${signatureData.message}"`}
                  onCopy={() => copyToClipboard(signatureData.message, 'Message')}
                />
                <DetailItem
                  label="Signature"
                  value={signatureData.signature}
                  onCopy={() => copyToClipboard(signatureData.signature, 'Signature')}
                  mono
                />
                <DetailItem
                  label="Signer Address"
                  value={signatureData.address}
                  onCopy={() => copyToClipboard(signatureData.address, 'Address')}
                  mono
                />
                {signatureData.publicKey && (
                  <DetailItem
                    label="Public Key"
                    value={signatureData.publicKey}
                    onCopy={() => copyToClipboard(signatureData.publicKey, 'Public Key')}
                    mono
                  />
                )}
              </div>

              <div className="text-sm text-phala-g02 mt-2">
                Signed at: {new Date(signatureData.timestamp).toLocaleString()}
              </div>

              {/* Attestation Verification Links */}
              {(signatureData.phalaVerificationUrl || signatureData.t16zVerificationUrl) && (
                <Card className="border-phala-lime/30 bg-gradient-to-br from-phala-lime/10 to-phala-g09/10 shadow-lg shadow-phala-lime/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-phala-lime" />
                      <CardTitle className="text-base font-bold text-phala-g00">TEE Attestation Generated</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex flex-col gap-2">
                      {signatureData.t16zVerificationUrl && (
                        <Button variant="outline" size="sm" asChild className="border-phala-g08/30 hover:border-phala-lime hover:bg-phala-lime/10">
                          <a
                            href={signatureData.t16zVerificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="justify-start text-phala-g01"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Verify on t16z Explorer
                          </a>
                        </Button>
                      )}
                      {signatureData.phalaVerificationUrl && (
                        <Button variant="outline" size="sm" asChild className="border-phala-g08/30 hover:border-phala-lime hover:bg-phala-lime/10">
                          <a
                            href={signatureData.phalaVerificationUrl}
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
                    {signatureData.attestation?.checksum && (
                      <DetailItem
                        label="Attestation Checksum"
                        value={signatureData.attestation.checksum}
                        onCopy={() => copyToClipboard(signatureData.attestation.checksum, 'Checksum')}
                        mono
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              <Alert className="border-phala-lime/30 bg-gradient-to-r from-phala-lime/10 to-phala-g09/10">
                <AlertDescription className="text-sm text-phala-g01">
                  <strong className="text-phala-lime">💡 Tip:</strong> Copy the signature and use it in the Verify tab to test verification!
                </AlertDescription>
              </Alert>
            </CollapsibleDetails>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}