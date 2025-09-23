"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Shield, Server } from "lucide-react";

export function Footer() {
  const links = [
    {
      name: "dstack",
      logo: "/dstack-logo.png",
      url: "https://github.com/dstack-tee/dstack",
      description: "",
    },
    {
      name: "Phala",
      logo: "/phala-logo-white.png",
      url: "https://phala.com",
      description: "",
    },
    {
      name: "GitHub",
      logo: "/github-logo-dark.png",
      url: "https://github.com/HashWarlock/the-accountant",
      description: "",
    },
  ];

  return (
    <footer className="relative mt-24 border-t border-phala-g08/20 bg-gradient-to-b from-transparent to-phala-g09/5">
      <div className="container max-w-6xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-phala-lime/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-phala-lime" />
              </div>
              <div>
                <h3 className="font-bold text-phala-g00">The Accountant</h3>
                <Badge variant="outline" className="text-xs mt-1">
                  TEE Secured
                </Badge>
              </div>
            </div>
            <p className="text-sm text-phala-g02 leading-relaxed">
              Enterprise-grade cryptographic operations powered by Intel TDX TEE technology.
              Hardware-level security for your digital assets.
            </p>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-phala-g00">Key Features</h4>
            <ul className="space-y-2 text-sm text-phala-g02">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-phala-lime" />
                Deterministic Key Generation
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-phala-lime" />
                Remote Attestation
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-phala-lime" />
                Audit Trail & Verification
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-phala-lime" />
                Secure Message Signing
              </li>
            </ul>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-phala-g00">Built With</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Next.js 15</Badge>
              <Badge variant="secondary">React 19</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
              <Badge variant="secondary">shadcn/ui</Badge>
              <Badge variant="secondary">Intel TDX</Badge>
            </div>
          </motion.div>
        </div>

        <Separator className="bg-phala-g08/20" />

        {/* Partners Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="py-12"
        >
          <p className="text-xs font-bold text-phala-g03 uppercase tracking-wider text-center mb-8">
            POWERED BY
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12">
            {links.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <Image
                      src={link.logo}
                      alt={link.name}
                      width={80}
                      height={24}
                      className={`object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 ${link.name !== "Phala" ? "brightness-0 invert" : ""}`}
                    />
                  </div>
                  <span className="text-xs text-phala-g03 group-hover:text-phala-lime transition-colors">
                    {link.description}
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        <Separator className="bg-phala-g08/20" />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-sm text-phala-g02">
            <span>© 2025 The Accountant</span>
            <Badge variant="success" className="text-xs">
              <Server className="h-3 w-3 mr-1" />
              TEE Active
            </Badge>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/HashWarlock/the-accountant"
              target="_blank"
              rel="noopener noreferrer"
              className="text-phala-g03 hover:text-phala-lime transition-colors flex items-center gap-2 text-sm"
            >
              <Github className="h-4 w-4" />
              View Source
            </a>
            <a
              href="https://docs.phala.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-phala-g03 hover:text-phala-lime transition-colors flex items-center gap-2 text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Documentation
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-phala-lime/30 to-transparent" />
    </footer>
  );
}