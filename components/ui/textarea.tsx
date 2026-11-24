import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-[var(--text-3)] flex field-sizing-content min-h-24 w-full rounded-2xl border-0 bg-[var(--wall-2)] px-4 py-3 text-[16px] text-white shadow-[inset_0_0_0_1px_var(--line)] transition-[color,box-shadow] outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--lime)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
