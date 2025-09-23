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
import { Shield, Wallet, FileText, Users, Search } from 'lucide-react'
import { Toaster } from '@/components/ui/toast'
import { useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const [currentUserId, setCurrentUserId] = useState<string>('')

  const handleSignupSuccess = (data: any) => {
    setCurrentUserId(data.userId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#cdfa50]">
      {/* Hero Section */}
      <section className="pt-16 pb-8 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Secure Wallet Infrastructure
          </h1>
          <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
            Enterprise-grade cryptographic operations powered by Intel TDX TEE technology. Create, sign, and verify with hardware-level security guarantees.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex justify-center px-4 pb-24">
        <div className="w-full max-w-4xl">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full max-w-3xl mx-auto bg-transparent gap-3 h-auto p-0">
                <TabsTrigger 
                  value="signup" 
                  className="group flex flex-col items-center justify-center space-y-2 p-4 bg-white/60 backdrop-blur border border-gray-200 rounded-xl shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-blue-200 data-[state=active]:scale-105 hover:bg-white/80 transition-all duration-200"
                >
                  <Wallet className="h-5 w-5 group-data-[state=active]:text-blue-600" />
                  <span className="text-sm font-medium group-data-[state=active]:text-blue-600">Create</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sign" 
                  className="group flex flex-col items-center justify-center space-y-2 p-4 bg-white/60 backdrop-blur border border-gray-200 rounded-xl shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-blue-200 data-[state=active]:scale-105 hover:bg-white/80 transition-all duration-200"
                >
                  <FileText className="h-5 w-5 group-data-[state=active]:text-blue-600" />
                  <span className="text-sm font-medium group-data-[state=active]:text-blue-600">Sign</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="verify" 
                  className="group flex flex-col items-center justify-center space-y-2 p-4 bg-white/60 backdrop-blur border border-gray-200 rounded-xl shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-blue-200 data-[state=active]:scale-105 hover:bg-white/80 transition-all duration-200"
                >
                  <Shield className="h-5 w-5 group-data-[state=active]:text-blue-600" />
                  <span className="text-sm font-medium group-data-[state=active]:text-blue-600">Verify</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="group flex flex-col items-center justify-center space-y-2 p-4 bg-white/60 backdrop-blur border border-gray-200 rounded-xl shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-blue-200 data-[state=active]:scale-105 hover:bg-white/80 transition-all duration-200"
                >
                  <Users className="h-5 w-5 group-data-[state=active]:text-blue-600" />
                  <span className="text-sm font-medium group-data-[state=active]:text-blue-600">Users</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="audit" 
                  className="group flex flex-col items-center justify-center space-y-2 p-4 bg-white/60 backdrop-blur border border-gray-200 rounded-xl shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-blue-200 data-[state=active]:scale-105 hover:bg-white/80 transition-all duration-200"
                >
                  <Search className="h-5 w-5 group-data-[state=active]:text-blue-600" />
                  <span className="text-sm font-medium group-data-[state=active]:text-blue-600">Audit</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="attestation" 
                  className="group flex flex-col items-center justify-center space-y-2 p-4 bg-white/60 backdrop-blur border border-gray-200 rounded-xl shadow-sm data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border-blue-200 data-[state=active]:scale-105 hover:bg-white/80 transition-all duration-200"
                >
                  <Shield className="h-5 w-5 group-data-[state=active]:text-blue-600" />
                  <span className="text-sm font-medium group-data-[state=active]:text-blue-600">Attest</span>
                </TabsTrigger>
              </TabsList>

              {/* Content Box */}
              <div className="mt-8 bg-white/95 backdrop-blur rounded-2xl border border-gray-200 shadow-xl p-8 mx-auto max-w-3xl">
                <TabsContent value="signup" className="m-0 flex justify-center">
                  <div className="w-full max-w-md">
                    <SignupForm onSuccess={handleSignupSuccess} />
                  </div>
                </TabsContent>

                <TabsContent value="sign" className="m-0 flex justify-center">
                  <div className="w-full max-w-md">
                    <SignMessage userId={currentUserId} />
                  </div>
                </TabsContent>

                <TabsContent value="verify" className="m-0 flex justify-center">
                  <div className="w-full max-w-md">
                    <VerifySignature />
                  </div>
                </TabsContent>

                <TabsContent value="users" className="m-0 flex justify-center">
                  <div className="w-full max-w-4xl">
                    <UserList />
                  </div>
                </TabsContent>

                <TabsContent value="audit" className="m-0 flex justify-center">
                  {currentUserId ? (
                    <AuditLogViewer userId={currentUserId} />
                  ) : (
                    <div className="text-center space-y-8 py-12">
                      <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">
                        <Search className="h-10 w-10 text-blue-600" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-gray-900">View Audit Logs</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          Enter a User ID to view detailed audit logs and transaction history for secure operations
                        </p>
                      </div>
                      <div className="flex space-x-3 max-w-sm mx-auto">
                        <Input
                          placeholder="Enter User ID"
                          className="flex-1 h-12"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value) {
                              setCurrentUserId(e.currentTarget.value)
                            }
                          }}
                        />
                        <Button
                          className="h-12 px-6"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement
                            if (input?.value) {
                              setCurrentUserId(input.value)
                            }
                          }}
                        >
                          View Logs
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="attestation" className="m-0 flex justify-center">
                  <div className="w-full max-w-2xl">
                    <AttestationVerifier />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a 
              href="https://github.com/dstack-tee/dstack" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-6 py-4 bg-white/90 backdrop-blur border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
            >
              <div className="h-8 w-auto flex items-center">
                <Image 
                  src="/dstack-logo.png" 
                  alt="dstack"
                  width={96}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-gray-900">dstack</span>
            </a>
            
            <a 
              href="https://phala.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-6 py-4 bg-white/90 backdrop-blur border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
            >
              <div className="h-8 w-auto flex items-center">
                <Image 
                  src="/phala-logo.png" 
                  alt="Phala"
                  width={96}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-gray-900">PHALA</span>
            </a>

            <a 
              href="https://github.com/HashWarlock/the-accountant" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-6 py-4 bg-white/90 backdrop-blur border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
            >
              <div className="h-8 w-auto flex items-center">
                <Image 
                  src="/github-logo.png" 
                  alt="GitHub"
                  width={96}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-gray-900">GitHub</span>
            </a>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}
