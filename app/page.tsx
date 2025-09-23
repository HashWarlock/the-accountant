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
        <div className="container flex h-16 items-center">
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <p className="text-2xl text-gray-800 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
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

      {/* Footer */}
      <footer className="py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-6">
            <a 
              href="https://github.com/dstack-tee/dstack" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-black/10 shadow-sm flex items-center justify-center hover:bg-white/90 transition-all duration-200"
              title="Powered by dstack"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#cdfa50"/>
                <path d="M8 7h8c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2z" fill="#1E2119"/>
                <path d="M10 11h4v2h-4v-2z" fill="#cdfa50"/>
              </svg>
            </a>
            
            <a 
              href="https://phala.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-black/10 shadow-sm flex items-center justify-center hover:bg-white/90 transition-all duration-200"
              title="Hosted on Phala Cloud"
            >
              <img 
                src="data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgNS4xMkMwIDMuMzI3ODMgMCAyLjQzMTc1IDAuMzQ4Nzc5IDEuNzQ3MjNDMC42NTU1NzQgMS4xNDUxMSAxLjE0NTExIDAuNjU1NTczIDEuNzQ3MjMgMC4zNDg3NzlDMi40MzE3NSAwIDMuMzI3ODMgMCA1LjEyIDBIMjYuODhDMjguNjcyMiAwIDI5LjU2ODMgMCAzMC4yNTI4IDAuMzQ4Nzc5QzMwLjg1NDkgMC42NTU1NzMgMzEuMzQ0NCAxLjE0NTExIDMxLjY1MTIgMS43NDcyM0MzMiAyLjQzMTc1IDMyIDMuMzI3ODMgMzIgNS4xMlYyNi44OEMzMiAyOC42NzIxIDMyIDI5LjU2ODIgMzEuNjUxMiAzMC4yNTI3QzMxLjM0NDQgMzAuODU0OSAzMC44NTQ5IDMxLjM0NDQgMzAuMjUyOCAzMS42NTEyQzI5LjU2ODMgMzIgMjguNjcyMiAzMiAyNi44OCAzMkg1LjEyQzMuMzI3ODMgMzIgMi40MzE3NSAzMiAxLjc0NzIzIDMxLjY1MTJDMS4xNDUxMSAzMS4zNDQ0IDAuNjU1NTc0IDMwLjg1NDkgMC4zNDg3NzkgMzAuMjUyN0MwIDI5LjU2ODIgMCAyOC42NzIxIDAgMjYuODhWNS4xMloiIGZpbGw9IiNDREZBNTAiLz4KPHBhdGggZD0iTTcuNDY2NjcgMTkuNTU1OEgxMS4wMjIyVjI0Ljg4OTFINy40NjY2N1YxOS41NTU4WiIgZmlsbD0iIzFFMjExOSIvPgo8cGF0aCBkPSJNMjEuNjg4OSAxMC42NjY5SDI1LjI0NDVWMTYuMDAwMkgyMS42ODg5VjEwLjY2NjlaIiBmaWxsPSIjMUUyMTE5Ii8+CjxwYXRoIGQ9Ik0xMS4wMjIyIDE2LjAwMDJIMjEuNjg4OVYxOS41NTU4SDExLjAyMjJWMTYuMDAwMloiIGZpbGw9IiMxRTIxMTkiLz4KPHBhdGggZD0iTTcuNDY2NjcgNy4xMTEzM0gyMS42ODg5VjEwLjY2NjlIMTEuMDIyMlYxNi4wMDAyTDcuNDY2NjcgMTUuOTU1OFY3LjExMTMzWiIgZmlsbD0iIzFFMjExOSIvPgo8L3N2Zz4K" 
                alt="Phala Cloud" 
                className="w-6 h-6"
              />
            </a>

            <a 
              href="https://github.com/HashWarlock/the-accountant" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-black/10 shadow-sm flex items-center justify-center hover:bg-white/90 transition-all duration-200"
              title="Source Code"
            >
              <Github className="w-5 h-5 text-gray-700" />
            </a>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}
