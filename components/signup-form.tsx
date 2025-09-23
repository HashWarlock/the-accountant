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
    <Card className="w-full max-w-lg border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-8">
        <div className="space-y-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🔐</span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Create Wallet</CardTitle>
          <CardDescription className="text-slate-600 text-base">
            Generate your secure TEE-backed wallet with deterministic keys
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="alice@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-12 border-2 border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-0 transition-all duration-200"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="userId" className="text-slate-700 font-semibold">User ID</Label>
            <Input
              id="userId"
              placeholder="alice"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              minLength={3}
              disabled={loading}
              className="h-12 border-2 border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-0 transition-all duration-200"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin mr-2" />}
            {loading ? 'Creating Wallet...' : 'Create Wallet'}
          </Button>
        </form>

        {userData && userData.user && (
          <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-200 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle className="h-6 w-6" />
              <span className="font-bold text-lg">Wallet Created Successfully!</span>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-emerald-700 font-semibold block mb-2">User ID:</span>
                <p className="font-mono bg-white p-3 rounded-xl border border-emerald-200 text-slate-900">
                  {userData.user.userId}
                </p>
              </div>
              <div>
                <span className="text-emerald-700 font-semibold block mb-2">Email:</span>
                <p className="font-mono bg-white p-3 rounded-xl border border-emerald-200 text-slate-900">
                  {userData.user.email}
                </p>
              </div>
              <div>
                <span className="text-emerald-700 font-semibold block mb-2">ETH Address:</span>
                <p className="font-mono break-all bg-white p-3 rounded-xl border border-emerald-200 text-xs text-slate-900">
                  {userData.user.address}
                </p>
              </div>
              <div>
                <span className="text-emerald-700 font-semibold block mb-2">Public Key:</span>
                <p className="font-mono break-all bg-white p-3 rounded-xl border border-emerald-200 text-xs text-slate-900">
                  {userData.user.publicKey}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>🔐 Security Note:</strong> Your private key is derived deterministically from your User ID within the secure TEE enclave. Save these credentials securely.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}