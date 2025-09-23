"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}

interface LoadingFormProps {
  fields?: number;
  className?: string;
}

export function LoadingForm({ fields = 2, className }: LoadingFormProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-4">
        <Skeleton className="h-16 w-16 rounded-2xl mx-auto" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      <Card>
        <CardContent className="p-8 space-y-6">
          {[...Array(fields)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function LoadingTable({ rows = 5, columns = 4, className }: LoadingTableProps) {
  return (
    <div className={cn("bg-phala-g09/5 backdrop-blur-sm rounded-2xl border border-phala-g08/20 p-4", className)}>
      {/* Table Header */}
      <div className="flex gap-4 p-4 border-b border-phala-g08/20">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Table Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <motion.div
          key={rowIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: rowIndex * 0.1 }}
          className="flex gap-4 p-4 border-b border-phala-g08/10"
        >
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-8 flex-1"
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
}

interface PulseLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PulseLoader({ size = "md", className }: PulseLoaderProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <motion.div
        className="absolute inset-0 rounded-full bg-phala-lime/20"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full bg-phala-lime/30"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.7, 0, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      <div className="absolute inset-0 rounded-full bg-phala-lime/40" />
    </div>
  );
}

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <motion.div
      className={cn(
        "rounded-full border-phala-g08/30 border-t-phala-lime",
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

interface ProgressBarProps {
  progress?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ progress = 0, className, showLabel = false }: ProgressBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-phala-g02">Loading...</span>
          <span className="text-phala-lime font-medium">{progress}%</span>
        </div>
      )}
      <div className="h-2 bg-phala-g08/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-phala-lime to-phala-lime/70 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ visible, message = "Loading...", className }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 bg-phala-g09/80 backdrop-blur-md flex items-center justify-center",
        className
      )}
    >
      <div className="bg-phala-g09/90 backdrop-blur-sm rounded-2xl p-8 border border-phala-g08/30 shadow-2xl">
        <div className="flex flex-col items-center space-y-4">
          <PulseLoader size="lg" />
          <p className="text-phala-g01 font-medium">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}