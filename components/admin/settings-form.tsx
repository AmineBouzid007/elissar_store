"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { saveSettingsAction, type FormState } from "@/app/admin/actions"
import { Switch } from "@/components/ui/switch"
import type { StoreSettings } from "@/lib/types"
import { btnPrimary, card, inputCls } from "./ui"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-sm font-medium">{label}</label>{children}{hint && <p className="mt-1.5 text-xs text-foreground/40">{hint}</p>}</div>
}

export function SettingsForm({ s }: { s: StoreSettings }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettingsAction, {})
  useEffect(() => {
    if (state.ok) toast.success("Settings saved")
    if (state.error) toast.error(state.error)
  }, [state])
  return (
    <form action={action} className="max-w-3xl space-y-6">
      <section className={`${card} space-y-5 p-5`}>
        <div className="flex items-center justify-between gap-4">
          <div><p className="font-medium">Store open</p><p className="text-sm text-foreground/50">Turn off to stop new orders (e.g. between drops).</p></div>
          <Switch name="store_open" defaultChecked={s.store_open} className="data-[state=checked]:bg-primary [&>span]:data-[state=checked]:bg-primary-foreground" />
        </div>
        <Field label="Announcement bar" hint="Scrolling text at the very top of the site. Leave empty to hide."><input name="announcement" defaultValue={s.announcement} className={inputCls} /></Field>
      </section>

      <section className={`${card} space-y-5 p-5`}>
        <h2 className="font-medium">Delivery</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Delivery fee (TND)"><input name="shipping_fee" type="number" min={0} step="0.5" defaultValue={s.shipping_fee} className={inputCls} /></Field>
          <Field label="Free delivery over (TND)" hint="0 = never free"><input name="free_shipping_threshold" type="number" min={0} step="1" defaultValue={s.free_shipping_threshold} className={inputCls} /></Field>
        </div>
      </section>

      <section className={`${card} space-y-5 p-5`}>
        <h2 className="font-medium">Contact &amp; social</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp number" hint="With country code, e.g. 216 20 123 456"><input name="whatsapp" defaultValue={s.whatsapp} className={inputCls} /></Field>
          <Field label="Phone"><input name="contact_phone" defaultValue={s.contact_phone} className={inputCls} /></Field>
          <Field label="Email"><input name="contact_email" defaultValue={s.contact_email} className={inputCls} /></Field>
          <Field label="Instagram" hint="@handle or full link"><input name="instagram" defaultValue={s.instagram} className={inputCls} /></Field>
          <Field label="TikTok"><input name="tiktok" defaultValue={s.tiktok} className={inputCls} /></Field>
        </div>
      </section>

      <section className={`${card} space-y-5 p-5`}>
        <h2 className="font-medium">Content</h2>
        <Field label="Homepage hero image" hint="Optional background photo (URL or /path). Leave empty for the plain black hero."><input name="hero_image" defaultValue={s.hero_image} className={inputCls} /></Field>
        <Field label="Size chart" hint="One row per size: SIZE,chest width cm,length cm — for example XS,50,68. Leave empty to hide the table.">
          <textarea name="size_chart" rows={6} defaultValue={s.size_chart} placeholder={"XS,50,68\nS,52,70\nM,54,72\nL,56,74\nXL,58,76"} className={`${inputCls} font-mono`} />
        </Field>
      </section>

      <button disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Save settings"}</button>
    </form>
  )
}
