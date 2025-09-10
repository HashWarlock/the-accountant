import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyMessage } from 'viem'
import { prisma } from '@/lib/db'
import { createWalletWithAttestation } from '@/lib/wallet'
import { createAuditLog } from '@/lib/audit'

// Validation schema
const verifyRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, 'Invalid signature format'),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address').optional(),
  userId: z.string().min(3).max(50).optional()
}).refine(
  data => data.address || data.userId,
  { message: 'Either address or userId must be provided' }
)

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  console.log(`\n🔍 ========== SIGNATURE VERIFICATION STARTED ==========`)
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
  
  try {
    // Parse and validate request body
    const body = await request.json()
    console.log(`📝 Request body received:`)
    console.log(`  - Has message: ${!!body.message} (length: ${body.message?.length || 0})`)
    console.log(`  - Has signature: ${!!body.signature} (${body.signature?.substring(0, 10)}...)`)
    console.log(`  - Has address: ${!!body.address} (${body.address || 'none'})`)
    console.log(`  - Has userId: ${!!body.userId} (${body.userId || 'none'})`)
    
    const { message, signature, address, userId } = verifyRequestSchema.parse(body)
    
    console.log(`\n✅ Request validation passed`)
    console.log(`📋 Message to verify: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`)
    console.log(`🖊️  Signature: ${signature}`)
    
    let expectedAddress = address
    let userData = null
    
    // If userId provided, look up the address
    if (userId) {
      console.log(`\n👤 Looking up user: ${userId}`)
      userData = await prisma.user.findUnique({
        where: { userId },
        select: { 
          id: true,
          userId: true,
          address: true,
          pubKeyHex: true 
        }
      })
      
      if (!userData) {
        console.error(`❌ User not found: ${userId}`)
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      
      console.log(`✅ User found:`)
      console.log(`  - Database ID: ${userData.id}`)
      console.log(`  - User ID: ${userData.userId}`)
      console.log(`  - Address: ${userData.address}`)
      console.log(`  - Public Key: ${userData.pubKeyHex}`)
      
      expectedAddress = userData.address
    }
    
    console.log(`\n🎯 Expected signer address: ${expectedAddress}`)
    
    // Verify the signature using viem
    let isValid = false
    let recoveredAddress: string | null = null
    
    try {
      console.log(`\n🔐 Verifying signature with viem...`)
      console.log(`  - Address to verify: ${expectedAddress}`)
      console.log(`  - Message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`)
      console.log(`  - Signature length: ${signature.length} chars`)
      
      // Verify and recover the address from signature
      isValid = await verifyMessage({
        address: expectedAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`
      })
      
      console.log(`\n${isValid ? '✅' : '❌'} Verification result: ${isValid ? 'VALID' : 'INVALID'}`)
      
      // For debugging, we can also recover the address
      // This helps identify who actually signed if verification fails
      if (!isValid) {
        console.log(`\n🔎 Attempting to recover actual signer address...`)
        const { recoverAddress } = await import('viem')
        const { hashMessage } = await import('viem')
        
        const messageHash = hashMessage(message)
        console.log(`  - Message hash: ${messageHash}`)
        
        recoveredAddress = await recoverAddress({
          hash: messageHash,
          signature: signature as `0x${string}`
        })
        
        console.log(`\n⚠️  SIGNATURE MISMATCH DETECTED!`)
        console.log(`  - Expected address: ${expectedAddress}`)
        console.log(`  - Recovered address: ${recoveredAddress}`)
        console.log(`  - Match: ${expectedAddress?.toLowerCase() === recoveredAddress?.toLowerCase()}`)
        
        if (expectedAddress?.toLowerCase() === recoveredAddress?.toLowerCase()) {
          console.log(`\n🤔 Addresses match but verification failed - possible signature format issue`)
        }
      }
    } catch (verifyError) {
      console.error(`\n❌ SIGNATURE VERIFICATION ERROR:`)
      console.error(`  - Error type: ${verifyError instanceof Error ? verifyError.constructor.name : 'Unknown'}`)
      console.error(`  - Error message: ${verifyError instanceof Error ? verifyError.message : verifyError}`)
      console.error(`  - Full error:`, verifyError)
      isValid = false
      
      // Try to recover address anyway for debugging
      try {
        const { recoverAddress } = await import('viem')
        const { hashMessage } = await import('viem')
        recoveredAddress = await recoverAddress({
          hash: hashMessage(message),
          signature: signature as `0x${string}`
        })
        console.log(`  - Recovered address despite error: ${recoveredAddress}`)
      } catch (recoverError) {
        console.error(`  - Could not recover address: ${recoverError}`)
      }
    }
    
    // Log performance metrics
    const duration = Date.now() - startTime
    
    // Generate attestation for the verify operation (if userId is available)
    let attestationData = null
    if (userId) {
      try {
        console.log(`\n🔏 Generating attestation for verify operation...`)
        const wallet = await createWalletWithAttestation(
          userId, 
          'verify', 
          { message, signature }
        )
        
        if (wallet.attestationQuote) {
          attestationData = {
            quote: wallet.attestationQuote,
            eventLog: wallet.eventLog,
            checksum: wallet.attestationChecksum,
            phalaVerificationUrl: wallet.phalaVerificationUrl,
            t16zVerificationUrl: wallet.t16zVerificationUrl,
            reportData: wallet.reportData
          }
          
          // Create audit log with attestation
          await createAuditLog({
            userId,
            operation: 'verify',
            address: expectedAddress,
            publicKey: userData?.pubKeyHex || null,
            message,
            signature,
            attestationQuote: wallet.attestationQuote,
            eventLog: wallet.eventLog,
            applicationData: wallet.reportData,
            attestationChecksum: wallet.attestationChecksum,
            phalaVerificationUrl: wallet.phalaVerificationUrl,
            t16zVerificationUrl: wallet.t16zVerificationUrl,
            verificationStatus: 'pending'
          })
          
          console.log(`✅ Attestation generated and audit log created`)
          if (wallet.t16zVerificationUrl) {
            console.log(`🔗 t16z verification: ${wallet.t16zVerificationUrl}`)
          }
        }
      } catch (attestError) {
        console.error(`⚠️ Failed to generate attestation (non-critical):`, attestError)
      }
    }
    
    console.log(`\n📊 ========== VERIFICATION SUMMARY ==========`)
    console.log(`⏱️  Duration: ${duration}ms`)
    console.log(`✅ Valid: ${isValid}`)
    console.log(`📍 Expected Address: ${expectedAddress}`)
    if (recoveredAddress) {
      console.log(`🔍 Recovered Address: ${recoveredAddress}`)
    }
    if (userData) {
      console.log(`👤 User ID: ${userData.userId}`)
    }
    if (attestationData) {
      console.log(`📜 Has Attestation: Yes`)
    }
    console.log(`===========================================\n`)
    
    // Prepare response
    const response: any = {
      valid: isValid,
      message,
      expectedAddress,
      ...(userData && { 
        userId: userData.userId,
        publicKey: userData.pubKeyHex 
      }),
      ...(recoveredAddress && !isValid && { 
        recoveredAddress,
        error: 'Signature does not match expected address' 
      }),
      timestamp: new Date().toISOString()
    }
    
    // Add attestation data and verification URLs if available
    if (attestationData) {
      response.attestation = attestationData
      response.phalaVerificationUrl = attestationData.phalaVerificationUrl
      response.t16zVerificationUrl = attestationData.t16zVerificationUrl
    }
    
    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('Verification error:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }
    
    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Document the API endpoint
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/verify',
    method: 'POST',
    description: 'Verify an ECDSA signature against a message and address',
    body: {
      message: 'string - Original message that was signed',
      signature: 'string - Hex signature to verify (0x...)',
      address: 'string (optional) - Ethereum address to verify against',
      userId: 'string (optional) - User ID to look up address'
    },
    note: 'Either address or userId must be provided',
    response: {
      valid: 'boolean - Whether signature is valid',
      message: 'Original message',
      expectedAddress: 'Address that should have signed',
      userId: 'User ID (if provided)',
      publicKey: 'Public key (if userId provided)',
      recoveredAddress: 'Actual signer address (if verification failed)',
      timestamp: 'ISO timestamp of verification'
    },
    responses: {
      200: 'Verification completed (check valid field)',
      400: 'Validation error',
      404: 'User not found (when userId provided)',
      500: 'Internal server error'
    }
  })
}