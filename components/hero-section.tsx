"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Cpu, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight * 0.8, behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

      {/* Animated mesh pattern */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(65, 224, 148, 0.05) 35px, rgba(65, 224, 148, 0.05) 70px)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-phala-lime/20 rounded-full"
            initial={{
              x: (i * 320) % 1920,
              y: 1080,
            }}
            animate={{
              y: -20,
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          {/* Security badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex justify-center gap-3 flex-wrap"
          >
            <Badge variant="outline" className="px-3 py-1.5 border-phala-lime/30 bg-phala-lime/10">
              <Shield className="w-3 h-3 mr-1.5" />
              Intel TDX TEE
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 border-phala-lime/30 bg-phala-lime/10">
              <Lock className="w-3 h-3 mr-1.5" />
              Hardware Security
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 border-phala-lime/30 bg-phala-lime/10">
              <Cpu className="w-3 h-3 mr-1.5" />
              Trusted Execution
            </Badge>
          </motion.div>

          {/* Main heading with gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold leading-tight"
          >
            <span className="bg-gradient-to-br from-phala-g00 via-phala-g01 to-phala-lime bg-clip-text text-transparent">
              Secure Wallet
            </span>
            <br />
            <span className="text-phala-g01">Infrastructure</span>
          </motion.h1>

          {/* Animated subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-phala-g02 max-w-3xl mx-auto leading-relaxed"
          >
            Enterprise-grade cryptographic operations powered by{" "}
            <span className="text-phala-lime font-semibold">Intel TDX TEE</span> technology.
            Create, sign, and verify with hardware-level security guarantees.
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8"
          >
            {[
              {
                title: "Deterministic Keys",
                description: "Reproducible key generation within secure enclaves",
              },
              {
                title: "Remote Attestation",
                description: "Cryptographic proof of TEE execution environment",
              },
              {
                title: "Audit Trail",
                description: "Complete transparency with verifiable attestation quotes",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                className="bg-phala-g09/5 backdrop-blur-sm rounded-xl p-6 border border-phala-g08/20"
              >
                <h3 className="text-phala-g00 font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-phala-g02">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="pt-12"
          >
            <button
              onClick={scrollToContent}
              className="inline-flex flex-col items-center gap-2 text-phala-g03 hover:text-phala-lime transition-colors cursor-pointer"
            >
              <span className="text-sm font-medium">Get Started</span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}