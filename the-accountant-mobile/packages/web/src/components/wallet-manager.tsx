import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { TruncatedAddress } from './truncated-address'
import { PasskeyCard } from './passkey-card'
import { ArrowLeft, Shield } from 'lucide-react'

interface WalletManagerProps {
  walletAddress: string | null
  onDisconnect: () => void
  onPasskeySuccess: (data: { userId: string; email: string; walletAddress: string }) => void
}

export function WalletManager({ walletAddress, onDisconnect, onPasskeySuccess }: WalletManagerProps) {
  const [showPasskeyRecovery, setShowPasskeyRecovery] = useState(false)

  if (!walletAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Passkey Login
          </CardTitle>
          <CardDescription>
            Secure your wallet with biometric authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasskeyCard onSuccess={onPasskeySuccess} />
        </CardContent>
      </Card>
    )
  }

  if (showPasskeyRecovery) {
    return (
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPasskeyRecovery(false)}
            className="mb-2 w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Passkey Recovery
          </CardTitle>
          <CardDescription>
            Authenticate with an existing passkey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasskeyCard
            onSuccess={(data) => {
              onPasskeySuccess(data)
              setShowPasskeyRecovery(false)
            }}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Active wallet</CardTitle>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Active
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onDisconnect}>
            Log out
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <TruncatedAddress address={walletAddress} />
          <p className="text-xs text-muted-foreground mt-1">
            <Shield className="h-3 w-3 inline mr-1" />
            Passkey recovery
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Currently active</p>
      </CardContent>
    </Card>
  )
}
