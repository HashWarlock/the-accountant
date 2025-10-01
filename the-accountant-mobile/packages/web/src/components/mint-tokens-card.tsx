import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Loader2, Coins, ExternalLink } from 'lucide-react'
import type { NetworkConfig } from './network-switcher'

interface MintTokensCardProps {
  onMint: (contractAddress: string, amount: number) => Promise<{ hash: string }>
  network: NetworkConfig
}

export function MintTokensCard({ onMint, network }: MintTokensCardProps) {
  const [contractAddress, setContractAddress] = useState('0xef147ed8bba8bba8bba8bba8bba8bba8bba8bc50')
  const [amount, setAmount] = useState('100')
  const [currentBalance, setCurrentBalance] = useState('0')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isMinting, setIsMinting] = useState(false)

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsMinting(true)
    setTxHash(null)
    try {
      const result = await onMint(contractAddress, parseInt(amount))
      setTxHash(result.hash)
      // Update balance after minting
      const newBalance = parseInt(currentBalance) + parseInt(amount)
      setCurrentBalance(newBalance.toString())
    } catch (error) {
      console.error('Failed to mint:', error)
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Mint Tokens
        </CardTitle>
        <CardDescription>
          Mint new tokens to your wallet address. This will create new tokens and add them to your balance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleMint} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Contract Address</label>
            <Input
              type="text"
              placeholder="0x..."
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              required
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tokens will mint to {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
            </p>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Current Balance</p>
              <Badge variant="secondary">{currentBalance} tokens</Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Amount</label>
            <Input
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />
          </div>

          {txHash && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                ✓ Transaction successful!
              </p>
              <a
                href={`${network.explorer}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                View on explorer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isMinting}>
            {isMinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : (
              `Mint ${amount} Tokens`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
