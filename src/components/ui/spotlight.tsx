'use client'

import { cn } from "@/lib/utils"

interface SpotlightProps {
  className?: string
  fill?: string
}

export function Spotlight({
  className = "",
  fill = "white",
}: SpotlightProps) {
  return (
    <div
      className={cn(
        "h-40 w-40 bg-transparent absolute pointer-events-none",
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(600px circle at center, ${fill}10 0%, transparent 60%)`,
        }}
      />
    </div>
  );
} 