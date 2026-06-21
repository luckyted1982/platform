import React from "react"
import { cn } from "@/lib/utils"

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode
  helperText?: React.ReactNode
  error?: React.ReactNode
}

function Field({
  className,
  label,
  helperText,
  error,
  children,
  ...props
}: FieldProps) {
  return (
    <div
      data-slot="field"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    >
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      {children}
      {helperText && !error && (
        <p className="text-muted-foreground text-xs">{helperText}</p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}

export { Field }
