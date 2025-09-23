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
    <div className="min-h-screen bg-gradient-to-br from-white to-[#cdfa50]">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-end">
          <Button variant="ghost" size="sm" asChild>
            <a href="https://github.com/HashWarlock/the-accountant" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" />
              Source
            </a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center rounded-full border border-black/10 bg-white/80 backdrop-blur px-4 py-2 text-sm font-medium mb-12 shadow-sm">
            <Shield className="h-4 w-4 mr-2" />
            Powered by{' '}
            <a href="https://github.com/dstack-tee/dstack" target="_blank" rel="noopener noreferrer" className="text-black hover:underline mx-1 font-semibold">
              dstack
            </a>
            {' '}Hosted on{' '}
            <a href="https://phala.com" target="_blank" rel="noopener noreferrer" className="text-black hover:underline ml-1 font-semibold">
              Phala Cloud
            </a>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
            Enterprise Wallet
            <br />
            <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
              Infrastructure
            </span>
          </h1>
          
          <p className="text-2xl text-gray-700 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
            Zero-trust cryptographic operations in a secure enclave. Deterministic wallet generation with hardware-level security guarantees.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 pb-24">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-gray-50/80 h-16 p-2">
              <TabsTrigger 
                value="signup" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl transition-all duration-200"
              >
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Create</span>
              </TabsTrigger>
              <TabsTrigger 
                value="sign" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl transition-all duration-200"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Sign</span>
              </TabsTrigger>
              <TabsTrigger 
                value="verify" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl transition-all duration-200"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Verify</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl transition-all duration-200"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Users</span>
              </TabsTrigger>
              <TabsTrigger 
                value="audit" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl transition-all duration-200"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Audit</span>
              </TabsTrigger>
              <TabsTrigger 
                value="attestation" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl transition-all duration-200"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Attest</span>
              </TabsTrigger>
            </TabsList>

          <TabsContent value="signup" className="p-8">
            <div className="max-w-lg mx-auto">
              <SignupForm onSuccess={handleSignupSuccess} />
            </div>
          </TabsContent>

          <TabsContent value="sign" className="p-8">
            <div className="max-w-lg mx-auto">
              <SignMessage userId={currentUserId} />
            </div>
          </TabsContent>

          <TabsContent value="verify" className="p-8">
            <div className="max-w-lg mx-auto">
              <VerifySignature />
            </div>
          </TabsContent>

          <TabsContent value="users" className="p-8">
            <UserList />
          </TabsContent>

          <TabsContent value="audit" className="p-8">
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

          <TabsContent value="attestation" className="p-8">
            <AttestationVerifier />
          </TabsContent>
          </Tabs>
        </div>
      </main>

      <Toaster />
    </div>
  )
}
