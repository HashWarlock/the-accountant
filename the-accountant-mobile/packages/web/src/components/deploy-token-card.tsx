import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Loader2, Rocket, ExternalLink, AlertCircle } from 'lucide-react'
import type { NetworkConfig } from './network-switcher'

interface DeployTokenCardProps {
  onDeploy: (params: {
    name: string
    symbol: string
    totalSupply: string
    initialMintPercentage: number
  }) => Promise<{ hash: string; contractAddress: string }>
  walletAddress: string
  network: NetworkConfig
}

export function DeployTokenCard({ onDeploy, walletAddress, network }: DeployTokenCardProps) {
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [totalSupply, setTotalSupply] = useState('')
  const [initialMintPercentage, setInitialMintPercentage] = useState('100')
  const [isDeploying, setIsDeploying] = useState(false)
  const [result, setResult] = useState<{ hash: string; contractAddress: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDeploy = async () => {
    if (!name || !symbol || !totalSupply) {
      setError('All fields are required')
      return
    }

    const supplyNum = parseFloat(totalSupply)
    if (isNaN(supplyNum) || supplyNum <= 0) {
      setError('Invalid total supply')
      return
    }

    const percentageNum = parseFloat(initialMintPercentage)
    if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
      setError('Initial mint percentage must be between 0 and 100')
      return
    }

    try {
      setIsDeploying(true)
      setError(null)
      setResult(null)

      const deployResult = await onDeploy({
        name,
        symbol,
        totalSupply,
        initialMintPercentage: percentageNum,
      })

      setResult(deployResult)

      // Clear form after success
      setName('')
      setSymbol('')
      setTotalSupply('')
      setInitialMintPercentage('100')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deploy token')
    } finally {
      setIsDeploying(false)
    }
  }

  const calculatedInitialMint = totalSupply && initialMintPercentage
    ? (parseFloat(totalSupply) * parseFloat(initialMintPercentage) / 100).toFixed(2)
    : '0'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          <CardTitle>Deploy ERC-20 Token</CardTitle>
        </div>
        <CardDescription>
          Deploy a new ERC-20 token contract and mint tokens to your wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Name */}
        <div className="space-y-2">
          <Label htmlFor="token-name">Token Name</Label>
          <Input
            id="token-name"
            placeholder="My Token"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isDeploying}
          />
        </div>

        {/* Token Symbol */}
        <div className="space-y-2">
          <Label htmlFor="token-symbol">Token Symbol</Label>
          <Input
            id="token-symbol"
            placeholder="MTK"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            disabled={isDeploying}
            maxLength={10}
          />
        </div>

        {/* Total Supply */}
        <div className="space-y-2">
          <Label htmlFor="total-supply">Total Supply</Label>
          <Input
            id="total-supply"
            type="number"
            step="any"
            placeholder="1000000"
            value={totalSupply}
            onChange={(e) => setTotalSupply(e.target.value)}
            disabled={isDeploying}
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of tokens that can exist
          </p>
        </div>

        {/* Initial Mint Percentage */}
        <div className="space-y-2">
          <Label htmlFor="initial-mint">Initial Mint to Your Wallet (%)</Label>
          <Input
            id="initial-mint"
            type="number"
            min="0"
            max="100"
            step="1"
            placeholder="100"
            value={initialMintPercentage}
            onChange={(e) => setInitialMintPercentage(e.target.value)}
            disabled={isDeploying}
          />
          <p className="text-xs text-muted-foreground">
            You will receive {calculatedInitialMint} {symbol || 'tokens'} ({initialMintPercentage}% of total supply)
          </p>
        </div>

        {/* Deployment Info */}
        <div className="p-3 bg-muted rounded-lg space-y-2">
          <p className="text-xs text-muted-foreground">Deployer Address:</p>
          <code className="text-xs break-all">{walletAddress}</code>
          <p className="text-xs text-muted-foreground mt-2">Network: {network.name}</p>
        </div>

        {/* Warning about costs */}
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            <strong>⚠️ Note:</strong> Deploying a contract requires gas fees. Make sure you have enough {network.name === 'Polygon' ? 'MATIC' : 'ETH'} in your wallet.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {result && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-3">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              ✓ Token deployed successfully!
            </p>
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Contract Address:</p>
                <code className="block p-2 bg-muted rounded break-all">
                  {result.contractAddress}
                </code>
              </div>
              <a
                href={`${network.explorer}/tx/${result.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                View deployment transaction <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={`${network.explorer}/address/${result.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1 block"
              >
                View contract <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

        {/* Deploy Button */}
        <Button
          onClick={handleDeploy}
          disabled={isDeploying || !name || !symbol || !totalSupply}
          className="w-full"
        >
          {isDeploying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deploying Contract...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Deploy Token Contract
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
