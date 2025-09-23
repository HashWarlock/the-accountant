"use client";

import { SignupForm } from "@/components/signup-form";
import { SignMessage } from "@/components/sign-message";
import { VerifySignature } from "@/components/verify-signature";
import { UserList } from "@/components/user-list";
import { AuditLogViewer } from "@/components/audit-log-viewer";
import { AttestationVerifier } from "@/components/attestation-verifier";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Wallet, FileText, Users, Search } from "lucide-react";
import { Toaster } from "@/components/ui/toast";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const handleSignupSuccess = (data: any) => {
    setCurrentUserId(data.userId);
  };

  return (
    <div className="min-h-screen bg-gradient-brand">
      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4">
        <div className="container max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-phala-g00 mb-6">
            Secure Wallet Infrastructure
          </h1>
          <p className="text-lg text-phala-g01 mb-12 max-w-2xl mx-auto leading-relaxed">
            Enterprise-grade cryptographic operations powered by Intel TDX TEE
            technology. Create, sign, and verify with hardware-level security
            guarantees.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex justify-center px-4 pb-16">
        <div className="w-full max-w-5xl">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid grid-cols-6 w-full max-w-3xl mx-auto bg-phala-g09/20 backdrop-blur-sm rounded-2xl p-2 gap-1 h-auto border border-phala-g08/30">
                <TabsTrigger
                  value="signup"
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-phala-g03 hover:text-phala-g01 hover:bg-phala-g09/30 data-[state=active]:bg-phala-g01 data-[state=active]:text-phala-g09 data-[state=active]:font-semibold data-[state=active]:shadow-glow transition-all duration-200"
                >
                  <Wallet className="h-5 w-5" />
                  <span className="text-xs font-medium">Create</span>
                </TabsTrigger>
                <TabsTrigger
                  value="sign"
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-phala-g03 hover:text-phala-g01 hover:bg-phala-g09/30 data-[state=active]:bg-phala-g01 data-[state=active]:text-phala-g09 data-[state=active]:font-semibold data-[state=active]:shadow-glow transition-all duration-200"
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-xs font-medium">Sign</span>
                </TabsTrigger>
                <TabsTrigger
                  value="verify"
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-phala-g03 hover:text-phala-g01 hover:bg-phala-g09/30 data-[state=active]:bg-phala-g01 data-[state=active]:text-phala-g09 data-[state=active]:font-semibold data-[state=active]:shadow-glow transition-all duration-200"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-xs font-medium">Verify</span>
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-phala-g03 hover:text-phala-g01 hover:bg-phala-g09/30 data-[state=active]:bg-phala-g01 data-[state=active]:text-phala-g09 data-[state=active]:font-semibold data-[state=active]:shadow-glow transition-all duration-200"
                >
                  <Users className="h-5 w-5" />
                  <span className="text-xs font-medium">Users</span>
                </TabsTrigger>
                <TabsTrigger
                  value="audit"
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-phala-g03 hover:text-phala-g01 hover:bg-phala-g09/30 data-[state=active]:bg-phala-g01 data-[state=active]:text-phala-g09 data-[state=active]:font-semibold data-[state=active]:shadow-glow transition-all duration-200"
                >
                  <Search className="h-5 w-5" />
                  <span className="text-xs font-medium">Audit</span>
                </TabsTrigger>
                <TabsTrigger
                  value="attestation"
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-phala-g03 hover:text-phala-g01 hover:bg-phala-g09/30 data-[state=active]:bg-phala-g01 data-[state=active]:text-phala-g09 data-[state=active]:font-semibold data-[state=active]:shadow-glow transition-all duration-200"
                >
                  <Shield className="h-5 w-5" />
                  <span className="text-xs font-medium">Attest</span>
                </TabsTrigger>
              </TabsList>

              {/* Content Area */}
              <div className="mt-8">
                <TabsContent value="signup" className="m-0 flex justify-center px-4">
                  <div className="w-full max-w-md">
                    <SignupForm onSuccess={handleSignupSuccess} />
                  </div>
                </TabsContent>

                <TabsContent value="sign" className="m-0 flex justify-center px-4">
                  <div className="w-full max-w-md">
                    <SignMessage userId={currentUserId} />
                  </div>
                </TabsContent>

                <TabsContent value="verify" className="m-0 flex justify-center px-4">
                  <div className="w-full max-w-md">
                    <VerifySignature />
                  </div>
                </TabsContent>

                <TabsContent value="users" className="m-0 flex justify-center">
                  <div className="w-full max-w-2xl">
                    <UserList />
                  </div>
                </TabsContent>

                <TabsContent value="audit" className="m-0 flex justify-center">
                  {currentUserId ? (
                    <AuditLogViewer userId={currentUserId} />
                  ) : (
                    <div className="text-center space-y-8 py-12">
                      <div className="w-20 h-20 rounded-2xl bg-phala-g09/30 backdrop-blur-sm flex items-center justify-center mx-auto">
                        <Search className="h-10 w-10 text-phala-g01" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-phala-g00">
                          View Audit Logs
                        </h3>
                        <p className="text-phala-g02 max-w-md mx-auto">
                          Enter a User ID to view detailed audit logs and
                          transaction history for secure operations
                        </p>
                      </div>
                      <div className="flex space-x-3 max-w-sm mx-auto">
                        <Input
                          placeholder="Enter User ID"
                          className="flex-1 h-12"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value) {
                              setCurrentUserId(e.currentTarget.value);
                            }
                          }}
                        />
                        <Button
                          className="h-12 px-6"
                          onClick={(e) => {
                            const input = e.currentTarget
                              .previousElementSibling as HTMLInputElement;
                            if (input?.value) {
                              setCurrentUserId(input.value);
                            }
                          }}
                        >
                          View Logs
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent
                  value="attestation"
                  className="m-0 flex justify-center"
                >
                  <div className="w-full max-w-md">
                    <AttestationVerifier />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-phala-g03/30 to-transparent mb-8"></div>
            <p className="text-xs font-bold text-phala-g03 uppercase tracking-wider mb-8">SOURCES</p>
          </div>
          <div className="flex items-center justify-center gap-10">
            <a
              href="https://github.com/dstack-tee/dstack"
              target="_blank"
              rel="noopener noreferrer"
              className="group block transform hover:scale-110 transition-all duration-300"
            >
              <Image
                src="/dstack-logo.png"
                alt="dstack"
                width={80}
                height={24}
                className="object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              />
            </a>

            <a
              href="https://phala.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group block transform hover:scale-110 transition-all duration-300"
            >
              <Image
                src="/phala-logo.png"
                alt="Phala"
                width={80}
                height={24}
                className="object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              />
            </a>

            <a
              href="https://github.com/HashWarlock/the-accountant"
              target="_blank"
              rel="noopener noreferrer"
              className="group block transform hover:scale-110 transition-all duration-300"
            >
              <Image
                src="/github-logo-dark.png"
                alt="GitHub"
                width={80}
                height={24}
                className="object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
              />
            </a>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
