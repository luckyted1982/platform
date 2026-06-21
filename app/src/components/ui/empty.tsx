import React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: React.ReactNode
}

function Empty({
  className,
  icon: Icon,
  title,
  description,
  action,
  ...props
}: EmptyProps) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center",
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="bg-muted flex size-12 items-center justify-center rounded-full">
          <Icon className="text-muted-foreground size-6" />
        </div>
      )}
      {title && <p className="text-sm font-medium">{title}</p>}
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export { Empty }
