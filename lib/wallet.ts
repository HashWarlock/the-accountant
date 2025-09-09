import { privateKeyToAccount } from 'viem/accounts'
import { getWalletKey, keyToHex } from './dstack'
import { GetKeyResponse } from '@phala/dstack-sdk'

/**
 * Wallet interface that combines dstack key with viem account
 */
export interface DstackWallet {
  userId: string
  address: string
  publicKey: string
  signMessage: (message: string) => Promise<string>
  signTransaction: (tx: any) => Promise<string>
  keyResponse: GetKeyResponse
}

/**
 * Create a wallet for a user using dstack TEE
 * @param userId - Unique user identifier
 * @returns DstackWallet with signing capabilities
 */
export async function createWallet(userId: string): Promise<DstackWallet> {
  console.log(`\n🔐 [Wallet] Creating wallet for user: ${userId}`)
  console.log(`⏰ [Wallet] Start time: ${new Date().toISOString()}`)
  
  // Get the private key from dstack TEE
  console.log(`🔑 [Wallet] Requesting key from dstack TEE...`)
  const keyResponse = await getWalletKey(userId)
  console.log(`✅ [Wallet] Key received from TEE`)
  console.log(`📊 [Wallet] Key length: ${keyResponse.key.length} bytes`)
  console.log(`🔐 [Wallet] Attestation chain length: ${keyResponse.signature_chain.length}`)
  
  // Convert to hex for viem
  const privateKeyHex = keyToHex(keyResponse)
  console.log(`🔤 [Wallet] Private key converted to hex (length: ${privateKeyHex.length})`)
  
  // Create viem account from the private key
  console.log(`👤 [Wallet] Creating viem account from private key...`)
  const account = privateKeyToAccount(privateKeyHex as `0x${string}`)
  
  console.log(`\n✨ [Wallet] ===== WALLET CREATED SUCCESSFULLY =====`)
  console.log(`🆔 [Wallet] User ID: ${userId}`)
  console.log(`📍 [Wallet] ETH Address: ${account.address}`)
  console.log(`🔑 [Wallet] Public Key: ${account.publicKey}`)
  console.log(`🏷️ [Wallet] Public Key Length: ${account.publicKey.length} chars`)
  console.log(`⏰ [Wallet] Completed at: ${new Date().toISOString()}`)
  console.log(`================================================\n`)
  
  return {
    userId,
    address: account.address,
    publicKey: account.publicKey,
    keyResponse,
    
    // Sign a message using viem's account
    signMessage: async (message: string) => {
      console.log(`\n📝 [Wallet] Signing message for ${userId}`)
      console.log(`📋 [Wallet] Message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`)
      const signature = await account.signMessage({ message })
      console.log(`✅ [Wallet] Message signed successfully`)
      console.log(`🖊️ [Wallet] Signature: ${signature}`)
      return signature
    },
    
    // Sign a transaction using viem's account
    signTransaction: async (tx: any) => {
      console.log(`\n💳 [Wallet] Signing transaction for ${userId}`)
      const signature = await account.signTransaction(tx)
      console.log(`✅ [Wallet] Transaction signed successfully`)
      return signature
    }
  }
}

/**
 * Get just the address for a user without full wallet
 * @param userId - Unique user identifier
 * @returns Ethereum address
 */
export async function getUserAddress(userId: string): Promise<string> {
  const keyResponse = await getWalletKey(userId)
  const privateKeyHex = keyToHex(keyResponse)
  const account = privateKeyToAccount(privateKeyHex as `0x${string}`)
  return account.address
}

/**
 * Verify that two users get different addresses
 * @param userId1 - First user ID
 * @param userId2 - Second user ID
 * @returns Boolean indicating if addresses are different
 */
export async function verifyUniqueAddresses(userId1: string, userId2: string): Promise<boolean> {
  const addr1 = await getUserAddress(userId1)
  const addr2 = await getUserAddress(userId2)
  return addr1 !== addr2
}

/**
 * Verify deterministic key generation
 * @param userId - User ID to test
 * @returns Boolean indicating if same user gets same address
 */
export async function verifyDeterministicKeys(userId: string): Promise<boolean> {
  const addr1 = await getUserAddress(userId)
  const addr2 = await getUserAddress(userId)
  return addr1 === addr2
}