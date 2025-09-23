'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Loader2, CheckCircle, Wallet, Copy, Mail, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CollapsibleDetails, DetailItem } from '@/components/ui/collapsible-details'

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  userId: z.string().min(3, 'User ID must be at least 3 characters').max(50),
})

interface SignupFormProps {
  onSuccess?: (data: any) => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      userId: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      setUserData(data)
      toast.success('Wallet created successfully!')
      onSuccess?.(data)
      form.reset()
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-phala-lime/20 to-phala-lime/10 backdrop-blur-sm flex items-center justify-center border border-phala-lime/30 shadow-lg shadow-phala-lime/20">
            <Wallet className="h-8 w-8 text-phala-lime" />
          </div>
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-br from-phala-g00 to-phala-g01 bg-clip-text text-transparent">
            Create Secure Wallet
          </h2>
          <p className="text-phala-g02 max-w-md mx-auto">
            Generate your TEE-backed wallet with deterministic keys and hardware-level security
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-phala-g09/5 backdrop-blur-sm rounded-2xl p-8 border border-phala-g08/20"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-phala-g01">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="alice@example.com"
                      {...field}
                      disabled={loading}
                      className="h-12 bg-phala-g09/10 border-phala-g08/30 focus:border-phala-lime transition-colors"
                    />
                  </FormControl>
                  <FormDescription>
                    We'll use this to identify your wallet
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-phala-g01">
                    <User className="h-4 w-4" />
                    User ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="alice"
                      {...field}
                      disabled={loading}
                      className="h-12 bg-phala-g09/10 border-phala-g08/30 focus:border-phala-lime transition-colors"
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a unique identifier (minimum 3 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12"
              variant="phala"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Secure Wallet...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Create Wallet
                </>
              )}
            </Button>
          </form>
        </Form>
      </motion.div>

      <AnimatePresence>
        {userData && userData.user && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <CollapsibleDetails
              title="Wallet Created Successfully!"
              summary={`User ID: ${userData.user.userId} • ${userData.user.address.slice(0, 6)}...${userData.user.address.slice(-4)}`}
              defaultOpen={true}
              icon={<CheckCircle className="h-6 w-6 text-phala-lime" />}
              badge={
                <Badge variant="outline" className="border-phala-lime/30 text-phala-lime bg-phala-lime/10">
                  TEE Secured
                </Badge>
              }
              className="border-phala-lime/30 bg-gradient-to-br from-phala-lime/10 to-phala-g09/10"
            >
              <div className="grid gap-3">
                <DetailItem
                  label="User ID"
                  value={userData.user.userId}
                  onCopy={() => copyToClipboard(userData.user.userId, 'User ID')}
                />
                <DetailItem
                  label="Email"
                  value={userData.user.email}
                  onCopy={() => copyToClipboard(userData.user.email, 'Email')}
                />
                <DetailItem
                  label="Ethereum Address"
                  value={userData.user.address}
                  onCopy={() => copyToClipboard(userData.user.address, 'Ethereum Address')}
                  mono
                />
                <DetailItem
                  label="Public Key"
                  value={userData.user.publicKey}
                  onCopy={() => copyToClipboard(userData.user.publicKey, 'Public Key')}
                  mono
                />
              </div>

              <Alert className="mt-4 border-phala-lime/30 bg-gradient-to-r from-phala-lime/10 to-phala-g09/10">
                <AlertDescription className="text-sm text-phala-g01">
                  <strong className="text-phala-lime">🔐 Security Note:</strong> Your private key is derived deterministically
                  from your User ID within the secure TEE enclave. Save these credentials securely.
                </AlertDescription>
              </Alert>
            </CollapsibleDetails>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}