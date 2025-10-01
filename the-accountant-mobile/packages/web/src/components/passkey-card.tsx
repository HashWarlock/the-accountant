import { useState } from 'react'
import { motion } from 'framer-motion'
import { Fingerprint, Loader2, Shield, Check, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { usePasskey } from '../hooks/usePasskey'

interface PasskeyCardProps {
  onSuccess?: (data: { userId: string; email: string; walletAddress: string }) => void
}

export function PasskeyCard({ onSuccess }: PasskeyCardProps) {
  const [mode, setMode] = useState<'choice' | 'register' | 'login'>('choice')
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')

  const {
    registerPasskey,
    authenticatePasskey,
    isRegistering,
    isAuthenticating,
    registerError,
    authError,
    registerData,
    authData,
    isPasskeySupported,
    isPlatformAuthenticatorAvailable,
    reset,
  } = usePasskey()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !userId) return

    try {
      const result = await registerPasskey({ userId, email })
      if (onSuccess) {
        onSuccess({
          userId,
          email,
          walletAddress: result.walletAddress,
        })
      }
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      const result = await authenticatePasskey({ email })
      if (onSuccess) {
        onSuccess({
          userId: result.userId,
          email: result.email,
          walletAddress: result.walletAddress,
        })
      }
    } catch (error) {
      console.error('Authentication failed:', error)
    }
  }

  const handleBack = () => {
    setMode('choice')
    reset()
  }

  if (!isPasskeySupported) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5" />
            Passkey Login
          </CardTitle>
          <CardDescription>
            Passkeys are not supported on this device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <p className="text-sm text-yellow-500">
              Your browser or device does not support passkeys. Please use a modern browser with WebAuthn support.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Success state
  if (registerData || authData) {
    const data = registerData || authData!
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Check className="w-5 h-5" />
              {registerData ? 'Passkey Registered!' : 'Logged In!'}
            </CardTitle>
            <CardDescription>
              {registerData ? 'Your passkey has been created successfully' : 'Welcome back!'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Wallet Address:</span>
                <code className="text-primary">{data.walletAddress.slice(0, 12)}...</code>
              </div>
              {registerData && (
                <div className="flex items-center gap-2 p-3 bg-background rounded-md">
                  <Shield className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    Your wallet is now secured with biometric authentication
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Choice screen
  if (mode === 'choice') {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-primary" />
            Passkey Login
          </CardTitle>
          <CardDescription>
            Secure your wallet with biometric authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPlatformAuthenticatorAvailable && (
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
              <Shield className="w-3 h-3 mr-1" />
              Biometric authentication available
            </Badge>
          )}

          <div className="grid gap-3">
            <Button
              onClick={() => setMode('register')}
              variant="default"
              className="w-full"
            >
              <Fingerprint className="w-4 h-4 mr-2" />
              Create New Passkey
            </Button>

            <Button
              onClick={() => setMode('login')}
              variant="outline"
              className="w-full"
            >
              Login with Passkey
            </Button>
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground font-medium">Why use passkeys?</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>No passwords to remember or manage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Hardware-backed biometric security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Phishing-resistant authentication</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Register mode
  if (mode === 'register') {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-primary" />
            Create Passkey
          </CardTitle>
          <CardDescription>
            Register a new passkey for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reg-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="reg-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isRegistering}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-userid" className="text-sm font-medium">
                User ID
              </label>
              <Input
                id="reg-userid"
                type="text"
                placeholder="unique-user-id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={isRegistering}
                required
              />
              <p className="text-xs text-muted-foreground">
                Same user ID always generates the same wallet address
              </p>
            </div>

            {registerError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">
                  {registerError instanceof Error ? registerError.message : 'Registration failed'}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                disabled={isRegistering}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isRegistering || !email || !userId}
                className="flex-1"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Create Passkey
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  // Login mode
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-primary" />
          Login with Passkey
        </CardTitle>
        <CardDescription>
          Use your registered passkey to authenticate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isAuthenticating}
              required
            />
          </div>

          {authError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive">
                {authError instanceof Error ? authError.message : 'Authentication failed'}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleBack}
              variant="outline"
              disabled={isAuthenticating}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isAuthenticating || !email}
              className="flex-1"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
