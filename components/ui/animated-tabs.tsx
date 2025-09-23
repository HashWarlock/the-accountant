"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Tabs } from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

interface AnimatedTabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

const AnimatedTabs = React.forwardRef<
  React.ElementRef<typeof Tabs>,
  AnimatedTabsProps
>(({ defaultValue, className, children, ...props }, ref) => {
  return (
    <Tabs
      ref={ref}
      defaultValue={defaultValue}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </Tabs>
  );
});
AnimatedTabs.displayName = "AnimatedTabs";

interface AnimatedTabsListProps {
  className?: string;
  children: React.ReactNode;
}

const AnimatedTabsList = React.forwardRef<
  HTMLDivElement,
  AnimatedTabsListProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-auto items-center justify-center rounded-2xl bg-phala-g09/10 backdrop-blur-lg p-1.5 text-phala-g02 border border-phala-g08/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
AnimatedTabsList.displayName = "AnimatedTabsList";

interface AnimatedTabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const AnimatedTabsTrigger = React.forwardRef<
  HTMLButtonElement,
  AnimatedTabsTriggerProps
>(({ value, className, children, icon, ...props }, ref) => {
  const [isActive, setIsActive] = React.useState(false);

  return (
    <button
      ref={ref}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => setIsActive(true)}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "text-phala-g03 hover:text-phala-g01 hover:bg-phala-g08/10",
        "data-[state=active]:text-phala-g09 data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    >
      {isActive && (
        <motion.div
          layoutId="active-tab"
          className="absolute inset-0 bg-phala-lime rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {icon && <span className="w-5 h-5">{icon}</span>}
        {children}
      </span>
    </button>
  );
});
AnimatedTabsTrigger.displayName = "AnimatedTabsTrigger";

interface AnimatedTabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const AnimatedTabsContent = React.forwardRef<
  HTMLDivElement,
  AnimatedTabsContentProps
>(({ value, className, children, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className={cn("mt-6 w-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
});
AnimatedTabsContent.displayName = "AnimatedTabsContent";

export {
  AnimatedTabs,
  AnimatedTabsList,
  AnimatedTabsTrigger,
  AnimatedTabsContent,
};