"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteOrderAction, setOrderStatusAction, setPaymentStatusAction } from "@/app/admin/actions"
import { ORDER_STATUSES, ORDER_STATUS_LABEL, PAYMENT_STATUSES, type OrderStatus, type PaymentStatus } from "@/lib/constants"
import { card, inputCls } from "./ui"

export function OrderControls({ id, status, payment }: { id: string; status: OrderStatus; payment: PaymentStatus }) {
  const [pending, start] = useTransition()
  const [s, setS] = useState(status)
  const [p, setP] = useState(payment)

  function changeStatus(next: OrderStatus) {
    const prev = s
    setS(next)
    start(async () => {
      const r = await setOrderStatusAction(id, next)
      if (r.error) { setS(prev); toast.error(r.error) } else toast.success(`Marked ${ORDER_STATUS_LABEL[next].toLowerCase()}`)
    })
  }
  function changePayment(next: PaymentStatus) {
    const prev = p
    setP(next)
    start(async () => {
      const r = await setPaymentStatusAction(id, next)
      if (r.error) { setP(prev); toast.error(r.error) }
    })
  }

  return (
    <div className={`${card} space-y-4 p-5 text-sm`}>
      <div>
        <label htmlFor="status" className="mb-1.5 block text-xs uppercase tracking-wide text-foreground/40">Order status</label>
        <select id="status" disabled={pending} value={s} onChange={(e) => changeStatus(e.target.value as OrderStatus)} className={inputCls}>
          {ORDER_STATUSES.map((o) => <option key={o} value={o} className="bg-card">{ORDER_STATUS_LABEL[o]}</option>)}
        </select>
        <p className="mt-2 text-xs text-foreground/40">Cancelling puts the pieces back in stock.</p>
      </div>
      <div>
        <label htmlFor="payment" className="mb-1.5 block text-xs uppercase tracking-wide text-foreground/40">Payment (cash)</label>
        <select id="payment" disabled={pending} value={p} onChange={(e) => changePayment(e.target.value as PaymentStatus)} className={inputCls}>
          {PAYMENT_STATUSES.map((o) => <option key={o} value={o} className="bg-card">{o[0].toUpperCase() + o.slice(1)}</option>)}
        </select>
      </div>
      <button type="button" disabled={pending} onClick={() => { if (confirm("Delete this order permanently? Stock will be restored.")) start(() => deleteOrderAction(id)) }}
        className="inline-flex items-center gap-2 text-xs text-red-400/80 hover:text-red-400"><Trash2 className="size-3.5" />Delete order</button>
    </div>
  )
}
