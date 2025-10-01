import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Loader2, Send, ExternalLink, AlertCircle } from 'lucide-react'
import type { NetworkConfig } from './network-switcher'
import { parseTokenAmount, formatTokenAmount } from '../utils/format'

interface SendTokensCardProps {
  onSend: (params: {
    tokenAddress: string
    recipient: string
    amount: string
  }) => Promise<{ hash: string }>
  walletAddress: string
  network: NetworkConfig
}

export function SendTokensCard({ onSend, walletAddress, network }: SendTokensCardProps) {
  const [tokenAddress, setTokenAddress] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!tokenAddress || !recipient || !amount) {
      setError('All fields are required')
      return
    }

    // Validate addresses
    if (!tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Invalid token contract address')
      return
    }

    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Invalid recipient address')
      return
    }

    // Validate amount
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Invalid amount')
      return
    }

    try {
      setIsSending(true)
      setError(null)
      setTxHash(null)

      // Convert amount to wei (assuming 18 decimals)
      const amountWei = parseTokenAmount(amount, 18)

      const result = await onSend({
        tokenAddress,
        recipient,
        amount: amountWei,
      })

      setTxHash(result.hash)

      // Clear form after success
      setTokenAddress('')
      setRecipient('')
      setAmount('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send tokens')
    } finally {
      setIsSending(false)
    }
  }

  const handleSetNativeToken = () => {
    // Set to zero address for native token (ETH/MATIC)
    setTokenAddress('0x0000000000000000000000000000000000000000')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          <CardTitle>Send Tokens</CardTitle>
        </div>
        <CardDescription>
          Transfer ERC-20 tokens or native currency to any address
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Contract Address */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="token-address">Token Contract Address</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSetNativeToken}
              className="text-xs h-auto py-1"
            >
              Use Native Token
            </Button>
          </div>
          <Input
            id="token-address"
            placeholder="0x... (use 0x000...000 for native ETH/MATIC)"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            disabled={isSending}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter the ERC-20 token contract address, or 0x000...000 for native token
          </p>
        </div>

        {/* Recipient Address */}
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isSending}
            className="font-mono text-sm"
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="any"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isSending}
          />
          <p className="text-xs text-muted-foreground">
            Amount in tokens (e.g., 1.5 for 1.5 tokens)
          </p>
        </div>

        {/* Your Wallet */}
        <div className="p-3 bg-muted rounded-lg space-y-1">
          <p className="text-xs text-muted-foreground">From (Your Wallet):</p>
          <code className="text-xs break-all">{walletAddress}</code>
        </div>

        {/* Network Info */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            <strong>Network:</strong> {network.name}
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
        {txHash && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg space-y-2">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              ✓ Tokens sent successfully!
            </p>
            <a
              href={`${network.explorer}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              View transaction <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={isSending || !tokenAddress || !recipient || !amount}
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Tokens
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
