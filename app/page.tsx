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
      <main className="flex justify-center px-4 pb-16">
        <div className="w-full max-w-4xl">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid grid-cols-6 w-full max-w-3xl mx-auto bg-white/80 backdrop-blur border border-gray-200 rounded-xl p-2 gap-1 h-auto">
                <TabsTrigger 
                  value="signup" 
                  className="flex flex-col items-center justify-center space-y-1 p-2 rounded-lg text-gray-600 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <Wallet className="h-4 w-4" />
                  <span className="text-xs font-medium">Create</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sign" 
                  className="flex flex-col items-center justify-center space-y-1 p-2 rounded-lg text-gray-600 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-medium">Sign</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="verify" 
                  className="flex flex-col items-center justify-center space-y-1 p-2 rounded-lg text-gray-600 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-medium">Verify</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="flex flex-col items-center justify-center space-y-1 p-2 rounded-lg text-gray-600 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-medium">Users</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="audit" 
                  className="flex flex-col items-center justify-center space-y-1 p-2 rounded-lg text-gray-600 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <Search className="h-4 w-4" />
                  <span className="text-xs font-medium">Audit</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="attestation" 
                  className="flex flex-col items-center justify-center space-y-1 p-2 rounded-lg text-gray-600 hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-medium">Attest</span>
                </TabsTrigger>
              </TabsList>

              {/* Content Card */}
              <Card className="mt-6 mx-auto max-w-3xl border-0 shadow-lg p-6">
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
              </Card>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <hr className="border-gray-300 mb-6" />
            <p className="text-sm text-gray-600 font-medium mb-8">SOURCES</p>
          </div>
          <div className="flex items-center justify-center gap-8">
            <a 
              href="https://github.com/dstack-tee/dstack" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              <Image 
                src="/dstack-logo.png" 
                alt="dstack"
                width={80}
                height={24}
                className="object-contain"
              />
            </a>
            
            <a 
              href="https://phala.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              <Image 
                src="/phala-logo.png" 
                alt="Phala"
                width={80}
                height={24}
                className="object-contain"
              />
            </a>

            <a 
              href="https://github.com/HashWarlock/the-accountant" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              <Image 
                src="/github-logo.png" 
                alt="GitHub"
                width={80}
                height={24}
                className="object-contain"
              />
            </a>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}
