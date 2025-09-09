'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, PenTool } from 'lucide-react'

interface SignMessageProps {
  userId?: string
}

export function SignMessage({ userId: defaultUserId }: SignMessageProps) {
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(defaultUserId || '')
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/users/${userId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signing failed')
      }

      setSignature(data.signature)
      toast.success('Message signed successfully!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign Message</CardTitle>
        <CardDescription>
          Sign a message using your TEE-backed private key
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSign} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sign-userId">User ID</Label>
            <Input
              id="sign-userId"
              placeholder="alice"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              placeholder="Hello, dstack!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />}
            {loading ? 'Signing...' : 'Sign Message'}
          </Button>
        </form>

        {signature && (
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <PenTool className="h-4 w-4" />
              <span className="font-medium">Signature Generated</span>
            </div>
            <p className="font-mono text-xs break-all">{signature}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}