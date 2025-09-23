'use client'

import { SignupForm } from '@/components/signup-form'
import { SignMessage } from '@/components/sign-message'
import { VerifySignature } from '@/components/verify-signature'
import { UserList } from '@/components/user-list'
import { AuditLogViewer } from '@/components/audit-log-viewer'
import { AttestationVerifier } from '@/components/attestation-verifier'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Wallet, FileText, Users, Search, Github } from 'lucide-react'
import { Toaster } from '@/components/ui/toast'
import { useState } from 'react'

export default function Home() {
  const [currentUserId, setCurrentUserId] = useState<string>('')

  const handleSignupSuccess = (data: any) => {
    setCurrentUserId(data.userId)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">The Accountant</h1>
              <p className="text-xs text-muted-foreground">TEE-Secured Wallet Infrastructure</p>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <a href="https://github.com/HashWarlock/the-accountant" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                Source
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium mb-8">
            <Shield className="h-4 w-4 mr-2" />
            Powered by Intel TDX TEE Technology
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Enterprise Wallet
            <br />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Infrastructure
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Zero-trust cryptographic operations in a secure enclave. 
            Deterministic wallet generation with hardware-level security guarantees.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="p-6 text-left">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Deterministic Keys</h3>
                  <p className="text-sm text-muted-foreground">Reproducible wallets</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 text-left">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">TEE Protection</h3>
                  <p className="text-sm text-muted-foreground">Hardware isolation</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 pb-24">
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="signup" className="flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
            </TabsTrigger>
            <TabsTrigger value="sign" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Sign</span>
            </TabsTrigger>
            <TabsTrigger value="verify" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Verify</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="attestation" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Attest</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signup" className="space-y-8">
            <div className="max-w-md mx-auto">
              <SignupForm onSuccess={handleSignupSuccess} />
            </div>
          </TabsContent>

          <TabsContent value="sign" className="space-y-8">
            <div className="max-w-md mx-auto">
              <SignMessage userId={currentUserId} />
            </div>
          </TabsContent>

          <TabsContent value="verify" className="space-y-8">
            <div className="max-w-md mx-auto">
              <VerifySignature />
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-8">
            <UserList />
          </TabsContent>

          <TabsContent value="audit" className="space-y-8">
            {currentUserId ? (
              <AuditLogViewer userId={currentUserId} />
            ) : (
              <Card className="p-8 max-w-md mx-auto text-center">
                <div className="space-y-6">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">View Audit Logs</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter a User ID to view detailed audit logs and transaction history
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter User ID"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          setCurrentUserId(e.currentTarget.value)
                        }
                      }}
                    />
                    <Button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        if (input?.value) {
                          setCurrentUserId(input.value)
                        }
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="attestation" className="space-y-8">
            <AttestationVerifier />
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  )
}
