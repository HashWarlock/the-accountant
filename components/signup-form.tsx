'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, CheckCircle } from 'lucide-react'

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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Wallet</CardTitle>
        <CardDescription>
          Sign up to generate your secure TEE-backed wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="alice@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              placeholder="alice"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              minLength={3}
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {loading ? 'Creating Wallet...' : 'Create Wallet'}
          </Button>
        </form>

        {userData && userData.user && (
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Wallet Created Successfully!</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">User ID:</span>
                <p className="font-mono bg-background p-2 rounded border">
                  {userData.user.userId}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Email:</span>
                <p className="font-mono bg-background p-2 rounded border">
                  {userData.user.email}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">ETH Address:</span>
                <p className="font-mono break-all bg-background p-2 rounded border text-xs">
                  {userData.user.address}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Public Key:</span>
                <p className="font-mono break-all bg-background p-2 rounded border text-xs">
                  {userData.user.publicKey}
                </p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>⚠️ Important:</strong> Save your credentials! Your private key is derived deterministically from your User ID in the TEE.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}