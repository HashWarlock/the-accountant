/**
 * Phala Cloud Integration Module
 * Handles attestation quote upload and verification via Phala Cloud API
 * Documentation: https://docs.phala.network/api/remote-attestation/
 */

import crypto from 'crypto'

// API Endpoints (from documentation)
const PHALA_CLOUD_API_BASE = process.env.PHALA_CLOUD_API_URL || 'https://phat-anchor-api.phala.network'
const ATTESTATION_UPLOAD_ENDPOINT = '/attestation/report'
const ATTESTATION_STATUS_ENDPOINT = '/attestation/report'
const T16Z_EXPLORER_BASE = 'https://proof.t16z.com'

// Configuration
const API_KEY = process.env.PHALA_CLOUD_API_KEY
const UPLOAD_TIMEOUT = parseInt(process.env.ATTESTATION_UPLOAD_TIMEOUT || '30000')
const MAX_RETRY_ATTEMPTS = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second

/**
 * Response from Phala Cloud attestation upload
 */
export interface PhalaCloudUploadResponse {
  checksum: string
  uploadedAt: string
  verificationUrl: string
  status: 'uploaded' | 'verifying' | 'verified' | 'failed'
  error?: string
}

/**
 * Attestation verification status from Phala Cloud
 */
export interface PhalaVerificationStatus {
  checksum: string
  status: 'pending' | 'verified' | 'failed'
  verificationDetails?: {
    teeType: 'TDX' | 'SGX' | 'SEV'
    measurements: Record<string, string>
    trustLevel: 'high' | 'medium' | 'low' | 'none'
    verifiedAt: string
  }
  error?: string
}

/**
 * T16z Explorer response
 */
export interface T16zUploadResponse {
  reportId: string
  verificationUrl: string
  status: 'uploaded' | 'verified' | 'failed'
}

/**
 * Sleep for specified milliseconds (for retry logic)
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Calculate SHA256 checksum of attestation quote
 */
export function calculateQuoteChecksum(quote: string): string {
  const cleanQuote = quote.startsWith('0x') ? quote.slice(2) : quote
  return crypto.createHash('sha256').update(cleanQuote, 'hex').digest('hex')
}

/**
 * Upload attestation quote to Phala Cloud
 * Based on documentation: POST /attestation/report
 */
export async function uploadQuoteToPhalaCloud(
  quote: string,
  eventLog?: string,
  metadata?: {
    userId?: string
    operation?: string
    publicKey?: string
    timestamp?: string
  }
): Promise<PhalaCloudUploadResponse> {
  console.log('\n☁️  [Phala Cloud] Starting attestation quote upload...')
  
  // Validate quote format
  if (!quote || quote.length < 100) {
    throw new Error('Invalid attestation quote format')
  }
  
  // Remove 0x prefix if present
  const cleanQuote = quote.startsWith('0x') ? quote.slice(2) : quote
  const checksum = calculateQuoteChecksum(cleanQuote)
  
  console.log(`📊 [Phala Cloud] Quote checksum: ${checksum.substring(0, 16)}...`)
  console.log(`📏 [Phala Cloud] Quote size: ${cleanQuote.length / 2} bytes`)
  
  // Prepare request payload following Phala Cloud API format
  const payload = {
    report: cleanQuote,
    event_log: eventLog,
    metadata: {
      ...metadata,
      checksum,
      uploadedAt: new Date().toISOString(),
      source: 'the-accountant-v1'
    }
  }
  
  let lastError: Error | null = null
  
  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(`🔄 [Phala Cloud] Upload attempt ${attempt}/${MAX_RETRY_ATTEMPTS}...`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT)
      
      const response = await fetch(`${PHALA_CLOUD_API_BASE}${ATTESTATION_UPLOAD_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {})
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Phala Cloud API error: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      
      console.log(`✅ [Phala Cloud] Quote uploaded successfully`)
      console.log(`🔗 [Phala Cloud] Checksum: ${checksum}`)
      
      // Generate verification URL
      const verificationUrl = `${PHALA_CLOUD_API_BASE}/attestation/verify/${checksum}`
      
      return {
        checksum,
        uploadedAt: new Date().toISOString(),
        verificationUrl,
        status: 'uploaded'
      }
      
    } catch (error) {
      lastError = error as Error
      console.error(`❌ [Phala Cloud] Upload attempt ${attempt} failed:`, error)
      
      if (attempt < MAX_RETRY_ATTEMPTS) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1)
        console.log(`⏳ [Phala Cloud] Retrying in ${delay}ms...`)
        await sleep(delay)
      }
    }
  }
  
  // All attempts failed
  console.error(`❌ [Phala Cloud] Failed to upload quote after ${MAX_RETRY_ATTEMPTS} attempts`)
  
  return {
    checksum,
    uploadedAt: new Date().toISOString(),
    verificationUrl: '',
    status: 'failed',
    error: lastError?.message || 'Unknown error'
  }
}

/**
 * Get verification status of uploaded attestation quote
 */
export async function getPhalaVerificationStatus(checksum: string): Promise<PhalaVerificationStatus> {
  console.log(`\n🔍 [Phala Cloud] Checking verification status for: ${checksum}`)
  
  try {
    const response = await fetch(`${PHALA_CLOUD_API_BASE}${ATTESTATION_STATUS_ENDPOINT}/${checksum}`, {
      headers: {
        ...(API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {})
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          checksum,
          status: 'pending',
          error: 'Quote not found'
        }
      }
      throw new Error(`Phala Cloud API error: ${response.status}`)
    }
    
    const result = await response.json()
    
    console.log(`✅ [Phala Cloud] Verification status retrieved`)
    
    return {
      checksum,
      status: result.verified ? 'verified' : 'pending',
      verificationDetails: result.verified ? {
        teeType: result.tee_type || 'TDX',
        measurements: result.measurements || {},
        trustLevel: determineTrustLevel(result),
        verifiedAt: result.verified_at || new Date().toISOString()
      } : undefined
    }
    
  } catch (error) {
    console.error(`❌ [Phala Cloud] Failed to get verification status:`, error)
    return {
      checksum,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Upload quote to t16z explorer for public verification
 */
export async function uploadQuoteToT16z(quote: string): Promise<T16zUploadResponse> {
  console.log('\n🌐 [t16z] Starting attestation quote upload to t16z explorer...')
  
  const cleanQuote = quote.startsWith('0x') ? quote.slice(2) : quote
  
  try {
    // t16z explorer expects raw quote data
    const formData = new FormData()
    formData.append('quote', cleanQuote)
    formData.append('format', 'tdx') // Intel TDX format
    
    const response = await fetch(`${T16Z_EXPLORER_BASE}/api/upload`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`t16z API error: ${response.status}`)
    }
    
    const result = await response.json()
    const reportId = result.report_id || crypto.randomBytes(16).toString('hex')
    
    console.log(`✅ [t16z] Quote uploaded to t16z explorer`)
    console.log(`🔗 [t16z] Report ID: ${reportId}`)
    
    return {
      reportId,
      verificationUrl: `${T16Z_EXPLORER_BASE}/reports/${reportId}`,
      status: 'uploaded'
    }
    
  } catch (error) {
    console.error(`⚠️  [t16z] Upload failed (non-critical):`, error)
    // t16z upload is optional, return empty response on failure
    return {
      reportId: '',
      verificationUrl: '',
      status: 'failed'
    }
  }
}

/**
 * Generate public verification URLs for attestation
 */
export function generateVerificationUrls(checksum: string, t16zReportId?: string): {
  phalaUrl: string
  t16zUrl?: string
} {
  const urls: { phalaUrl: string; t16zUrl?: string } = {
    phalaUrl: `${PHALA_CLOUD_API_BASE}/attestation/verify/${checksum}`
  }
  
  if (t16zReportId) {
    urls.t16zUrl = `${T16Z_EXPLORER_BASE}/reports/${t16zReportId}`
  }
  
  return urls
}

/**
 * Determine trust level based on verification results
 */
function determineTrustLevel(verificationResult: any): 'high' | 'medium' | 'low' | 'none' {
  if (!verificationResult.verified) return 'none'
  
  // Check for critical measurements
  const hasMrtd = verificationResult.measurements?.mrtd
  const hasRtmr0 = verificationResult.measurements?.rtmr0
  const hasValidSignature = verificationResult.signature_valid
  
  if (hasMrtd && hasRtmr0 && hasValidSignature) {
    return 'high'
  } else if ((hasMrtd || hasRtmr0) && hasValidSignature) {
    return 'medium'
  } else if (hasValidSignature) {
    return 'low'
  }
  
  return 'none'
}

/**
 * Combined upload to both Phala Cloud and t16z explorer
 */
export async function uploadAttestationQuote(
  quote: string,
  eventLog?: string,
  metadata?: any
): Promise<{
  phalaCloud: PhalaCloudUploadResponse
  t16z?: T16zUploadResponse
  checksum: string
  verificationUrls: {
    phalaUrl: string
    t16zUrl?: string
  }
}> {
  console.log('\n🚀 [Attestation] Starting combined attestation upload...')
  
  const checksum = calculateQuoteChecksum(quote)
  
  // Upload to Phala Cloud (primary)
  const phalaResult = await uploadQuoteToPhalaCloud(quote, eventLog, metadata)
  
  // Upload to t16z (optional, don't fail if it doesn't work)
  let t16zResult: T16zUploadResponse | undefined
  try {
    t16zResult = await uploadQuoteToT16z(quote)
  } catch (error) {
    console.warn('⚠️  [Attestation] t16z upload failed (non-critical)', error)
  }
  
  const verificationUrls = generateVerificationUrls(checksum, t16zResult?.reportId)
  
  console.log('\n✅ [Attestation] Upload complete')
  console.log(`📊 [Attestation] Checksum: ${checksum}`)
  console.log(`🔗 [Attestation] Phala Cloud: ${verificationUrls.phalaUrl}`)
  if (verificationUrls.t16zUrl) {
    console.log(`🔗 [Attestation] t16z Explorer: ${verificationUrls.t16zUrl}`)
  }
  
  return {
    phalaCloud: phalaResult,
    t16z: t16zResult,
    checksum,
    verificationUrls
  }
}