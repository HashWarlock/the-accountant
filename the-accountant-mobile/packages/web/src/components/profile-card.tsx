import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { LogOut, Copy, Check } from 'lucide-react'
import type { NetworkConfig } from './network-switcher'
import { useState } from 'react'

interface ProfileCardProps {
  walletAddress: string | null
  userId: string | null
  currentNetwork: NetworkConfig
  networks: NetworkConfig[]
  onNetworkChange: (network: NetworkConfig) => void
  onDisconnect: () => void
}

export function ProfileCard({
  walletAddress,
  userId,
  currentNetwork,
  networks,
  onNetworkChange,
  onDisconnect,
}: ProfileCardProps) {
  const [copied, setCopied] = useState(false)

  if (!walletAddress) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-border/50 bg-transparent">
      <CardContent className="px-4">
        <div className="flex items-center justify-between gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🥷</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">@{userId || walletAddress.slice(0, 8)}</p>
              <Select
                value={currentNetwork.id}
                onValueChange={(value) => {
                  const network = networks.find((n) => n.id === value)
                  if (network) onNetworkChange(network)
                }}
              >
                <SelectTrigger className="w-[120px] h-6 border-0 bg-transparent p-0 focus:ring-0">
                  <SelectValue>
                    <span className="text-xs text-muted-foreground">{currentNetwork.name}</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {networks.map((network) => (
                    <SelectItem key={network.id} value={network.id}>
                      {network.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDisconnect}
            className="h-8 w-8 p-0"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Owner Address - Small */}
        <div className="mt-3 pt-3 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground mb-0.5">Owner</p>
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono truncate flex-1">
              {walletAddress}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
