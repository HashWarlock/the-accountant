import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Network, Check, ChevronDown, ChevronRight } from 'lucide-react'

interface NetworkConfig {
  id: string
  name: string
  rpc: string
  chainId: number
  currency: string
  explorer: string
}

const NETWORKS: NetworkConfig[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    rpc: 'https://eth.llamarpc.com',
    chainId: 1,
    currency: 'ETH',
    explorer: 'https://etherscan.io',
  },
  {
    id: 'sepolia',
    name: 'Sepolia',
    rpc: 'https://eth-sepolia.public.blastapi.io',
    chainId: 11155111,
    currency: 'ETH',
    explorer: 'https://sepolia.etherscan.io',
  },
  {
    id: 'base',
    name: 'Base',
    rpc: 'https://mainnet.base.org',
    chainId: 8453,
    currency: 'ETH',
    explorer: 'https://basescan.org',
  },
  {
    id: 'base-sepolia',
    name: 'Base Sepolia',
    rpc: 'https://sepolia.base.org',
    chainId: 84532,
    currency: 'ETH',
    explorer: 'https://sepolia.basescan.org',
  },
]

interface NetworkSwitcherProps {
  onNetworkChange: (network: NetworkConfig) => void
  currentNetwork?: NetworkConfig
}

export function NetworkSwitcher({ onNetworkChange, currentNetwork }: NetworkSwitcherProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig>(
    currentNetwork || NETWORKS[0]
  )
  const [isExpanded, setIsExpanded] = useState(false)

  const handleNetworkChange = (network: NetworkConfig) => {
    setSelectedNetwork(network)
    onNetworkChange(network)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left hover:opacity-80 transition-opacity"
        >
          <CardTitle className="flex items-center gap-2 text-base">
            <Network className="h-4 w-4 text-primary" />
            Networks
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {selectedNetwork.name}
            </Badge>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-2 pt-0">
          {NETWORKS.map((network) => (
            <Button
              key={network.id}
              variant={selectedNetwork.id === network.id ? 'default' : 'outline'}
              className="w-full justify-between text-sm h-9"
              onClick={() => handleNetworkChange(network)}
            >
              <span>{network.name}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {network.currency}
                </Badge>
                {selectedNetwork.id === network.id && (
                  <Check className="h-3.5 w-3.5" />
                )}
              </div>
            </Button>
          ))}
        </CardContent>
      )}
    </Card>
  )
}

export type { NetworkConfig }
export { NETWORKS }
