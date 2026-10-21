import Link from "next/link"
import { AlertTriangle, Banknote, CheckCircle2, Clock, CreditCard, XCircle } from "lucide-react"
import { isDbConfigured } from "@/lib/db"
import { getSettings } from "@/lib/data/settings"
import { formatDateTime, formatPrice } from "@/lib/format"
import { getPaymentSetup, listPayments, paymentTotals, type PaymentRow } from "@/lib/payments/admin"
import { Empty, PageHeader, StatCard, card } from "@/components/admin/ui"
import { cn } from "@/lib/utils"

export const metadata = { title: "Payments" }
export const dynamic = "force-dynamic"

const PROVIDER_LABEL = { none: "No provider chosen", mock: "Test mode", clictopay: "ClicToPay" } as const
const orders = (n: number) => `${n} ${n === 1 ? "order" : "orders"}`
const ATTEMPT_STYLE: Record<PaymentRow["status"], string> = {
  pending: "border-foreground/20 bg-foreground/5 text-foreground/70",
  paid: "border-primary bg-primary text-primary-foreground",
  failed: "border-red-500/40 bg-red-500/10 text-red-400",
  mismatch: "border-amber-400/40 bg-amber-400/10 text-amber-400",
}
const ATTEMPT_LABEL: Record<PaymentRow["status"], string> = { pending: "Waiting", paid: "Paid", failed: "Failed", mismatch: "Check amount" }

export default async function PaymentsPage() {
  const setup = getPaymentSetup()
  const dbReady = isDbConfigured()
  const [settings, totals, payments] = dbReady
    ? await Promise.all([getSettings(), paymentTotals(), listPayments()])
    : [null, null, [] as PaymentRow[]]
  const cur = settings?.currency ?? "TND"

  return (
    <div className="space-y-8">
      <PageHeader title="Payments" description="Which payment methods customers can use, and every online payment attempt." />

      <section aria-labelledby="methods" className="space-y-3">
        <h2 id="methods" className="text-sm font-medium text-foreground/60">Payment methods on the checkout</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className={cn(card, "flex items-start gap-4 p-5")}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-foreground/5"><Banknote className="size-5" /></div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><p className="font-medium">Cash on delivery</p><span className="rounded-md border border-primary bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">On</span></div>
              <p className="mt-1 text-sm text-foreground/50">The customer pays in cash when the order arrives. Always available.</p>
              {totals && <p className="mt-2 text-xs text-foreground/40">{orders(totals.cashOrders)} so far</p>}
            </div>
          </div>

          <div className={cn(card, "flex items-start gap-4 p-5")}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-foreground/5"><CreditCard className="size-5" /></div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">Card payment</p>
                <span className={cn("rounded-md border px-2 py-0.5 text-xs font-medium", setup.cardEnabled ? "border-primary bg-primary text-primary-foreground" : "border-foreground/20 text-foreground/60")}>{setup.cardEnabled ? "On" : "Off"}</span>
                {setup.provider !== "none" && <span className="rounded-md border border-foreground/15 px-2 py-0.5 text-xs text-foreground/60">{PROVIDER_LABEL[setup.provider]}</span>}
              </div>
              <p className="mt-1 text-sm text-foreground/50">{setup.summary}</p>
              {totals && <p className="mt-2 text-xs text-foreground/40">{orders(totals.cardOrders)} so far</p>}
            </div>
          </div>
        </div>

        {setup.warnings.map((w) => (
          <div key={w} className="flex items-start gap-3 rounded-xl border border-amber-400/40 bg-amber-400/5 p-4 text-sm text-amber-400"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><p>{w}</p></div>
        ))}

        {setup.checks.length > 0 && (
          <div className={cn(card, "divide-y divide-foreground/10")}>
            {setup.checks.map((c) => (
              <div key={c.label} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <div className="min-w-0"><p className="font-mono text-xs">{c.label}</p><p className="text-xs text-foreground/40">{c.hint}</p></div>
                <span className={cn("shrink-0 text-xs font-medium", c.ok ? "text-foreground/70" : c.required ? "text-red-400" : "text-foreground/40")}>
                  {c.ok ? "Set" : c.required ? "Missing" : "Not set"}
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-foreground/40">
          These are set in Vercel → Settings → Environment Variables, then redeploy. The page only shows whether a value exists, never the value itself.
          {setup.provider !== "none" && ` Unpaid card orders are released after ${setup.expiryMinutes} minutes.`}
        </p>
      </section>

      {!dbReady ? (
        <Empty>Connect the database to see online payments.</Empty>
      ) : (
        <>
          {totals && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Paid by card" value={formatPrice(totals.paidAmount, cur)} hint={orders(totals.paidCount)} icon={CheckCircle2} accent />
              <StatCard label="Waiting for the bank" value={totals.waiting.toLocaleString()} hint="Customer has not finished paying" icon={Clock} />
              <StatCard label="Failed or abandoned" value={totals.failed.toLocaleString()} hint="Stock was put back" icon={XCircle} />
              <StatCard label="Needs your attention" value={totals.needsReview.toLocaleString()} hint="Wrong amount, or paid but cancelled" icon={AlertTriangle} />
            </div>
          )}

          <section aria-labelledby="attempts" className="space-y-3">
            <h2 id="attempts" className="text-sm font-medium text-foreground/60">Online payment attempts</h2>
            {payments.length === 0 ? (
              <Empty>No online payment yet. Card attempts will appear here.</Empty>
            ) : (
              <div className={cn(card, "overflow-hidden")}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-foreground/10 text-xs uppercase tracking-wide text-foreground/40">
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Order</th>
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Result</th>
                        <th className="px-4 py-3 font-medium">Bank reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-b border-foreground/5 align-top last:border-0 hover:bg-foreground/[0.03]">
                          <td className="px-4 py-3 text-foreground/50">{formatDateTime(p.created_at)}</td>
                          <td className="px-4 py-3"><Link href={`/admin/orders/${p.order_id}`} className="font-mono text-xs font-medium underline-offset-4 hover:underline">{p.order_number}</Link></td>
                          <td className="px-4 py-3">{p.customer_name}</td>
                          <td className="px-4 py-3 font-medium">{formatPrice(p.amount, cur)}</td>
                          <td className="px-4 py-3">
                            <span className={cn("inline-flex rounded-md border px-2 py-1 text-xs font-medium", ATTEMPT_STYLE[p.status])}>{ATTEMPT_LABEL[p.status]}</span>
                            {p.paid_but_cancelled && <p className="mt-1 max-w-[190px] text-xs text-amber-400">Paid but the order is cancelled: refund or re-open it.</p>}
                            {p.status === "mismatch" && <p className="mt-1 max-w-[190px] text-xs text-amber-400">The bank reports a different amount. Check it in the bank&apos;s dashboard.</p>}
                          </td>
                          <td className="px-4 py-3"><span className="break-all font-mono text-xs text-foreground/40">{p.gateway === "mock" ? "test · " : ""}{p.gateway_order_id}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
