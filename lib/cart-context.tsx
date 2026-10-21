"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import type { CartItem } from "@/lib/types"
import { MAX_QTY_PER_LINE } from "@/lib/constants"

const STORAGE_KEY = "noct_cart_v1"

export interface ShippingConfig {
  fee: number
  freeOver: number
  currency: string
}

interface CartValue {
  items: CartItem[]
  count: number
  subtotal: number
  shipping: number
  total: number
  freeOver: number
  currency: string
  ready: boolean
  isOpen: boolean
  open: () => void
  close: () => void
  addItem: (item: CartItem) => void
  removeItem: (productId: string, size: string, color: string) => void
  setQuantity: (productId: string, size: string, color: string, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartValue | null>(null)
const same = (i: CartItem, p: string, s: string, c: string) => i.productId === p && i.size === s && i.color === c

export function CartProvider({ children, shipping: cfg }: { children: ReactNode; shipping: ShippingConfig }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const hydrated = useRef(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {
      /* ignore corrupt cart */
    }
    hydrated.current = true
    setReady(true)
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable */
    }
  }, [items])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const ex = prev.find((i) => same(i, item.productId, item.size, item.color))
      if (ex) {
        return prev.map((i) =>
          same(i, item.productId, item.size, item.color)
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, Math.min(item.max, MAX_QTY_PER_LINE)), max: item.max }
            : i,
        )
      }
      return [...prev, item]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback(
    (p: string, s: string, c: string) => setItems((prev) => prev.filter((i) => !same(i, p, s, c))),
    [],
  )
  const setQuantity = useCallback((p: string, s: string, c: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => !same(i, p, s, c))
        : prev.map((i) => (same(i, p, s, c) ? { ...i, quantity: Math.min(qty, i.max, MAX_QTY_PER_LINE) } : i)),
    )
  }, [])
  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartValue>(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0)
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
    const shipping = subtotal === 0 ? 0 : cfg.freeOver > 0 && subtotal >= cfg.freeOver ? 0 : cfg.fee
    return {
      items, count, subtotal, shipping, total: subtotal + shipping,
      freeOver: cfg.freeOver, currency: cfg.currency, ready, isOpen,
      open: () => setIsOpen(true), close: () => setIsOpen(false),
      addItem, removeItem, setQuantity, clear,
    }
  }, [items, cfg.fee, cfg.freeOver, cfg.currency, ready, isOpen, addItem, removeItem, setQuantity, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
