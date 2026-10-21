// Elissar wordmark rendered as SVG text so it follows currentColor and needs no image file.
const font = { fontFamily: "var(--font-display)", fontWeight: 600 } as const

export function LogoWordmark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 420 100" className={className} fill="currentColor" role="img" aria-label={title ?? "Elissar"} xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="78" fontSize="92" style={font} letterSpacing="2">Elissar</text>
    </svg>
  )
}

export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" role="img" aria-label={title ?? "Elissar"} xmlns="http://www.w3.org/2000/svg">
      <text x="50" y="82" fontSize="96" textAnchor="middle" style={font}>E</text>
    </svg>
  )
}

export function LogoLockup({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 420 130" className={className} fill="currentColor" role="img" aria-label={title ?? "Elissar"} xmlns="http://www.w3.org/2000/svg">
      <text x="210" y="82" fontSize="96" textAnchor="middle" style={font} letterSpacing="2">Elissar</text>
      <text x="210" y="118" fontSize="15" textAnchor="middle" style={{ fontFamily: "var(--font-sans)" }} letterSpacing="5">MAISON DE COUTURE</text>
    </svg>
  )
}
