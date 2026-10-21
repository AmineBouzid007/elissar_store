import type { LucideIcon } from "lucide-react"
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/constants"
import { cn } from "@/lib/utils"

export const card = "rounded-xl border border-foreground/10 bg-card"
export const inputCls = "w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-foreground/30 focus:border-foreground/40"
export const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
export const btnGhost = "inline-flex items-center justify-center gap-2 rounded-lg border border-foreground/15 px-4 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-50"

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-foreground/50">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ label, value, hint, icon: Icon, accent }: { label: string; value: string; hint?: string; icon: LucideIcon; accent?: boolean }) {
  return (
    <div className={cn(card, "p-5 transition-colors hover:border-foreground/20")}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-foreground/50">{label}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-foreground/40">{hint}</p>}
        </div>
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", accent ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-foreground/70")}><Icon className="size-5" /></div>
      </div>
    </div>
  )
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "border-foreground/30 bg-foreground/10 text-foreground",
  confirmed: "border-foreground/20 bg-foreground/5 text-foreground/80",
  shipped: "border-foreground/20 bg-transparent text-foreground/80",
  delivered: "border-primary bg-primary text-primary-foreground",
  cancelled: "border-red-500/40 bg-red-500/10 text-red-400",
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={cn("inline-flex rounded-md border px-2 py-1 text-xs font-medium", STATUS_STYLE[status])}>{ORDER_STATUS_LABEL[status]}</span>
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className={cn(card, "p-10 text-center text-foreground/40")}>{children}</div>
}
