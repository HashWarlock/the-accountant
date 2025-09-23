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
      <main className="flex justify-center px-4 pb-24">
        <div className="w-full max-w-4xl">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full max-w-3xl mx-auto bg-transparent gap-2 h-auto p-0">
                <TabsTrigger 
                  value="signup" 
                  className="flex flex-col items-center justify-center space-y-2 p-4 bg-white/80 backdrop-blur border border-black/10 rounded-xl shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-md hover:bg-white/90 transition-all duration-200"
                >
                  <Wallet className="h-5 w-5" />
                  <span className="text-sm font-medium">Create</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sign" 
                  className="flex flex-col items-center justify-center space-y-2 p-4 bg-white/80 backdrop-blur border border-black/10 rounded-xl shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-md hover:bg-white/90 transition-all duration-200"
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-sm font-medium">Sign</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="verify" 
                  className="flex flex-col items-center justify-center space-y-2 p-4 bg-white/80 backdrop-blur border border-black/10 rounded-xl shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-md hover:bg-white/90 transition-all duration-200"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Verify</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="flex flex-col items-center justify-center space-y-2 p-4 bg-white/80 backdrop-blur border border-black/10 rounded-xl shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-md hover:bg-white/90 transition-all duration-200"
                >
                  <Users className="h-5 w-5" />
                  <span className="text-sm font-medium">Users</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="audit" 
                  className="flex flex-col items-center justify-center space-y-2 p-4 bg-white/80 backdrop-blur border border-black/10 rounded-xl shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-md hover:bg-white/90 transition-all duration-200"
                >
                  <Search className="h-5 w-5" />
                  <span className="text-sm font-medium">Audit</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="attestation" 
                  className="flex flex-col items-center justify-center space-y-2 p-4 bg-white/80 backdrop-blur border border-black/10 rounded-xl shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-md hover:bg-white/90 transition-all duration-200"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-sm font-medium">Attest</span>
                </TabsTrigger>
              </TabsList>

              {/* Content Box */}
              <div className="mt-8 bg-white/90 backdrop-blur rounded-2xl border border-black/10 shadow-xl p-8 mx-auto max-w-2xl">
                <TabsContent value="signup" className="m-0">
                  <SignupForm onSuccess={handleSignupSuccess} />
                </TabsContent>

                <TabsContent value="sign" className="m-0">
                  <SignMessage userId={currentUserId} />
                </TabsContent>

                <TabsContent value="verify" className="m-0">
                  <VerifySignature />
                </TabsContent>

                <TabsContent value="users" className="m-0">
                  <UserList />
                </TabsContent>

                <TabsContent value="audit" className="m-0">
                  {currentUserId ? (
                    <AuditLogViewer userId={currentUserId} />
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                        <Search className="h-8 w-8 text-gray-500" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-gray-900">View Audit Logs</h3>
                        <p className="text-gray-600">
                          Enter a User ID to view detailed audit logs and transaction history
                        </p>
                      </div>
                      <div className="flex space-x-3 max-w-sm mx-auto">
                        <Input
                          placeholder="Enter User ID"
                          className="flex-1"
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
                  )}
                </TabsContent>

                <TabsContent value="attestation" className="m-0">
                  <AttestationVerifier />
                </TabsContent>
              </div>
            </Tabs>
          </div>
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
