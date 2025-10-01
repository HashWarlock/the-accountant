import { useState } from 'react'
import { motion } from 'framer-motion'
import { WalletManager } from './components/wallet-manager'
import { NetworkSwitcher, type NetworkConfig, NETWORKS } from './components/network-switcher'
import { SignMessageCard } from './components/sign-message-card'
import { MintTokensCard } from './components/mint-tokens-card'
import { ArrowLeft } from 'lucide-react'
import { Button } from './components/ui/button'

const API_BASE_URL = ''

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig>(NETWORKS[0])
  const [currentView, setCurrentView] = useState<'home' | 'sign' | 'mint'>('home')

  const handlePasskeySuccess = (data: { userId: string; email: string; walletAddress: string }) => {
    setWalletAddress(data.walletAddress)
    setUserId(data.userId)
    // Session token would be set from the passkey auth response
    console.log('Passkey auth successful:', data)
  }

  const handleDisconnect = () => {
    setWalletAddress(null)
    setUserId(null)
    setSessionToken(null)
    setCurrentView('home')
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

  const handleMintTokens = async (contractAddress: string, amount: number): Promise<{ hash: string }> => {
    // This would interact with the contract via the backend
    // For now, simulate a successful transaction
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          hash: '0x' + Math.random().toString(16).substring(2, 66),
        })
      }, 2000)
    })
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

    if (currentView === 'mint' && walletAddress) {
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
          <MintTokensCard onMint={handleMintTokens} network={currentNetwork} />
        </div>
      )
    }

    // Home view - show action buttons
    return (
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-lg md:text-xl font-semibold">Actions</h2>
        <div className="grid gap-3 md:gap-4">
          <Button
            variant="outline"
            className="justify-start h-auto p-3 md:p-4 w-full"
            onClick={() => setCurrentView('sign')}
            disabled={!walletAddress}
          >
            <div className="text-left w-full">
              <div className="font-semibold text-sm md:text-base">📝 Sign Message</div>
              <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                Sign arbitrary messages to prove ownership of your wallet
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto p-3 md:p-4 w-full"
            onClick={() => setCurrentView('mint')}
            disabled={!walletAddress}
          >
            <div className="text-left w-full">
              <div className="font-semibold text-sm md:text-base">🪙 Mint Tokens</div>
              <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                Mint new tokens to your wallet address. This will create new tokens and add them to your balance.
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto p-3 md:p-4 w-full"
            disabled={!walletAddress}
          >
            <div className="text-left w-full">
              <div className="font-semibold text-sm md:text-base">🔄 Switch Networks</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently on {currentNetwork.name}
              </p>
            </div>
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
