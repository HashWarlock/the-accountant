import { useState } from 'react'
import { useWallet } from './hooks/useWallet'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { TruncatedAddress } from './components/truncated-address'
import { CopyButton } from './components/copy-button'
import { PasskeyCard } from './components/passkey-card'
import { ExternalLink, Loader2, Shield, Key, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

function App() {
  const {
    signup,
    signMessage,
    verifySignature,
    disconnect,
    isSigningUp,
    isSigning,
    isVerifying,
    signupData,
    signData,
    verifyData,
  } = useWallet()

  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [message, setMessage] = useState('Hello from The Accountant Mobile in TEE')
  const [verifyMessage, setVerifyMessage] = useState('')
  const [verifySignatureInput, setVerifySignatureInput] = useState('')
  const [verifyUserId, setVerifyUserId] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    await signup({ email, userId })
  }

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault()
    await signMessage(message)
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    await verifySignature({
      message: verifyMessage,
      signature: verifySignatureInput,
      userId: verifyUserId,
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            The Accountant
          </h1>
          <p className="text-muted-foreground text-lg">
            TEE-backed deterministic key management with hardware-level security
          </p>
        </motion.div>

        {/* User Info Section */}
        {signupData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-primary">Connected Wallet</CardTitle>
                    <CardDescription className="mt-2">
                      User ID: <span className="font-mono">{signupData.user.userId}</span>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={disconnect}>
                    Disconnect
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Address</p>
                    <TruncatedAddress address={signupData.user.address} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="text-sm">{signupData.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">TEE Attestation</p>
                    <a
                      href={signupData.attestation.verificationUrls.t16z}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline inline-flex items-center gap-1"
                    >
                      View on t16z <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Passkey Login Card */}
          {!signupData && (
            <motion.div variants={itemVariants}>
              <PasskeyCard
                onSuccess={(data) => {
                  console.log('Passkey auth success:', data)
                  // User is now authenticated with passkey
                }}
              />
            </motion.div>
          )}

          {/* Wallet Creation Card */}
          {!signupData && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    Create Wallet
                  </CardTitle>
                  <CardDescription>
                    Create a new TEE-backed wallet with deterministic key derivation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">User ID</label>
                      <Input
                        type="text"
                        placeholder="unique-user-id"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Same user ID always generates the same wallet
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSigningUp}>
                      {isSigningUp ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Wallet...
                        </>
                      ) : (
                        'Create Wallet'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Sign Message Card */}
          {signupData && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Sign Message
                  </CardTitle>
                  <CardDescription>
                    Sign a message with your TEE-backed private key
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSign} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Message</label>
                      <Textarea
                        placeholder="Enter message to sign..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={3}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSigning}>
                      {isSigning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing...
                        </>
                      ) : (
                        'Sign Message'
                      )}
                    </Button>
                  </form>

                  {signData && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 space-y-3 pt-4 border-t border-border"
                    >
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Signature</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-card p-2 rounded flex-1 overflow-x-auto">
                            {signData.signature.slice(0, 20)}...
                          </code>
                          <CopyButton text={signData.signature} />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Timestamp</p>
                        <p className="text-sm font-mono">{new Date(signData.timestamp).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">TEE Attestation</p>
                        <a
                          href={signData.attestation.verificationUrls.t16z}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm hover:underline inline-flex items-center gap-1"
                        >
                          View on t16z <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Verify Signature Card */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Verify Signature
                </CardTitle>
                <CardDescription>
                  Verify a signature and recover the signer's address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      placeholder="Original message..."
                      value={verifyMessage}
                      onChange={(e) => setVerifyMessage(e.target.value)}
                      required
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Signature</label>
                    <Input
                      type="text"
                      placeholder="0x..."
                      value={verifySignatureInput}
                      onChange={(e) => setVerifySignatureInput(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">User ID</label>
                    <Input
                      type="text"
                      placeholder="user-id"
                      value={verifyUserId}
                      onChange={(e) => setVerifyUserId(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isVerifying}>
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Signature'
                    )}
                  </Button>
                </form>

                {verifyData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 space-y-3 pt-4 border-t border-border"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={verifyData.valid ? 'success' : 'destructive'}>
                        {verifyData.valid ? '✓ Valid' : '✗ Invalid'}
                      </Badge>
                    </div>
                    {verifyData.valid && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Recovered Address</p>
                          <TruncatedAddress address={verifyData.recoveredAddress} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">User Address</p>
                          <TruncatedAddress address={verifyData.user.address} />
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-green-500">
                            ✓ Addresses match - Signature is authentic!
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Card */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-primary mb-1 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    TEE-Backed Security
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Keys derived in Trusted Execution Environment with Intel TDX attestation
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-1 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Deterministic Wallets
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Same user ID always generates the same wallet address
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-primary mb-1 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Remote Attestation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Verifiable proof of TEE execution with blockchain verification
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default App
