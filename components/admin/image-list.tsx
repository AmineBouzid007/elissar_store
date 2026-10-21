"use client"

import { useRef, useState } from "react"
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { inputCls } from "./ui"

export function ImageList({ label, hint, value, onChange }: { label: string; hint?: string; value: string[]; onChange: (v: string[]) => void }) {
  const file = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [url, setUrl] = useState("")

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    const added: string[] = []
    for (const f of Array.from(files)) {
      const fd = new FormData()
      fd.append("file", f)
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) { toast.error(data.error ?? "Upload failed"); break }
        added.push(data.url)
      } catch { toast.error("Upload failed"); break }
    }
    if (added.length) onChange([...value, ...added])
    setBusy(false)
    if (file.current) file.current.value = ""
  }
  const move = (i: number, d: number) => { const n = [...value]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n) }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between"><span className="text-sm font-medium">{label}</span>{hint && <span className="text-xs text-foreground/40">{hint}</span>}</div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {value.map((src, i) => (
          <div key={src + i} className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-foreground/10 bg-foreground/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="size-full object-cover" />
            {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">Cover</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-foreground/40 p-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button type="button" aria-label="Move left" onClick={() => move(i, -1)} className="p-1 hover:text-foreground/70"><ArrowLeft className="size-3.5" /></button>
              <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((_, k) => k !== i))} className="p-1 text-red-400"><Trash2 className="size-3.5" /></button>
              <button type="button" aria-label="Move right" onClick={() => move(i, 1)} className="p-1 hover:text-foreground/70"><ArrowRight className="size-3.5" /></button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => file.current?.click()} disabled={busy} className="flex aspect-[4/5] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-foreground/20 text-xs text-foreground/50 hover:border-foreground/50 hover:text-foreground">
          {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}Upload
        </button>
      </div>
      <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => upload(e.target.files)} />
      <div className="mt-3 flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image URL / path like /products/still-awake.jpg" className={inputCls}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (url.trim()) { onChange([...value, url.trim()]); setUrl("") } } }} />
        <button type="button" onClick={() => { if (url.trim()) { onChange([...value, url.trim()]); setUrl("") } }} className="shrink-0 rounded-lg border border-foreground/15 px-4 text-sm hover:bg-foreground/5">Add</button>
      </div>
    </div>
  )
}
