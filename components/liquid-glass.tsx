import type { HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  intensity?: "soft" | "strong"
}

export function LiquidGlass({
  children,
  className,
  intensity = "soft",
  ...props
}: LiquidGlassProps) {
  return (
    <div
      className={cn(
        "liquid-glass smooth-hover-lift",
        intensity === "strong" && "liquid-glass-strong",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
