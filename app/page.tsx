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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-12">
            <div className="inline-flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-cyan-400/30 blur-3xl rounded-full scale-150"></div>
              <div className="relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50">
                <Shield className="h-16 w-16 text-emerald-600" />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-emerald-100 rounded-full text-emerald-800 text-sm font-medium">
                  🛡️ Powered by Intel TDX TEE Technology
                </div>
                <h1 className="text-6xl lg:text-7xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                    The Accountant
                  </span>
                </h1>
                <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
                  Enterprise-grade TEE-secured wallet infrastructure.
                  <br />
                  <span className="font-semibold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                    Zero-trust cryptographic operations in a secure enclave.
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <div className="group flex items-center gap-4 px-8 py-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/50 hover:border-emerald-200">
                <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
                  <Key className="h-6 w-6 text-emerald-700" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Cryptographic</p>
                  <p className="text-base font-bold text-slate-900">Deterministic Keys</p>
                </div>
              </div>
              
              <div className="group flex items-center gap-4 px-8 py-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/50 hover:border-cyan-200">
                <div className="p-3 bg-cyan-100 rounded-xl group-hover:bg-cyan-200 transition-colors">
                  <Server className="h-6 w-6 text-cyan-700" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Hardware</p>
                  <p className="text-base font-bold text-slate-900">Intel TDX TEE</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
            <Tabs defaultValue="signup" className="w-full">
              <div className="border-b border-slate-200/60 bg-slate-50/80">
                <TabsList className="grid w-full grid-cols-6 bg-transparent h-16 p-2 gap-1">
                  <TabsTrigger 
                    value="signup" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-slate-200 rounded-xl font-semibold text-slate-700 data-[state=active]:text-slate-900 hover:bg-white/60 transition-all duration-200"
                  >
                    Create Wallet
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sign" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-slate-200 rounded-xl font-semibold text-slate-700 data-[state=active]:text-slate-900 hover:bg-white/60 transition-all duration-200"
                  >
                    Sign Message
                  </TabsTrigger>
                  <TabsTrigger 
                    value="verify" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-slate-200 rounded-xl font-semibold text-slate-700 data-[state=active]:text-slate-900 hover:bg-white/60 transition-all duration-200"
                  >
                    Verify
                  </TabsTrigger>
                  <TabsTrigger 
                    value="users" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-slate-200 rounded-xl font-semibold text-slate-700 data-[state=active]:text-slate-900 hover:bg-white/60 transition-all duration-200"
                  >
                    Users
                  </TabsTrigger>
                  <TabsTrigger 
                    value="audit" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-slate-200 rounded-xl font-semibold text-slate-700 data-[state=active]:text-slate-900 hover:bg-white/60 transition-all duration-200"
                  >
                    Audit Logs
                  </TabsTrigger>
                  <TabsTrigger 
                    value="attestation" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border-slate-200 rounded-xl font-semibold text-slate-700 data-[state=active]:text-slate-900 hover:bg-white/60 transition-all duration-200"
                  >
                    Attestation
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="signup" className="p-12">
                <div className="max-w-lg mx-auto">
                  <SignupForm onSuccess={handleSignupSuccess} />
                </div>
              </TabsContent>

              <TabsContent value="sign" className="p-12">
                <div className="max-w-lg mx-auto">
                  <SignMessage userId={currentUserId} />
                </div>
              </TabsContent>

              <TabsContent value="verify" className="p-12">
                <div className="max-w-lg mx-auto">
                  <VerifySignature />
                </div>
              </TabsContent>

              <TabsContent value="users" className="p-12">
                <UserList />
              </TabsContent>

              <TabsContent value="audit" className="p-12">
                {currentUserId ? (
                  <AuditLogViewer userId={currentUserId} />
                ) : (
                  <div className="max-w-lg mx-auto text-center space-y-8">
                    <div className="p-10 bg-slate-50 rounded-3xl border border-slate-200">
                      <div className="space-y-6">
                        <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto">
                          <span className="text-2xl">📊</span>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-xl font-bold text-slate-900">View Audit Logs</h3>
                          <p className="text-slate-600">Enter a User ID to view detailed audit logs and transaction history</p>
                        </div>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="Enter User ID"
                            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:border-emerald-400 focus:ring-0 transition-all duration-200 text-slate-900 placeholder-slate-400"
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
                            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 active:bg-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            View Logs
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="attestation" className="p-12">
                <div className="max-w-3xl mx-auto">
                  <AttestationVerifier />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="text-center space-y-6 pt-12">
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-600">
              <a
                href="https://github.com/HashWarlock/the-accountant"
                className="inline-flex items-center gap-2 hover:text-emerald-600 transition-colors font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>View Source Code</span>
              </a>
              <span className="text-slate-300">•</span>
              <span>Powered by <span className="font-semibold text-emerald-600">Phala Network</span></span>
              <span className="text-slate-300">•</span>
              <span>Secured by <span className="font-semibold text-cyan-600">Intel TDX TEE</span></span>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
            <p className="text-sm text-slate-500">
              © 2025 The Accountant Demo. 
              <span className="font-medium"> Enterprise-grade wallet infrastructure for the modern web.</span>
            </p>
          </div>
        </div>
      </div>
      <Toaster />
    </main>
  )
}
