export function formatPrice(value: number, currency = "TND") {
  const n = Number(value) || 0
  const str = Number.isInteger(n) ? String(n) : n.toFixed(2)
  return `${str} ${currency}`
}

export function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

export function formatDateTime(iso: string | Date) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}
