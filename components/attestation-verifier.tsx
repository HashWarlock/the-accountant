'use client'

import { useState } from 'react'
import { Shield, CheckCircle, XCircle, Info, Copy, FileText } from 'lucide-react'

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
      alert(`${label} copied to clipboard`)
    } catch (err) {
      alert('Failed to copy to clipboard')
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
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Attestation Quote Verifier
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Attestation Quote (Hex)
            </label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Enter hex-encoded attestation quote (with or without 0x prefix)"
              className="w-full px-3 py-2 border rounded-lg h-32 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Event Log (Optional)
            </label>
            <textarea
              value={eventLog}
              onChange={(e) => setEventLog(e.target.value)}
              placeholder="Enter hex-encoded event log (optional)"
              className="w-full px-3 py-2 border rounded-lg h-20 font-mono text-xs"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Verify Attestation Quote
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <div className={`p-4 rounded-lg border ${result.verified ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-3">
                  {result.verified ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">
                      {result.verified ? 'Quote Verified' : 'Verification Failed'}
                    </h3>
                    <p className="text-sm text-gray-600">{result.message}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}