"use client"

import { useEffect } from 'react'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background-card group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-phala-g03 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-foreground-muted",
          actionButton:
            "group-[.toast]:bg-phala-lime group-[.toast]:text-phala-g09 group-[.toast]:font-semibold group-[.toast]:hover:bg-phala-lime-hover",
          cancelButton:
            "group-[.toast]:bg-phala-g02 group-[.toast]:text-phala-g09 group-[.toast]:hover:bg-phala-g03",
          success: "group-[.toaster]:bg-phala-g02 group-[.toaster]:border-phala-lime group-[.toaster]:text-phala-g09",
          error: "group-[.toaster]:bg-background-card group-[.toaster]:border-danger group-[.toaster]:text-danger",
          info: "group-[.toaster]:bg-phala-g01 group-[.toaster]:border-phala-lime group-[.toaster]:text-phala-g08",
          warning: "group-[.toaster]:bg-phala-g02 group-[.toaster]:border-warning group-[.toaster]:text-phala-g08",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }