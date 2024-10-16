import React from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export default function GradientText({
  children,
  className,
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "text-transparent bg-clip-text bg-radial-gradient-text-home text-center",
        className
      )}
    >
      {children}
    </span>
  );
}
