export function AnnouncementBar({ text }: { text: string }) {
  if (!text) return null
  const items = Array.from({ length: 8 }, (_, i) => i)
  return (
    <div className="relative z-[60] overflow-hidden bg-foreground py-2 text-background" aria-label={text}>
      <div className="marquee flex w-max whitespace-nowrap" aria-hidden="true">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            {items.map((i) => (
              <span key={i} className="label-mono px-6">
                {text} <span className="px-6 opacity-40">/</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
