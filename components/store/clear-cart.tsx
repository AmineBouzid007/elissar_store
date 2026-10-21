"use client"

import { useEffect } from "react"
import { useCart } from "@/lib/cart-context"

/** Empties the cart once the order is safely placed (for card payments: once the payment is confirmed). */
export function ClearCart() {
  const { clear, ready } = useCart()
  useEffect(() => {
    if (ready) clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])
  return null
}
