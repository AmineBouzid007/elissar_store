"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="dark"
    className="toaster group"
    style={
      {
        "--normal-bg": "#f5f5f5",
        "--normal-text": "#0a0a0a",
        "--normal-border": "#f5f5f5",
      } as React.CSSProperties
    }
    {...props}
  />
)

export { Toaster }
