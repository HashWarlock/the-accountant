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
    <main className="min-h-screen bg-gradient-to-b from-white via-phala-g00 to-phala-g01">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <div className="inline-flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-phala-lime/20 blur-3xl rounded-full"></div>
                <div className="relative p-5 bg-white rounded-2xl shadow-xl border border-phala-g03">
                  <Shield className="h-12 w-12 text-phala-lime" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-phala-g09 to-phala-g08 bg-clip-text text-transparent">
                  The Accountant
                </span>
              </h1>
              <p className="text-xl text-phala-g08 max-w-2xl mx-auto leading-relaxed">
                Enterprise-grade TEE-secured wallet infrastructure powered by 
                <span className="font-semibold text-phala-lime"> Phala Network</span>
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="group flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-phala-g03">
                <div className="p-2 bg-phala-lime/10 rounded-lg group-hover:bg-phala-lime/20 transition-colors">
                  <Key className="h-5 w-5 text-phala-lime" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-phala-g08 uppercase tracking-wider">Secure</p>
                  <p className="text-sm font-semibold text-phala-g09">Deterministic Keys</p>
                </div>
              </div>
              
              <div className="group flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-phala-g03">
                <div className="p-2 bg-phala-lime/10 rounded-lg group-hover:bg-phala-lime/20 transition-colors">
                  <Server className="h-5 w-5 text-phala-lime" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-phala-g08 uppercase tracking-wider">Protected</p>
                  <p className="text-sm font-semibold text-phala-g09">Intel TDX TEE</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-3xl shadow-xl border border-phala-g03 overflow-hidden">
            <Tabs defaultValue="signup" className="w-full">
              <div className="border-b border-phala-g03 bg-phala-g00/50">
                <TabsList className="grid w-full grid-cols-6 bg-transparent h-14 p-1">
                  <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Create Wallet
                  </TabsTrigger>
                  <TabsTrigger value="sign" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Sign Message
                  </TabsTrigger>
                  <TabsTrigger value="verify" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Verify
                  </TabsTrigger>
                  <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="audit" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Audit Logs
                  </TabsTrigger>
                  <TabsTrigger value="attestation" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Attestation
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="signup" className="p-8">
                <div className="max-w-md mx-auto">
                  <SignupForm onSuccess={handleSignupSuccess} />
                </div>
              </TabsContent>

              <TabsContent value="sign" className="p-8">
                <div className="max-w-md mx-auto">
                  <SignMessage userId={currentUserId} />
                </div>
              </TabsContent>

              <TabsContent value="verify" className="p-8">
                <div className="max-w-md mx-auto">
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
                  <div className="max-w-md mx-auto text-center space-y-6">
                    <div className="p-8 bg-phala-g00 rounded-2xl border border-phala-g02">
                      <p className="text-phala-g08 mb-6">Please create an account or enter a User ID to view audit logs</p>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Enter User ID"
                          className="flex-1 px-4 py-3 border-2 border-phala-g03 rounded-lg bg-white focus:outline-none focus:border-phala-lime focus:ring-0 transition-colors text-phala-g09"
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
                          className="px-6 py-3 bg-phala-lime text-phala-g09 font-semibold rounded-lg hover:bg-phala-lime-hover active:bg-phala-lime-active transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          View Logs
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="attestation" className="p-8">
                <div className="max-w-2xl mx-auto">
                  <AttestationVerifier />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="text-center space-y-4 pt-8">
            <div className="inline-flex items-center gap-6 text-sm text-phala-g07">
              <a
                href="https://github.com/HashWarlock/the-accountant"
                className="inline-flex items-center gap-2 hover:text-phala-lime transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="font-medium">View Source</span>
              </a>
              <span className="text-phala-g05">•</span>
              <span>Powered by Phala Network</span>
              <span className="text-phala-g05">•</span>
              <span>Intel TDX TEE</span>
            </div>
            <p className="text-xs text-phala-g06">
              © 2024 The Accountant. Enterprise-grade wallet infrastructure.
            </p>
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  )
}
