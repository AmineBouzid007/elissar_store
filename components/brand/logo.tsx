// Elissar brand marks. Files live in /public/brand. Rendered as a CSS mask so the
// logo follows currentColor (text-foreground, text-primary, ...) and keeps a transparent background.
type P = { className?: string; title?: string }

function Mark({ src, ratio, className, title }: P & { src: string; ratio: number }) {
  const mask = `url(${src}) center / contain no-repeat`
  return (
    <span
      role="img"
      aria-label={title ?? "Elissar"}
      className={`inline-block shrink-0 bg-current ${className ?? ""}`}
      style={{ aspectRatio: String(ratio), WebkitMask: mask, mask }}
    />
  )
}

/** Full logo: symbol + "Elissar" wordmark (1151 x 287). */
export function LogoWordmark({ className, title }: P) {
  return <Mark src="/brand/elissar-logo.png" ratio={1151 / 287} className={className} title={title} />
}

/** Geometric symbol only (600 x 522). */
export function LogoMark({ className, title }: P) {
  return <Mark src="/brand/elissar-symbol.png" ratio={600 / 522} className={className} title={title} />
}

/** Same as the full logo; kept for existing imports. */
export const LogoLockup = LogoWordmark
