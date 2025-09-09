import { DstackClient, type InfoResponse, type GetKeyResponse, type GetQuoteResponse, type TcbInfoV05x } from '@phala/dstack-sdk'

// Singleton instance
let clientInstance: DstackClient | null = null

/**
 * Get or create dstack client instance
 * Uses singleton pattern to maintain single connection to TEE
 */
export function getDstackClient(): DstackClient {
  if (!clientInstance) {
    clientInstance = new DstackClient()
  }
  return clientInstance
}

/**
 * Get TEE instance information
 * @returns TEE info including version, attestation support, etc.
 */
export async function getTeeInfo(): Promise<InfoResponse<TcbInfoV05x>> {
  try {
    const client = getDstackClient()
    return await client.info()
  } catch (error) {
    throw new Error(`Failed to get TEE info: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get deterministic wallet key for a user
 * @param userId - Unique user identifier
 * @returns GetKeyResponse containing the raw key bytes
 */
export async function getUserWalletKey(userId: string): Promise<GetKeyResponse> {
  try {
    console.log(`\n🔐 [dstack] Getting wallet key from TEE`)
    console.log(`👤 [dstack] User ID: ${userId}`)
    console.log(`🔌 [dstack] Socket: /var/run/dstack.sock`)
    
    const client = getDstackClient()
    
    // The SDK returns GetKeyResponse with:
    // - key: Uint8Array (32 bytes for secp256k1 private key)
    // - signature_chain: Uint8Array[] (attestation signatures)
    console.log(`📡 [dstack] Calling TEE getKey('wallet/ethereum', '${userId}')...`)
    const keyResponse = await client.getKey('wallet/ethereum', userId)
    
    console.log(`✅ [dstack] Key received from TEE`)
    console.log(`📏 [dstack] Key size: ${keyResponse.key.length} bytes`)
    console.log(`🔐 [dstack] Attestation signatures: ${keyResponse.signature_chain.length}`)
    
    return keyResponse
  } catch (error) {
    // Check if it's a connection error (TEE not available)
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.error(`❌ [dstack] TEE not available - socket not found`)
      throw new Error('TEE not available. Is dstack running? Socket: /var/run/dstack.sock')
    }
    console.error(`❌ [dstack] Failed to get wallet key: ${error}`)
    throw new Error(`Failed to get wallet key: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate remote attestation quote
 * @param data - Application data to include in quote
 * @returns GetQuoteResponse with quote and event log
 */
export async function generateAttestationQuote(data: any): Promise<GetQuoteResponse> {
  try {
    const client = getDstackClient()
    const applicationData = JSON.stringify(data)
    return await client.getQuote(applicationData)
  } catch (error) {
    throw new Error(`Failed to generate attestation quote: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check if dstack TEE is available
 * @returns Boolean indicating TEE availability
 */
export async function isTeeAvailable(): Promise<boolean> {
  try {
    await getTeeInfo()
    return true
  } catch {
    return false
  }
}

/**
 * Development mode fallback - generates mock keys for testing
 * WARNING: Only use in development, not secure for production
 */
export async function getDevWalletKey(userId: string): Promise<GetKeyResponse> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Development mode keys not available in production')
  }
  
  console.warn('\n⚠️  ========== DEVELOPMENT MODE ==========')
  console.warn('⚠️  Using development mode - keys are not secure!')
  console.warn(`⚠️  User ID: ${userId}`)
  
  // In development, return a mock GetKeyResponse structure
  // Create a deterministic but insecure key based on userId
  const crypto = await import('crypto')
  const hash = crypto.createHash('sha256').update(userId).digest()
  
  console.warn(`⚠️  Generated mock key: ${hash.length} bytes`)
  console.warn(`⚠️  No TEE attestation in dev mode`)
  console.warn('⚠️  =====================================\n')
  
  return {
    __name__: 'GetKeyResponse' as const,
    key: new Uint8Array(hash), // 32 bytes from SHA256
    signature_chain: [] // No attestation in dev mode
  }
}

/**
 * Get wallet key with automatic fallback for development
 * @param userId - Unique user identifier
 * @returns GetKeyResponse from TEE or dev fallback
 */
export async function getWalletKey(userId: string): Promise<GetKeyResponse> {
  console.log(`\n🔑 [dstack] Getting wallet key for user: ${userId}`)
  console.log(`🌍 [dstack] Environment: ${process.env.NODE_ENV || 'development'}`)
  
  // Try TEE first
  try {
    console.log(`🔐 [dstack] Attempting to use TEE...`)
    const result = await getUserWalletKey(userId)
    console.log(`✅ [dstack] Successfully got key from TEE`)
    return result
  } catch (error) {
    console.error(`⚠️  [dstack] TEE failed: ${error}`)
    
    // In development, fall back to mock keys
    if (process.env.NODE_ENV !== 'production') {
      console.warn('📌 [dstack] TEE not available, using development fallback')
      return await getDevWalletKey(userId)
    }
    // In production, TEE is required
    console.error(`❌ [dstack] TEE required in production - no fallback available`)
    throw error
  }
}

/**
 * Convert key bytes to hex string
 * @param keyResponse - Response from getKey
 * @returns Hex string of the private key
 */
export function keyToHex(keyResponse: GetKeyResponse): string {
  return '0x' + Buffer.from(keyResponse.key).toString('hex')
}