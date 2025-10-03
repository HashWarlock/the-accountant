import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Shield,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Hash,
  Key,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { formatTokenAmount } from '../utils/format'

interface AuditLogEntry {
  id: string
  operation: string
  attestationQuote: string | null
  eventLog: string | null
  applicationData: any
  address: string | null
  publicKey: string | null
  message: string | null
  signature: string | null
  attestationChecksum: string | null
  phalaVerificationUrl: string | null
  t16zVerificationUrl: string | null
  verificationStatus: string
  quoteUploadedAt: string | null
  createdAt: string
}

interface AuditLogProps {
  sessionToken: string | null
}

export function AuditLog({ sessionToken }: AuditLogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  })

  useEffect(() => {
    fetchAuditLogs()
  }, [sessionToken])

  const fetchAuditLogs = async (offset = 0) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/audit/logs?limit=50&offset=${offset}`, {
        headers: {
          ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` }),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs')
      }

      const data = await response.json()
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId)
  }

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'signup':
        return <Key className="h-4 w-4" />
      case 'sign':
        return <FileText className="h-4 w-4" />
      case 'contract_execute':
        return <Hash className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getOperationLabel = (operation: string) => {
    switch (operation) {
      case 'signup':
        return 'Wallet Created'
      case 'sign':
        return 'Message Signed'
      case 'contract_execute':
        return 'Contract Execution'
      default:
        return operation
    }
  }

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'signup':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
      case 'sign':
        return 'bg-green-500/10 text-green-600 dark:text-green-400'
      case 'contract_execute':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const shortenHash = (hash: string, chars = 6) => {
    return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`
  }

  if (loading && logs.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Audit Log</CardTitle>
        </div>
        <CardDescription>
          All wallet actions with TEE attestations and remote verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm">No audit logs yet</p>
          </div>
        ) : (
          <>
            {logs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${getOperationColor(log.operation)}`}>
                      {getOperationIcon(log.operation)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-sm">
                          {getOperationLabel(log.operation)}
                        </h3>
                        {log.attestationQuote && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Shield className="h-3 w-3" />
                            TEE Attested
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(log.createdAt)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(log.id)}
                    className="shrink-0"
                  >
                    {expandedLog === log.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Expanded Details */}
                {expandedLog === log.id && (
                  <div className="space-y-3 pt-3 border-t text-xs">
                    {/* Address */}
                    {log.address && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium">Wallet Address</p>
                        <code className="block p-2 bg-muted rounded text-xs break-all">
                          {log.address}
                        </code>
                      </div>
                    )}

                    {/* Public Key */}
                    {log.publicKey && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium">Public Key</p>
                        <code className="block p-2 bg-muted rounded text-xs break-all">
                          {log.publicKey}
                        </code>
                      </div>
                    )}

                    {/* Message (for sign operations) */}
                    {log.message && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium">Message Signed</p>
                        <div className="p-2 bg-muted rounded max-h-32 overflow-y-auto">
                          <p className="text-xs break-words">{log.message}</p>
                        </div>
                      </div>
                    )}

                    {/* Signature */}
                    {log.signature && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium">Signature</p>
                        <code className="block p-2 bg-muted rounded text-xs break-all">
                          {log.signature}
                        </code>
                      </div>
                    )}

                    {/* Application Data */}
                    {log.applicationData && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground font-medium">Application Data</p>
                        <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.applicationData, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Attestation Info */}
                    {log.attestationQuote && (
                      <div className="space-y-2">
                        <p className="text-muted-foreground font-medium">TEE Attestation</p>

                        {/* Attestation Checksum */}
                        {log.attestationChecksum && (
                          <div className="flex items-center gap-2 p-2 bg-blue-500/5 border border-blue-500/20 rounded">
                            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                Attestation Checksum
                              </p>
                              <code className="text-xs text-muted-foreground break-all">
                                {shortenHash(log.attestationChecksum, 8)}
                              </code>
                            </div>
                          </div>
                        )}

                        {/* Verification Links */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          {log.phalaVerificationUrl && (
                            <a
                              href={log.phalaVerificationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded text-xs transition-colors"
                            >
                              <Shield className="h-3 w-3" />
                              Verify on Phala Cloud
                              <ExternalLink className="h-3 w-3 ml-auto" />
                            </a>
                          )}
                          {log.t16zVerificationUrl && (
                            <a
                              href={log.t16zVerificationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded text-xs transition-colors"
                            >
                              <Shield className="h-3 w-3" />
                              Verify on t16z Explorer
                              <ExternalLink className="h-3 w-3 ml-auto" />
                            </a>
                          )}
                        </div>

                        {/* Quote Preview */}
                        <details className="group">
                          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground p-2 bg-muted rounded">
                            View Full Attestation Quote
                          </summary>
                          <code className="block mt-2 p-2 bg-muted rounded text-xs break-all max-h-40 overflow-y-auto">
                            {log.attestationQuote}
                          </code>
                        </details>

                        {/* Event Log */}
                        {log.eventLog && (
                          <details className="group">
                            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground p-2 bg-muted rounded">
                              View Event Log
                            </summary>
                            <code className="block mt-2 p-2 bg-muted rounded text-xs break-all max-h-40 overflow-y-auto">
                              {log.eventLog}
                            </code>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {pagination.hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchAuditLogs(pagination.offset + pagination.limit)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}

            {/* Total Count */}
            <div className="text-center text-xs text-muted-foreground pt-2">
              Showing {logs.length} of {pagination.total} logs
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
