"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleDetailsProps {
  title: string;
  summary?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export function CollapsibleDetails({
  title,
  summary,
  children,
  defaultOpen = false,
  className,
  icon,
  badge,
}: CollapsibleDetailsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "bg-gradient-to-br from-phala-g09/10 to-phala-g09/5",
        "backdrop-blur-md rounded-2xl",
        "border border-phala-g08/20",
        "shadow-lg shadow-phala-g09/10",
        "transition-all duration-300",
        isOpen && "shadow-xl shadow-phala-lime/10 border-phala-lime/20",
        className
      )}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full p-6 justify-between",
            "hover:bg-phala-g08/10",
            "transition-all duration-200",
            "group"
          )}
        >
          <div className="flex items-center gap-4">
            {icon && (
              <motion.div
                animate={{ rotate: isOpen ? 360 : 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "h-10 w-10 rounded-xl",
                  "bg-gradient-to-br from-phala-lime/20 to-phala-lime/10",
                  "flex items-center justify-center",
                  "border border-phala-lime/30",
                  "group-hover:shadow-md group-hover:shadow-phala-lime/20",
                  "transition-shadow duration-200"
                )}
              >
                {icon}
              </motion.div>
            )}
            <div className="text-left">
              <h3 className="text-lg font-semibold text-phala-g00 group-hover:text-phala-lime transition-colors">
                {title}
              </h3>
              {summary && !isOpen && (
                <p className="text-sm text-phala-g02 mt-1">{summary}</p>
              )}
            </div>
            {badge && <div className="ml-auto mr-4">{badge}</div>}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "text-phala-g03 group-hover:text-phala-lime",
              "transition-colors duration-200"
            )}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="px-6 pb-6"
        >
          <div className="pt-2 space-y-4">{children}</div>
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
  onCopy?: () => void;
  className?: string;
  mono?: boolean;
}

export function DetailItem({
  label,
  value,
  onCopy,
  className,
  mono = false,
}: DetailItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("group", className)}
    >
      <label className="text-xs font-bold text-phala-g03 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center gap-2 mt-1">
        <code
          className={cn(
            "flex-1 px-4 py-3",
            "bg-gradient-to-r from-phala-g09/20 to-phala-g09/10",
            "backdrop-blur-sm rounded-xl",
            "border border-phala-g08/20",
            "text-phala-g01",
            "group-hover:border-phala-lime/30",
            "group-hover:shadow-md group-hover:shadow-phala-lime/10",
            "transition-all duration-200",
            mono ? "font-mono text-xs break-all" : "text-sm"
          )}
        >
          {value}
        </code>
        {onCopy && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            className={cn(
              "opacity-0 group-hover:opacity-100",
              "transition-opacity duration-200",
              "hover:text-phala-lime"
            )}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </Button>
        )}
      </div>
    </motion.div>
  );
}