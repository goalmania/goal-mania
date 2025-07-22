import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function InteractiveHoverButton({
  children,
  className,
  ...props
}: InteractiveHoverButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex h-12 w-full items-center justify-center overflow-hidden rounded-md bg-neutral-950 px-6 font-medium text-neutral-50 transition-all duration-300 ease-out hover:scale-105 hover:bg-neutral-900 active:scale-95",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
      </span>
      <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
    </button>
  );
}
