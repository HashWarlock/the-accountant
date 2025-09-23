'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, CheckCircle, Wallet, Copy } from 'lucide-react'

interface SignupFormProps {
  onSuccess?: (data: any) => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [userData, setUserData] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      setUserData(data)
      toast.success('Wallet created successfully!')
      onSuccess?.(data)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-gray-900/10 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-gray-900" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Create Wallet</h2>
          <p className="text-gray-600">
            Generate your secure TEE-backed wallet with deterministic keys
          </p>
        </div>
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="alice@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11 w-full max-w-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-sm font-medium">User ID</Label>
              <Input
                id="userId"
                placeholder="alice"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                minLength={3}
                disabled={loading}
                className="h-11 w-full max-w-md"
              />
            </div>
            <Button type="submit" className="w-full max-w-md h-11" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Creating Wallet...' : 'Create Wallet'}
            </Button>
          </form>
        </div>
      </div>

      {userData && userData.user && (
        <div className="bg-white/80 backdrop-blur border border-green-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <h3 className="text-green-900 font-semibold">Wallet Created Successfully</h3>
          </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  User ID
                </Label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white rounded-md border text-sm font-mono">
                    {userData.user.userId}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(userData.user.userId, 'User ID')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Email
                </Label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white rounded-md border text-sm font-mono">
                    {userData.user.email}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(userData.user.email, 'Email')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Ethereum Address
                </Label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white rounded-md border text-xs font-mono break-all">
                    {userData.user.address}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(userData.user.address, 'Address')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Public Key
                </Label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white rounded-md border text-xs font-mono break-all">
                    {userData.user.publicKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(userData.user.publicKey, 'Public Key')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>🔐 Security Note:</strong> Your private key is derived deterministically 
                from your User ID within the secure TEE enclave. Save these credentials securely.
              </p>
            </div>
        </div>
      )}
    </div>
  )
}