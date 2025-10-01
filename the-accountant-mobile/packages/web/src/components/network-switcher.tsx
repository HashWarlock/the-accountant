import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Network, Check } from 'lucide-react'

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
    id: 'sepolia',
    name: 'Sepolia',
    rpc: 'https://eth-sepolia.public.blastapi.io',
    chainId: 11155111,
    currency: 'ETH',
    explorer: 'https://sepolia.etherscan.io',
  },
  {
    id: 'polygon-amoy',
    name: 'Polygon Amoy',
    rpc: 'https://rpc-amoy.polygon.technology',
    chainId: 80002,
    currency: 'MATIC',
    explorer: 'https://amoy.polygonscan.com',
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

  const handleNetworkChange = (network: NetworkConfig) => {
    setSelectedNetwork(network)
    onNetworkChange(network)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          Switch Networks
        </CardTitle>
        <CardDescription>
          Choose the blockchain network to interact with
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {NETWORKS.map((network) => (
          <Button
            key={network.id}
            variant={selectedNetwork.id === network.id ? 'default' : 'outline'}
            className="w-full justify-between"
            onClick={() => handleNetworkChange(network)}
          >
            <span>{network.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {network.currency}
              </Badge>
              {selectedNetwork.id === network.id && (
                <Check className="h-4 w-4" />
              )}
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

export type { NetworkConfig }
export { NETWORKS }
