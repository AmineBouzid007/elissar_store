import type { Color, OrderStatus, PaymentStatus, Size } from "@/lib/constants"

export interface Variant {
  id: string
  size: Size
  color: Color
  stock: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  sort_order: number
  product_count?: number
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: number
  compare_at_price: number | null
  category_id: string | null
  category_slug: string | null
  category_name: string | null
  collection: string
  images: string[]
  images_by_color: Partial<Record<Color, string[]>>
  details: string[]
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  created_at: string
  variants: Variant[]
}

export interface CartItem {
  productId: string
  slug: string
  name: string
  price: number
  size: Size
  color: Color
  quantity: number
  image_url: string
  /** max purchasable at the time it was added (UI hint only — server re-checks) */
  max: number
}

export interface StoreSettings {
  shipping_fee: number
  free_shipping_threshold: number
  currency: string
  announcement: string
  contact_email: string
  contact_phone: string
  whatsapp: string
  instagram: string
  tiktok: string
  hero_image: string
  size_chart: string
  store_open: boolean
}

export interface OrderItem {
  id: string
  product_id: string | null
  product_name: string
  size: string
  color: string
  price: number
  quantity: number
  image_url: string
}

export interface Order {
  id: string
  number: string
  customer_name: string
  phone: string
  email: string
  governorate: string
  city: string
  address: string
  postal_code: string
  notes: string
  subtotal: number
  shipping: number
  total: number
  payment_method: "cod"
  payment_status: PaymentStatus
  status: OrderStatus
  created_at: string
  items: OrderItem[]
}
