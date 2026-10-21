"use client"

import { useActionState, useEffect, useRef, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteCategoryAction, saveCategoryAction, type FormState } from "@/app/admin/actions"
import type { Category } from "@/lib/types"
import { btnPrimary, card, inputCls } from "./ui"

function CategoryForm({ c }: { c?: Category }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCategoryAction, {})
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (state.ok) { toast.success("Saved"); if (!c) ref.current?.reset() }
    if (state.error) toast.error(state.error)
  }, [state, c])
  return (
    <form ref={ref} action={action} className="grid gap-3 sm:grid-cols-[1fr_2fr_90px_auto]">
      {c && <input type="hidden" name="id" value={c.id} />}
      <input name="name" required defaultValue={c?.name} placeholder="Name" aria-label="Name" className={inputCls} />
      <input name="description" defaultValue={c?.description} placeholder="Short description" aria-label="Description" className={inputCls} />
      <input name="sort_order" type="number" defaultValue={c?.sort_order ?? 0} aria-label="Order" title="Sort order" className={inputCls} />
      <button disabled={pending} className={btnPrimary}>{c ? "Save" : "Add"}</button>
      <input name="image_url" defaultValue={c?.image_url} placeholder="Image URL (optional)" aria-label="Image URL" className={`${inputCls} sm:col-span-4`} />
    </form>
  )
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [, start] = useTransition()
  return (
    <div className="space-y-4">
      <div className={`${card} p-5`}><h2 className="mb-4 font-medium">Add a category</h2><CategoryForm /></div>
      {categories.map((c) => (
        <div key={c.id} className={`${card} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-foreground/50">/{c.slug} · {c.product_count ?? 0} visible products</p>
            <button aria-label={`Delete ${c.name}`} className="p-1 text-red-400/70 hover:text-red-400"
              onClick={() => { if (confirm(`Delete “${c.name}”? Its products stay but lose their category.`)) start(async () => { await deleteCategoryAction(c.id); toast.success("Deleted") }) }}><Trash2 className="size-4" /></button>
          </div>
          <CategoryForm c={c} />
        </div>
      ))}
    </div>
  )
}
