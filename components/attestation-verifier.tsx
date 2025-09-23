'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Shield, CheckCircle, XCircle, Info, Copy, FileText, Loader2 } from 'lucide-react'

interface VerificationResult {
  verified: boolean
  trustLevel: string
  details: {
    teeType: string
    quoteStatus: string
    signatureValid: boolean
    measurements: {
      mrEnclave: string
      mrSigner: string
      isvProdId: number
      isvSvn: number
    }
    platformInfo: {
      sgxEnabled: boolean
      tdxEnabled: boolean
      sevEnabled: boolean
    }
    timestamp: string
    isRecent: boolean
  }
  message: string
  note: string
}

export function AttestationVerifier() {
  const [quote, setQuote] = useState('')
  const [eventLog, setEventLog] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async () => {
    if (!quote.trim()) {
      setError('Please enter an attestation quote')
      return
    }

    // Ensure quote starts with 0x
    const formattedQuote = quote.startsWith('0x') ? quote : `0x${quote}`

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/attestation/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quote: formattedQuote,
          eventLog: eventLog || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify attestation')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const getTrustLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-orange-600 bg-orange-100'
      default: return 'text-red-600 bg-red-100'
    }
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
          <h2 className="text-2xl font-semibold text-gray-900">Attestation Verifier</h2>
          <p className="text-gray-600">
            Verify TEE attestation quotes and validate platform trust
          </p>
        </div>
      </div>
      <div className="space-y-6 max-w-2xl mx-auto">
          <div className="space-y-2">
            <Label htmlFor="quote" className="text-sm font-medium">Attestation Quote (Hex)</Label>
            <textarea
              id="quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Enter hex-encoded attestation quote (with or without 0x prefix)"
              className="w-full px-3 py-3 border border-input rounded-md h-32 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventLog" className="text-sm font-medium">Event Log (Optional)</Label>
            <textarea
              id="eventLog"
              value={eventLog}
              onChange={(e) => setEventLog(e.target.value)}
              placeholder="Enter hex-encoded event log (optional)"
              className="w-full px-3 py-3 border border-input rounded-md h-20 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading}
            className="w-full h-11"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Verify Attestation Quote
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              {error}
            </div>
          )}
      </div>

      {result && (
        <Card className={result.verified ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
          <CardHeader>
            <div className={`flex items-center space-x-2 ${result.verified ? 'text-green-700' : 'text-red-700'}`}>
              {result.verified ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <CardTitle className={result.verified ? 'text-green-900' : 'text-red-900'}>
                {result.verified ? 'Quote Verified' : 'Verification Failed'}
              </CardTitle>
            </div>
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Verification Details</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Trust Level</label>
                    <div className={`inline-block px-2 py-1 rounded text-sm font-semibold ${getTrustLevelColor(result.trustLevel)}`}>
                      {result.trustLevel.toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">TEE Type</label>
                    <p className="text-sm font-medium">{result.details.teeType}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Quote Status</label>
                    <p className="text-sm font-medium">{result.details.quoteStatus}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Signature</label>
                    <p className="text-sm font-medium">
                      {result.details.signatureValid ? '✅ Valid' : '❌ Invalid'}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Timestamp</label>
                    <p className="text-sm font-medium">
                      {new Date(result.details.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Freshness</label>
                    <p className="text-sm font-medium">
                      {result.details.isRecent ? '✅ Recent' : '⚠️ Stale'}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-xs text-gray-600">Platform Capabilities</label>
                  <div className="flex gap-3 mt-1">
                    {result.details.platformInfo.sgxEnabled && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">SGX</span>
                    )}
                    {result.details.platformInfo.tdxEnabled && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">TDX</span>
                    )}
                    {result.details.platformInfo.sevEnabled && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">SEV</span>
                    )}
                  </div>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">TEE Measurements</summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <label className="text-xs text-gray-600">MR Enclave</label>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs break-all bg-white p-2 rounded border flex-1">
                          {result.details.measurements.mrEnclave}
                        </p>
                        <button
                          onClick={() => copyToClipboard(result.details.measurements.mrEnclave, 'MR Enclave')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">MR Signer</label>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs break-all bg-white p-2 rounded border flex-1">
                          {result.details.measurements.mrSigner}
                        </p>
                        <button
                          onClick={() => copyToClipboard(result.details.measurements.mrSigner, 'MR Signer')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              {result.note && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">{result.note}</p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}