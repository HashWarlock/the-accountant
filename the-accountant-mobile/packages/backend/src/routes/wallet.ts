import { Router } from 'express';
import { z } from 'zod';
import { authenticateSession, AuthRequest, generateSessionToken } from '../middleware/auth.js';
import { createWalletWithAttestation } from '../lib/wallet.js';
import { createAuditLog } from '../lib/audit.js';
import { prisma } from '../lib/db.js';

const router = Router();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  userId: z.string().min(3).max(50),
});

const signSchema = z.object({
  message: z.string().min(1).max(10000),
});

const verifySchema = z.object({
  message: z.string().min(1),
  signature: z.string(),
  userId: z.string().optional(),
});

const contractExecuteSchema = z.object({
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  functionName: z.string().min(1),
  args: z.array(z.any()),
  network: z.number().optional(),
  abi: z.array(z.any()).optional(),
  value: z.string().optional(), // For payable functions
});

/**
 * POST /wallet/signup - Create new wallet and user
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, userId } = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { userId }]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        field: existingUser.email === email ? 'email' : 'userId'
      });
    }

    // Create wallet with attestation
    console.log(`\n🔐 [Wallet] Creating wallet for new user: ${userId}`);
    const wallet = await createWalletWithAttestation(userId, 'signup');

    // Save user to database
    const user = await prisma.user.create({
      data: {
        email,
        userId,
        pubKeyHex: wallet.pubKeyHex,
        address: wallet.address,
      },
      select: {
        id: true,
        email: true,
        userId: true,
        address: true,
        pubKeyHex: true,
        createdAt: true,
      }
    });

    // Create audit log
    await createAuditLog({
      userId: user.userId,
      operation: 'signup',
      attestationQuote: wallet.attestationQuote,
      eventLog: wallet.eventLog,
      attestationChecksum: wallet.attestationChecksum,
      phalaVerificationUrl: wallet.phalaVerificationUrl,
      t16zVerificationUrl: wallet.t16zVerificationUrl,
      applicationData: {
        namespace: process.env.APP_NAMESPACE || 'the-accountant-mobile',
        timestamp: new Date().toISOString(),
      },
      address: user.address,
      publicKey: user.pubKeyHex,
    });

    // Generate session token
    const sessionToken = generateSessionToken(userId);

    console.log(`✅ [Wallet] User created successfully: ${userId}`);

    return res.status(201).json({
      user: {
        userId: user.userId,
        email: user.email,
        address: user.address,
        publicKey: user.pubKeyHex,
        createdAt: user.createdAt,
      },
      sessionToken,
      attestation: wallet.attestationQuote ? {
        quote: wallet.attestationQuote,
        eventLog: wallet.eventLog,
        checksum: wallet.attestationChecksum,
        verificationUrls: {
          phala: wallet.phalaVerificationUrl,
          t16z: wallet.t16zVerificationUrl
        }
      } : undefined
    });
  } catch (error) {
    console.error('Signup error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /wallet/sign - Sign message (requires authentication)
 */
router.post('/sign', authenticateSession, async (req: AuthRequest, res) => {
  try {
    const { message } = signSchema.parse(req.body);
    const userId = req.user!.userId;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { userId: true, address: true, pubKeyHex: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create wallet with attestation for signing
    console.log(`\n🖊️  [Wallet] Signing message for user: ${userId}`);
    const wallet = await createWalletWithAttestation(userId, 'sign', { message });

    // Verify address consistency
    if (wallet.address !== user.address) {
      console.error(`❌ Address mismatch: DB=${user.address}, Derived=${wallet.address}`);
      return res.status(500).json({ error: 'Key derivation inconsistency' });
    }

    // Sign message
    const signature = await wallet.signMessage(message);

    console.log(`✅ [Wallet] Message signed successfully`);

    // Create audit log
    await createAuditLog({
      userId: user.userId,
      operation: 'sign',
      attestationQuote: wallet.attestationQuote,
      eventLog: wallet.eventLog,
      attestationChecksum: wallet.attestationChecksum,
      phalaVerificationUrl: wallet.phalaVerificationUrl,
      t16zVerificationUrl: wallet.t16zVerificationUrl,
      applicationData: {
        namespace: process.env.APP_NAMESPACE || 'the-accountant-mobile',
        timestamp: new Date().toISOString(),
        messageLength: message.length,
      },
      address: user.address,
      publicKey: user.pubKeyHex,
      message,
      signature,
    });

    return res.status(200).json({
      signature,
      address: user.address,
      publicKey: user.pubKeyHex,
      message,
      timestamp: new Date().toISOString(),
      attestation: wallet.attestationQuote ? {
        quote: wallet.attestationQuote,
        eventLog: wallet.eventLog,
        checksum: wallet.attestationChecksum,
        verificationUrls: {
          phala: wallet.phalaVerificationUrl,
          t16z: wallet.t16zVerificationUrl
        }
      } : undefined
    });
  } catch (error) {
    console.error('Sign error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    if (error instanceof Error && error.message.includes('TEE not available')) {
      return res.status(503).json({
        error: 'Signing service unavailable'
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /wallet/verify - Verify signature
 */
router.post('/verify', async (req, res) => {
  try {
    const { message, signature, userId } = verifySchema.parse(req.body);

    const { recoverMessageAddress } = await import('viem');

    // Recover address from signature
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature: signature as `0x${string}`,
    });

    console.log(`\n🔍 [Wallet] Verifying signature`);
    console.log(`📝 Message: ${message.substring(0, 50)}...`);
    console.log(`🔐 Recovered address: ${recoveredAddress}`);

    let isValid = false;
    let matchedUser = null;

    if (userId) {
      // Verify against specific user
      const user = await prisma.user.findUnique({
        where: { userId },
        select: { userId: true, address: true, email: true }
      });

      if (user) {
        isValid = user.address.toLowerCase() === recoveredAddress.toLowerCase();
        if (isValid) {
          matchedUser = user;
        }
      }
    } else {
      // Find user by recovered address
      const user = await prisma.user.findFirst({
        where: {
          address: {
            equals: recoveredAddress,
            mode: 'insensitive'
          }
        },
        select: { userId: true, address: true, email: true }
      });

      if (user) {
        isValid = true;
        matchedUser = user;
      }
    }

    console.log(`✅ [Wallet] Verification ${isValid ? 'successful' : 'failed'}`);

    return res.status(200).json({
      valid: isValid,
      recoveredAddress,
      user: matchedUser ? {
        userId: matchedUser.userId,
        email: matchedUser.email,
        address: matchedUser.address
      } : null,
      message,
      signature
    });
  } catch (error) {
    console.error('Verify error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /wallet/keys - Get user's public key (requires authentication)
 */
router.get('/keys', authenticateSession, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        address: true,
        pubKeyHex: true,
        email: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      userId: user.userId,
      email: user.email,
      address: user.address,
      publicKey: user.pubKeyHex
    });
  } catch (error) {
    console.error('Get keys error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /wallet/audit-logs - Get audit logs for authenticated user
 */
router.get('/audit-logs', authenticateSession, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Fetch audit logs for the user
    const auditLogs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        operation: true,
        attestationQuote: true,
        eventLog: true,
        applicationData: true,
        address: true,
        publicKey: true,
        message: true,
        signature: true,
        attestationChecksum: true,
        phalaVerificationUrl: true,
        t16zVerificationUrl: true,
        verificationStatus: true,
        quoteUploadedAt: true,
        createdAt: true,
      }
    });

    // Get total count for pagination
    const total = await prisma.auditLog.count({
      where: { userId }
    });

    console.log(`📋 [Audit] Retrieved ${auditLogs.length} logs for user: ${userId}`);

    return res.status(200).json({
      logs: auditLogs.map(log => ({
        ...log,
        applicationData: log.applicationData ? JSON.parse(log.applicationData) : null,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /wallet/contract/execute - Execute contract function (requires authentication)
 */
router.post('/contract/execute', authenticateSession, async (req: AuthRequest, res) => {
  try {
    const { contractAddress, functionName, args, network, abi, value } = contractExecuteSchema.parse(req.body);
    const userId = req.user!.userId;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { userId },
      select: { userId: true, address: true, pubKeyHex: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`\n📋 [Contract] Executing ${functionName} on ${contractAddress}`);
    console.log(`👤 User: ${userId} (${user.address})`);

    // Create wallet with attestation for transaction signing
    const wallet = await createWalletWithAttestation(userId, 'contract_execute', {
      contractAddress,
      functionName,
      args,
      network: network || 1,
    });

    // Verify address consistency
    if (wallet.address !== user.address) {
      console.error(`❌ Address mismatch: DB=${user.address}, Derived=${wallet.address}`);
      return res.status(500).json({ error: 'Key derivation inconsistency' });
    }

    // Import viem for contract interaction
    const {
      createPublicClient,
      createWalletClient,
      http,
      encodeFunctionData,
      parseGwei,
      formatEther,
    } = await import('viem');
    const { mainnet, sepolia, polygon, polygonAmoy } = await import('viem/chains');

    // Map network IDs to chains
    const chainMap: Record<number, any> = {
      1: mainnet,
      11155111: sepolia,
      137: polygon,
      80002: polygonAmoy,
    };

    const chain = chainMap[network || 1] || mainnet;

    // Create RPC clients
    const publicClient = createPublicClient({
      chain,
      transport: http()
    });

    const walletClient = createWalletClient({
      chain,
      transport: http()
    });

    // If no ABI provided, try to use common ERC20 or fail gracefully
    let functionAbi = abi;
    if (!functionAbi) {
      // Use minimal ERC20 ABI as fallback
      const erc20Abi = [
        {
          name: 'transfer',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ name: 'success', type: 'bool' }]
        },
        {
          name: 'approve',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ name: 'success', type: 'bool' }]
        },
        {
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: 'balance', type: 'uint256' }]
        },
      ];
      functionAbi = erc20Abi;
    }

    // Encode function call data
    const data = encodeFunctionData({
      abi: functionAbi,
      functionName,
      args,
    });

    // Get current nonce and gas price
    const nonce = await publicClient.getTransactionCount({
      address: user.address as `0x${string}`,
    });

    const gasPrice = await publicClient.getGasPrice();

    // Estimate gas
    const gasEstimate = await publicClient.estimateGas({
      account: user.address as `0x${string}`,
      to: contractAddress as `0x${string}`,
      data,
      value: value ? BigInt(value) : undefined,
    });

    console.log(`⛽ Gas estimate: ${gasEstimate.toString()}`);
    console.log(`💰 Gas price: ${formatEther(gasPrice)} ETH/gas`);

    // Prepare transaction
    const tx = {
      from: user.address as `0x${string}`,
      to: contractAddress as `0x${string}`,
      data,
      nonce,
      gas: gasEstimate,
      gasPrice,
      value: value ? BigInt(value) : undefined,
      chainId: chain.id,
    };

    // Sign transaction using TEE wallet
    console.log(`🔐 Signing transaction with TEE wallet...`);

    // Import necessary signing utilities
    const { keccak256, serializeTransaction } = await import('viem');

    // Serialize transaction for signing
    const serializedTx = serializeTransaction(tx);
    const txHash = keccak256(serializedTx);

    // Sign the transaction hash
    const signature = await wallet.signMessage(txHash);

    // Parse signature (r, s, v)
    const sig = signature.slice(2); // Remove '0x'
    const r = `0x${sig.slice(0, 64)}` as `0x${string}`;
    const s = `0x${sig.slice(64, 128)}` as `0x${string}`;
    const v = parseInt(sig.slice(128, 130), 16);

    // Create signed transaction
    const signedTx = serializeTransaction(tx, { r, s, v });

    // Send transaction
    console.log(`📤 Sending transaction...`);
    const txHashResult = await publicClient.sendRawTransaction({
      serializedTransaction: signedTx as `0x${string}`,
    });

    console.log(`✅ Transaction sent: ${txHashResult}`);

    // Create audit log
    await createAuditLog({
      userId: user.userId,
      operation: 'contract_execute',
      attestationQuote: wallet.attestationQuote,
      eventLog: wallet.eventLog,
      attestationChecksum: wallet.attestationChecksum,
      phalaVerificationUrl: wallet.phalaVerificationUrl,
      t16zVerificationUrl: wallet.t16zVerificationUrl,
      applicationData: {
        namespace: process.env.APP_NAMESPACE || 'the-accountant-mobile',
        timestamp: new Date().toISOString(),
        contractAddress,
        functionName,
        network: chain.id,
        txHash: txHashResult,
      },
      address: user.address,
      publicKey: user.pubKeyHex,
    });

    return res.status(200).json({
      hash: txHashResult,
      contractAddress,
      functionName,
      network: chain.id,
      timestamp: new Date().toISOString(),
      attestation: wallet.attestationQuote ? {
        quote: wallet.attestationQuote,
        eventLog: wallet.eventLog,
        checksum: wallet.attestationChecksum,
        verificationUrls: {
          phala: wallet.phalaVerificationUrl,
          t16z: wallet.t16zVerificationUrl
        }
      } : undefined
    });
  } catch (error) {
    console.error('Contract execution error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }

    if (error instanceof Error) {
      // Handle specific contract execution errors
      if (error.message.includes('insufficient funds')) {
        return res.status(400).json({ error: 'Insufficient funds for transaction' });
      }
      if (error.message.includes('gas required exceeds')) {
        return res.status(400).json({ error: 'Transaction would fail - check contract parameters' });
      }
      return res.status(500).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
// Route reload
