import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { WalletManager } from './components/wallet-manager'
import { NetworkSwitcher, type NetworkConfig, NETWORKS } from './components/network-switcher'
import { SignMessageCard } from './components/sign-message-card'
import { VerifySignatureCard } from './components/verify-signature-card'
import { DeployTokenCard } from './components/deploy-token-card'
import { SendTokensCard } from './components/send-tokens-card'
import { PCControllerChat } from './components/pc-controller-chat'
import { ContractInteraction } from './components/contract-interaction'
import { AuditLog } from './components/audit-log'
import { ArrowLeft } from 'lucide-react'
import { Button } from './components/ui/button'

// Use relative URLs so Vite proxy handles routing
const API_BASE_URL = ''

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig>(NETWORKS[0])
  const [currentView, setCurrentView] = useState<'home' | 'sign' | 'verify' | 'deploy' | 'send' | 'contract' | 'audit' | 'pc'>('home')

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('session_token')
    const storedUserId = localStorage.getItem('user_id')
    const storedWalletAddress = localStorage.getItem('wallet_address')

    if (storedToken && storedUserId && storedWalletAddress) {
      setSessionToken(storedToken)
      setUserId(storedUserId)
      setWalletAddress(storedWalletAddress)
    }
  }, [])

  const handlePasskeySuccess = (data: { userId: string; email: string; walletAddress: string }) => {
    setWalletAddress(data.walletAddress)
    setUserId(data.userId)
    // Read session token from localStorage (set by usePasskey hook)
    const storedToken = localStorage.getItem('session_token')
    if (storedToken) {
      setSessionToken(storedToken)
    }
    console.log('Passkey auth successful:', data)
  }

  const handleDisconnect = () => {
    setWalletAddress(null)
    setUserId(null)
    setSessionToken(null)
    setCurrentView('home')
    // Clear localStorage
    localStorage.removeItem('session_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('email')
    localStorage.removeItem('wallet_address')
  }

  const handleSignMessage = async (message: string): Promise<{ signature: string; address: string }> => {
    if (!userId) throw new Error('No user ID')

    const response = await fetch(`${API_BASE_URL}/api/wallet/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` }),
      },
      body: JSON.stringify({ userId, message }),
    })

    if (!response.ok) {
      throw new Error('Failed to sign message')
    }

    const data = await response.json()
    return {
      signature: data.signature,
      address: walletAddress!,
    }
  }

  const handleVerifySignature = async (
    message: string,
    signature: string,
    address: string
  ): Promise<{
    valid: boolean
    recoveredAddress: string
    user?: { userId: string; email: string; address: string }
  }> => {
    const response = await fetch(`${API_BASE_URL}/api/wallet/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        signature,
        userId: address ? undefined : userId, // Only pass userId if no address provided
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to verify signature')
    }

    const data = await response.json()
    return {
      valid: data.valid,
      recoveredAddress: data.recoveredAddress,
      user: data.user,
    }
  }

  const handleDeployToken = async (params: {
    name: string
    symbol: string
    totalSupply: string
    initialMintPercentage: number
  }): Promise<{ hash: string; contractAddress: string }> => {
    if (!userId) throw new Error('No user ID')

    // This would call the backend to deploy the contract
    // For now, simulate a successful deployment
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          hash: '0x' + Math.random().toString(16).substring(2, 66),
          contractAddress: '0x' + Math.random().toString(16).substring(2, 42),
        })
      }, 3000)
    })
  }

  const handleSendTokens = async (params: {
    tokenAddress: string
    recipient: string
    amount: string
  }): Promise<{ hash: string }> => {
    if (!userId) throw new Error('No user ID')

    // Use contract execution for ERC20 transfer
    const result = await handleExecuteContract(
      params.tokenAddress,
      'transfer',
      [params.recipient, params.amount]
    )

    return { hash: result.hash || '0x' }
  }

  const handleExecuteContract = async (
    contractAddress: string,
    functionName: string,
    args: any[]
  ): Promise<{ hash?: string; result?: any }> => {
    if (!userId) throw new Error('No user ID')

    // For read functions, use viem public client
    if (['balanceOf', 'totalSupply', 'decimals', 'symbol', 'name', 'allowance', 'getAmountsOut'].includes(functionName)) {
      try {
        // Import viem dynamically
        const { createPublicClient, http } = await import('viem')
        const { mainnet, sepolia, base, baseSepolia } = await import('viem/chains')

        // Map network IDs to chains
        const chainMap: Record<number, any> = {
          1: mainnet,
          11155111: sepolia,
          8453: base,
          84532: baseSepolia,
        }

        const chain = chainMap[currentNetwork.chainId] || sepolia

        // Create public client for read operations
        const publicClient = createPublicClient({
          chain,
          transport: http()
        })

        // Minimal ERC20 ABI for read functions
        const erc20ReadAbi = [
          {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: 'balance', type: 'uint256' }]
          },
          {
            name: 'totalSupply',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ name: 'supply', type: 'uint256' }]
          },
          {
            name: 'decimals',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ name: 'decimals', type: 'uint8' }]
          },
          {
            name: 'symbol',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ name: 'symbol', type: 'string' }]
          },
          {
            name: 'name',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ name: 'name', type: 'string' }]
          },
          {
            name: 'allowance',
            type: 'function',
            stateMutability: 'view',
            inputs: [
              { name: 'owner', type: 'address' },
              { name: 'spender', type: 'address' }
            ],
            outputs: [{ name: 'remaining', type: 'uint256' }]
          },
        ]

        // Call the contract read function
        const result = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: erc20ReadAbi,
          functionName,
          args,
        })

        return { result: result?.toString() || '0' }
      } catch (error) {
        console.error('Read contract error:', error)
        throw new Error(`Failed to read contract: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // For write functions, call backend
    const response = await fetch(`${API_BASE_URL}/api/wallet/contract/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` }),
      },
      body: JSON.stringify({
        contractAddress,
        functionName,
        args,
        network: currentNetwork.chainId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to execute contract function' }))
      throw new Error(errorData.error || 'Failed to execute contract function')
    }

    const data = await response.json()
    return { hash: data.hash }
  }

  const ActionView = () => {
    if (currentView === 'sign' && walletAddress) {
      return (
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('home')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <SignMessageCard onSign={handleSignMessage} walletAddress={walletAddress} />
        </div>
      )
    }

    if (currentView === 'verify' && walletAddress) {
      return (
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('home')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <VerifySignatureCard onVerify={handleVerifySignature} />
        </div>
      )
    }

    if (currentView === 'deploy' && walletAddress) {
      return (
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('home')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <DeployTokenCard
            onDeploy={handleDeployToken}
            walletAddress={walletAddress}
            network={currentNetwork}
          />
        </div>
      )
    }

    if (currentView === 'send' && walletAddress) {
      return (
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('home')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <SendTokensCard
            onSend={handleSendTokens}
            walletAddress={walletAddress}
            network={currentNetwork}
          />
        </div>
      )
    }

    if (currentView === 'contract' && walletAddress) {
      return (
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('home')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <ContractInteraction
            walletAddress={walletAddress}
            network={currentNetwork}
            onExecute={handleExecuteContract}
          />
        </div>
      )
    }

    if (currentView === 'audit' && walletAddress) {
      return (
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('home')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <AuditLog sessionToken={sessionToken} />
        </div>
      )
    }

    if (currentView === 'pc' && walletAddress) {
      return (
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('home')}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <PCControllerChat sessionToken={sessionToken} />
        </div>
      )
    }

    // Home view - show action buttons in grid
    return (
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-lg md:text-xl font-semibold">Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 md:h-32 p-3 md:p-4"
            onClick={() => setCurrentView('sign')}
            disabled={!walletAddress}
          >
            <div className="text-2xl md:text-3xl mb-2">📝</div>
            <div className="font-semibold text-xs md:text-sm text-center">Sign Message</div>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 md:h-32 p-3 md:p-4"
            onClick={() => setCurrentView('verify')}
            disabled={!walletAddress}
          >
            <div className="text-2xl md:text-3xl mb-2">✅</div>
            <div className="font-semibold text-xs md:text-sm text-center">Verify Signature</div>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 md:h-32 p-3 md:p-4"
            onClick={() => setCurrentView('deploy')}
            disabled={!walletAddress}
          >
            <div className="text-2xl md:text-3xl mb-2">🚀</div>
            <div className="font-semibold text-xs md:text-sm text-center">Deploy Token</div>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 md:h-32 p-3 md:p-4"
            onClick={() => setCurrentView('send')}
            disabled={!walletAddress}
          >
            <div className="text-2xl md:text-3xl mb-2">💸</div>
            <div className="font-semibold text-xs md:text-sm text-center">Send Tokens</div>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 md:h-32 p-3 md:p-4"
            onClick={() => setCurrentView('contract')}
            disabled={!walletAddress}
          >
            <div className="text-2xl md:text-3xl mb-2">📋</div>
            <div className="font-semibold text-xs md:text-sm text-center">Contract</div>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 md:h-32 p-3 md:p-4"
            onClick={() => setCurrentView('pc')}
            disabled={!walletAddress}
          >
            <div className="text-2xl md:text-3xl mb-2">🖥️</div>
            <div className="font-semibold text-xs md:text-sm text-center">PC Control</div>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 md:h-32 p-3 md:p-4"
            onClick={() => setCurrentView('audit')}
            disabled={!walletAddress}
          >
            <div className="text-2xl md:text-3xl mb-2">🔒</div>
            <div className="font-semibold text-xs md:text-sm text-center">Audit Log</div>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-24 md:h-32 p-3 md:p-4 col-span-2 md:col-span-1"
            disabled={!walletAddress}
          >
            <div className="text-2xl md:text-3xl mb-2">🔄</div>
            <div className="font-semibold text-xs md:text-sm text-center">{currentNetwork.name}</div>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-xl md:text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold">
                The Accountant
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <a
              href="https://dstack.phala.network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs md:text-sm text-muted-foreground hover:text-foreground"
            >
              dstack
            </a>
            <a
              href="https://github.com/Phala-Network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs md:text-sm text-muted-foreground hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Wallet & Network */}
          <div className="space-y-4 md:space-y-6">
            <WalletManager
              walletAddress={walletAddress}
              onDisconnect={handleDisconnect}
              onPasskeySuccess={handlePasskeySuccess}
            />

            {walletAddress && (
              <NetworkSwitcher
                onNetworkChange={setCurrentNetwork}
                currentNetwork={currentNetwork}
              />
            )}
          </div>

          {/* Middle/Right Column - Actions */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ActionView />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 md:mt-16 border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-xs md:text-sm text-muted-foreground text-center">
              Powered by{' '}
              <a
                href="https://phala.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                🔒 Phala Cloud
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
