'use client'

import { useState, useEffect } from 'react'
import { Clock, Shield, Copy, ChevronDown, ChevronUp, Download, Filter, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AuditLog {
  id: string
  operation: string
  createdAt: string
  address: string | null
  publicKey: string | null
  message: string | null
  signature: string | null
  attestationQuote: string | null
  eventLog: string | null
  applicationData: any
  attestationChecksum: string | null
  phalaVerificationUrl: string | null
  t16zVerificationUrl: string | null
  verificationStatus: string
}

interface AuditLogViewerProps {
  userId: string
}

export function AuditLogViewer({ userId }: AuditLogViewerProps) {
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAuditLogs()
  }, [userId, filter])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('operation', filter)
      }
      
      const response = await fetch(`/api/audit/${userId}?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch audit logs')
      }
      
      setLogs(data.logs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert(`${label} copied to clipboard`)
    } catch (err) {
      alert('Failed to copy to clipboard')
    }
  }

  const exportLogs = (format: 'json' | 'csv') => {
    let content: string
    let mimeType: string
    let filename: string

    if (format === 'json') {
      content = JSON.stringify(filteredLogs, null, 2)
      mimeType = 'application/json'
      filename = `audit-logs-${userId}-${Date.now()}.json`
    } else {
      // CSV export
      const headers = ['ID', 'Operation', 'Timestamp', 'Address', 'Message', 'Has Attestation', 'Verification Status', 'Checksum', 'Phala URL', 't16z URL']
      const rows = filteredLogs.map(log => [
        log.id,
        log.operation,
        log.createdAt,
        log.address || '',
        log.message || '',
        log.attestationQuote ? 'Yes' : 'No',
        log.verificationStatus || '',
        log.attestationChecksum || '',
        log.phalaVerificationUrl || '',
        log.t16zVerificationUrl || ''
      ])
      
      content = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      mimeType = 'text/csv'
      filename = `audit-logs-${userId}-${Date.now()}.csv`
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'signup': return 'bg-green-100 text-green-800'
      case 'sign': return 'bg-blue-100 text-blue-800'
      case 'verify': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredLogs = logs.filter(log => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        log.operation.toLowerCase().includes(search) ||
        log.message?.toLowerCase().includes(search) ||
        log.id.toLowerCase().includes(search)
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading audit logs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={fetchAuditLogs}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Audit Log Trail
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/audit')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 transition-colors"
            >
              <Search className="h-4 w-4" />
              Search Another User
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border rounded text-gray-900 bg-white"
            >
              <option value="all">All Operations</option>
              <option value="signup">Signup</option>
              <option value="sign">Sign</option>
              <option value="verify">Verify</option>
            </select>
          </div>
          
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1 border rounded flex-1 min-w-[200px] text-gray-900 bg-white"
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => exportLogs('json')}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export JSON
            </button>
            <button
              onClick={() => exportLogs('csv')}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Found {filteredLogs.length} audit log{filteredLogs.length !== 1 ? 's' : ''} for user: <span className="font-mono font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">{userId}</span>
          </p>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No audit logs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div key={log.id} className="border rounded-lg overflow-hidden">
              <div 
                className="p-4 bg-white hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleExpanded(log.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getOperationColor(log.operation)}`}>
                      {log.operation.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                    {log.attestationQuote && (
                      <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                        log.verificationStatus === 'verified' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        <Shield className="h-3 w-3" />
                        {log.verificationStatus === 'verified' ? 'Verified' : 'With Attestation'}
                      </span>
                    )}
                  </div>
                  {expandedLogs.has(log.id) ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                
                {log.message && (
                  <p className="mt-2 text-sm text-gray-700">
                    Message: <span className="font-mono">{log.message.substring(0, 50)}{log.message.length > 50 ? '...' : ''}</span>
                  </p>
                )}
              </div>
              
              {expandedLogs.has(log.id) && (
                <div className="border-t bg-gray-50 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {log.address && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600">Address</label>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm text-gray-900 break-all">{log.address}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(log.address, 'Address')
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {log.publicKey && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600">Public Key</label>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-xs text-gray-900 break-all">{log.publicKey.substring(0, 66)}...</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(log.publicKey, 'Public Key')
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {log.message && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Full Message</label>
                      <p className="font-mono text-sm text-gray-900 bg-white p-2 rounded border border-gray-300 break-all">{log.message}</p>
                    </div>
                  )}
                  
                  {log.signature && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Signature</label>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs text-gray-900 bg-white p-2 rounded border border-gray-300 break-all flex-1">
                          {log.signature}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(log.signature, 'Signature')
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {log.attestationQuote && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600">Attestation Quote</label>
                        <div className="flex items-center gap-2">
                          <div className="font-mono text-xs text-gray-900 bg-yellow-50 p-2 rounded border border-yellow-200 break-all flex-1 max-h-32 overflow-y-auto">
                            {log.attestationQuote.substring(0, 200)}...
                            <details className="mt-2">
                              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Show full quote</summary>
                              <div className="mt-2 text-gray-900">{log.attestationQuote}</div>
                            </details>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(log.attestationQuote, 'Attestation Quote')
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {log.attestationChecksum && (
                        <div>
                          <label className="text-xs font-semibold text-gray-600">Attestation Checksum</label>
                          <p className="font-mono text-xs text-gray-900 bg-gray-50 p-2 rounded border border-gray-300 break-all">
                            {log.attestationChecksum}
                          </p>
                        </div>
                      )}
                      
                      {(log.phalaVerificationUrl || log.t16zVerificationUrl) && (
                        <div>
                          <label className="text-xs font-semibold text-gray-600">Verification Links</label>
                          <div className="space-y-2 mt-1">
                            {log.phalaVerificationUrl && (
                              <a
                                href={log.phalaVerificationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-blue-600 hover:text-blue-800 underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                🔗 Verify on Phala Cloud →
                              </a>
                            )}
                            {log.t16zVerificationUrl && (
                              <a
                                href={log.t16zVerificationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-blue-600 hover:text-blue-800 underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                🔍 Verify on t16z Explorer →
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {log.verificationStatus && (
                        <div>
                          <label className="text-xs font-semibold text-gray-600">Verification Status</label>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            log.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                            log.verificationStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {log.verificationStatus.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {log.applicationData && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Application Data</label>
                      <pre className="text-xs text-gray-900 bg-white p-2 rounded border border-gray-300 overflow-x-auto">
                        {JSON.stringify(log.applicationData, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Log ID: {log.id}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}