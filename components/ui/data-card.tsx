"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DataCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "success" | "warning";
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function DataCard({
  title,
  description,
  icon,
  badge,
  badgeVariant = "default",
  children,
  className,
  delay = 0
}: DataCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className={cn("h-full", className)}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {icon && (
                  <div className="h-8 w-8 rounded-lg bg-phala-lime/10 flex items-center justify-center">
                    {icon}
                  </div>
                )}
                <CardTitle>{title}</CardTitle>
              </div>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {badge && (
              <Badge variant={badgeVariant as any}>
                {badge}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  delay?: number;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendValue,
  className,
  delay = 0
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05 }}
      className={cn("h-full", className)}
    >
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-phala-g02">{label}</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold text-phala-g00">{value}</h2>
                {trend && trendValue && (
                  <span className={cn(
                    "text-sm font-medium",
                    trend === "up" && "text-green-500",
                    trend === "down" && "text-red-500",
                    trend === "neutral" && "text-phala-g03"
                  )}>
                    {trend === "up" && "↑"}
                    {trend === "down" && "↓"}
                    {trendValue}
                  </span>
                )}
              </div>
            </div>
            {icon && (
              <div className="h-12 w-12 rounded-xl bg-phala-lime/10 flex items-center justify-center">
                <div className="text-phala-lime">{icon}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface InfoCardProps {
  data: { label: string; value: string }[];
  className?: string;
  delay?: number;
}

export function InfoCard({ data, className, delay = 0 }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn("h-full", className)}
    >
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            {data.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + index * 0.1 }}
                className="flex justify-between items-start"
              >
                <span className="text-sm font-medium text-phala-g02">{item.label}</span>
                <span className="text-sm font-mono text-phala-g01 text-right max-w-[60%] break-all">
                  {item.value}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}