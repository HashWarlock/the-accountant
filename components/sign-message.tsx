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
    <Card className="w-full max-w-lg border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-8">
        <div className="space-y-3">
          <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center">
            <PenTool className="h-6 w-6 text-cyan-700" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Sign Message</CardTitle>
          <CardDescription className="text-slate-600 text-base">
            Cryptographically sign a message using your TEE-backed private key
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSign} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="sign-userId" className="text-slate-700 font-semibold">User ID</Label>
            <Input
              id="sign-userId"
              placeholder="alice"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              disabled={loading}
              className="h-12 border-2 border-slate-200 rounded-xl focus:border-cyan-400 focus:ring-0 transition-all duration-200"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="message" className="text-slate-700 font-semibold">Message</Label>
            <Input
              id="message"
              placeholder="Hello, dstack!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={loading}
              className="h-12 border-2 border-slate-200 rounded-xl focus:border-cyan-400 focus:ring-0 transition-all duration-200"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin mr-2" />}
            {loading ? 'Signing...' : 'Sign Message'}
          </Button>
        </form>

        {signatureData && (
          <div className="mt-8 p-6 bg-cyan-50 rounded-2xl border-2 border-cyan-200 space-y-4">
            <div className="flex items-center gap-3 text-cyan-700">
              <PenTool className="h-6 w-6" />
              <span className="font-bold text-lg">Message Signed Successfully</span>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-cyan-700 font-semibold block mb-2">Message:</span>
                <p className="font-mono bg-white p-3 rounded-xl border border-cyan-200 text-slate-900">
                  "{signatureData.message}"
                </p>
              </div>
              
              <div>
                <span className="text-cyan-700 font-semibold block mb-2">Signature:</span>
                <p className="font-mono text-xs bg-white p-3 rounded-xl border border-cyan-200 break-all text-slate-900">
                  {signatureData.signature}
                </p>
              </div>
              
              <div>
                <span className="text-cyan-700 font-semibold block mb-2">Signer Address:</span>
                <p className="font-mono text-xs bg-white p-3 rounded-xl border border-cyan-200 break-all text-slate-900">
                  {signatureData.address}
                </p>
              </div>
              
              {signatureData.publicKey && (
                <div>
                  <span className="text-cyan-700 font-semibold block mb-2">Public Key:</span>
                  <p className="font-mono text-xs bg-white p-3 rounded-xl border border-cyan-200 break-all text-slate-900">
                    {signatureData.publicKey}
                  </p>
                </div>
              )}
              
              <div className="text-sm text-cyan-600 pt-2 font-medium">
                Signed at: {new Date(signatureData.timestamp).toLocaleString()}
              </div>
            </div>
            
            {/* Attestation Verification Links */}
            {(signatureData.phalaVerificationUrl || signatureData.t16zVerificationUrl) && (
              <div className="mt-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center gap-3 text-emerald-700">
                  <Shield className="h-5 w-5" />
                  <span className="font-bold text-sm">TEE Attestation Generated</span>
                </div>
                <div className="flex flex-col gap-3">
                  {signatureData.t16zVerificationUrl && (
                    <a
                      href={signatureData.t16zVerificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Verify on t16z Explorer
                    </a>
                  )}
                  {signatureData.phalaVerificationUrl && (
                    <a
                      href={signatureData.phalaVerificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Verify on Phala Cloud
                    </a>
                  )}
                </div>
                {signatureData.attestation?.checksum && (
                  <div className="mt-3">
                    <span className="text-emerald-700 font-semibold block mb-2">Checksum:</span>
                    <p className="font-mono text-xs bg-white p-2 rounded-lg border border-emerald-200 break-all text-slate-900">
                      {signatureData.attestation.checksum}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Copy the signature and use it in the Verify tab to test verification!
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}