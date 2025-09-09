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
  // Get the private key from dstack TEE
  const keyResponse = await getWalletKey(userId)
  
  // Convert to hex for viem
  const privateKeyHex = keyToHex(keyResponse)
  
  // Create viem account from the private key
  const account = privateKeyToAccount(privateKeyHex as `0x${string}`)
  
  return {
    userId,
    address: account.address,
    publicKey: account.publicKey,
    keyResponse,
    
    // Sign a message using viem's account
    signMessage: async (message: string) => {
      return await account.signMessage({ message })
    },
    
    // Sign a transaction using viem's account
    signTransaction: async (tx: any) => {
      return await account.signTransaction(tx)
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