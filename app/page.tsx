'use client'

import { SignupForm } from '@/components/signup-form'
import { SignMessage } from '@/components/sign-message'
import { VerifySignature } from '@/components/verify-signature'
import { UserList } from '@/components/user-list'
import { AuditLogViewer } from '@/components/audit-log-viewer'
import { AttestationVerifier } from '@/components/attestation-verifier'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Key, Server } from 'lucide-react'
import { Toaster } from '@/components/ui/toast'
import { useState } from 'react'

export default function Home() {
  const [currentUserId, setCurrentUserId] = useState<string>('')

  const handleSignupSuccess = (data: any) => {
    setCurrentUserId(data.userId)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-phala-g00 via-phala-g01 to-phala-g02">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-brand rounded-full shadow-glow phala-pulse">
                  <Shield className="h-10 w-10 text-phala-g09" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold phala-gradient-text">The Accountant</CardTitle>
              <CardDescription className="text-lg text-phala-g08 font-medium mt-2">
                TEE-Secured Wallet Infrastructure powered by Phala Network
              </CardDescription>
              <div className="flex justify-center gap-8 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-phala-g02 rounded-lg border border-phala-g03">
                  <Key className="h-4 w-4 text-phala-lime" />
                  <span className="text-sm font-medium text-phala-g08">Deterministic Keys</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-phala-g02 rounded-lg border border-phala-g03">
                  <Server className="h-4 w-4 text-phala-lime" />
                  <span className="text-sm font-medium text-phala-g08">Intel TDX Protected</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="signup">Create Wallet</TabsTrigger>
              <TabsTrigger value="sign">Sign Message</TabsTrigger>
              <TabsTrigger value="verify">Verify</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="audit">Audit Logs</TabsTrigger>
              <TabsTrigger value="attestation">Attestation</TabsTrigger>
            </TabsList>

            <TabsContent value="signup" className="flex justify-center mt-8">
              <SignupForm onSuccess={handleSignupSuccess} />
            </TabsContent>

            <TabsContent value="sign" className="flex justify-center mt-8">
              <SignMessage userId={currentUserId} />
            </TabsContent>

            <TabsContent value="verify" className="flex justify-center mt-8">
              <VerifySignature />
            </TabsContent>

            <TabsContent value="users" className="mt-8">
              <UserList />
            </TabsContent>

            <TabsContent value="audit" className="mt-8">
              {currentUserId ? (
                <AuditLogViewer userId={currentUserId} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Please create an account or enter a User ID to view audit logs</p>
                  <input
                    type="text"
                    placeholder="Enter User ID"
                    className="px-3 py-2 border border-border rounded-md mr-2 bg-white focus:outline-none focus:ring-2 focus:ring-phala-focus"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        setCurrentUserId(e.currentTarget.value)
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      if (input?.value) {
                        setCurrentUserId(input.value)
                      }
                    }}
                    className="px-4 py-2 bg-phala-lime text-phala-g09 font-medium rounded-md hover:bg-phala-lime-hover transition-colors"
                  >
                    View Logs
                  </button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="attestation" className="flex justify-center mt-8">
              <AttestationVerifier />
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-muted-foreground">
            <p>Built with Next.js 15, dstack SDK, and Prisma</p>
            <p className="mt-2">
              View source on{' '}
              <a
                href="https://github.com/HashWarlock/the-accountant"
                className="underline hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  )
}
