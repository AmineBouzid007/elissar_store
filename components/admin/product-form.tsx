"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteProductAction, saveProductAction } from "@/app/admin/actions"
import { Switch } from "@/components/ui/switch"
import { COLORS, COLOR_HEX, COLOR_LABEL, SIZES } from "@/lib/constants"
import type { Product } from "@/lib/types"
import { ImageList } from "./image-list"
import { btnGhost, btnPrimary, card, inputCls } from "./ui"

export function ProductForm({ product, categories }: { product?: Product; categories: { id: string; name: string }[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState("")

  const [name, setName] = useState(product?.name ?? "")
  const [slug, setSlug] = useState(product?.slug ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [price, setPrice] = useState(String(product?.price ?? ""))
  const [compare, setCompare] = useState(product?.compare_at_price ? String(product.compare_at_price) : "")
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? "")
  const [collection, setCollection] = useState(product?.collection ?? "Collection Automne-Hiver")
  const [details, setDetails] = useState((product?.details ?? ["Broderie artisanale", "Tissus nobles", "Fabrication tunisienne", "Retouche gratuite sous 30 jours"]).join("\n"))
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [imgByColor, setImgByColor] = useState<Record<string, string[]>>(() => ({ ...(product?.images_by_color ?? {}) }) as Record<string, string[]>)
  const [active, setActive] = useState(product?.is_active ?? true)
  const [featured, setFeatured] = useState(product?.is_featured ?? false)
  const [isNew, setIsNew] = useState(product?.is_new ?? true)
  const [stock, setStock] = useState<Record<string, string>>(() => {
    const s: Record<string, string> = {}
    for (const c of COLORS) for (const z of SIZES) s[`${c}_${z}`] = String(product?.variants.find((v) => v.color === c && v.size === z)?.stock ?? 0)
    return s
  })
  const total = Object.values(stock).reduce((a, b) => a + (Number(b) || 0), 0)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    start(async () => {
      const res = await saveProductAction(product?.id ?? null, {
        name, slug, description, price, compare_at_price: compare, category_id: categoryId, collection,
        details: details.split("\n").map((d) => d.trim()).filter(Boolean),
        images, images_by_color: imgByColor,
        is_active: active, is_featured: featured, is_new: isNew,
        stock: Object.fromEntries(Object.entries(stock).map(([k, v]) => [k, Math.max(0, Math.floor(Number(v) || 0))])),
      })
      if (res.error) { setError(res.error); toast.error(res.error); return }
      toast.success("Product saved")
      if (!product && res.id) router.push(`/admin/products/${res.id}`)
      else router.refresh()
    })
  }

  const label = "mb-1.5 block text-sm font-medium"
  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className={`${card} space-y-5 p-5`}>
          <div><label className={label} htmlFor="name">Name</label><input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="STILL AWAKE Tee" /></div>
          <div><label className={label} htmlFor="desc">Description</label><textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} /></div>
          <div><label className={label} htmlFor="details">Details <span className="font-normal text-foreground/40">(one per line)</span></label><textarea id="details" rows={4} value={details} onChange={(e) => setDetails(e.target.value)} className={inputCls} /></div>
        </section>

        <section className={`${card} space-y-6 p-5`}>
          <ImageList label="Photos" hint="First image is the cover" value={images} onChange={setImages} />
          <details className="rounded-lg border border-foreground/10 p-4" open={Object.values(imgByColor).some((l) => l.length > 0)}>
            <summary className="cursor-pointer text-sm font-medium">Photos per colour <span className="font-normal text-foreground/40">(optional — shown when that colour is selected)</span></summary>
            <div className="mt-5 space-y-6">
              {COLORS.map((c) => <ImageList key={c} label={COLOR_LABEL[c]} value={imgByColor[c] ?? []} onChange={(v) => setImgByColor((p) => ({ ...p, [c]: v }))} />)}
            </div>
          </details>
        </section>

        <section className={`${card} p-5`}>
          <div className="mb-4 flex items-baseline justify-between"><h2 className="font-medium">Stock</h2><span className="text-sm text-foreground/50">{total} pieces in total</span></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead><tr className="text-xs uppercase tracking-wide text-foreground/40"><th className="pb-2 text-left font-medium">Colour</th>{SIZES.map((s) => <th key={s} className="pb-2 text-center font-medium">{s}</th>)}</tr></thead>
              <tbody>
                {COLORS.map((c) => (
                  <tr key={c} className="border-t border-foreground/10">
                    <td className="py-3 pr-3"><span className="inline-flex items-center gap-2"><span className="size-3.5 rounded-full border border-foreground/40" style={{ background: COLOR_HEX[c] }} />{COLOR_LABEL[c]}</span></td>
                    {SIZES.map((s) => (
                      <td key={s} className="px-1 py-2"><input type="number" min={0} inputMode="numeric" aria-label={`${COLOR_LABEL[c]} ${s} stock`} value={stock[`${c}_${s}`]} onChange={(e) => setStock((st) => ({ ...st, [`${c}_${s}`]: e.target.value }))} className={`${inputCls} px-2 text-center`} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-foreground/40">0 = sold out. Stock goes down automatically when someone orders and comes back if you cancel the order.</p>
        </section>
      </div>

      <div className="space-y-6">
        <section className={`${card} space-y-5 p-5`}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label} htmlFor="price">Price (TND)</label><input id="price" required type="number" min={0} step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} /></div>
            <div><label className={label} htmlFor="compare">Was <span className="font-normal text-foreground/40">(optional)</span></label><input id="compare" type="number" min={0} step="0.5" value={compare} onChange={(e) => setCompare(e.target.value)} className={inputCls} /></div>
          </div>
          <div>
            <label className={label} htmlFor="cat">Category</label>
            <select id="cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
              <option value="" className="bg-card">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id} className="bg-card">{c.name}</option>)}
            </select>
          </div>
          <div><label className={label} htmlFor="col">Drop / collection</label><input id="col" value={collection} onChange={(e) => setCollection(e.target.value)} className={inputCls} /></div>
          <div><label className={label} htmlFor="slug">URL</label><input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name" className={inputCls} /></div>
        </section>

        <section className={`${card} space-y-4 p-5`}>
          {([["Visible in store", active, setActive], ["Featured on homepage", featured, setFeatured], ["Show “New” badge", isNew, setIsNew]] as const).map(([l, v, set]) => (
            <div key={l} className="flex items-center justify-between"><span className="text-sm">{l}</span><Switch checked={v} onCheckedChange={set} aria-label={l} className="data-[state=checked]:bg-primary [&>span]:data-[state=checked]:bg-primary-foreground" /></div>
          ))}
        </section>

        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button disabled={pending} className={`${btnPrimary} flex-1`}>{pending ? "Saving…" : product ? "Save changes" : "Create product"}</button>
          {product && <Link href={`/product/${product.slug}`} target="_blank" className={btnGhost}>View</Link>}
        </div>
        {product && (
          <button type="button" disabled={pending} onClick={() => { if (confirm(`Delete “${product.name}” permanently? Past orders keep their details.`)) start(() => deleteProductAction(product.id)) }}
            className="inline-flex items-center gap-2 text-sm text-red-400/80 hover:text-red-400"><Trash2 className="size-4" />Delete product</button>
        )}
      </div>
    </form>
  )
}
