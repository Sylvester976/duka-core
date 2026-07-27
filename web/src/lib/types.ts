export interface Product {
  id: string
  name: string
  description: string | null
  price: string
  image_url: string | null
  is_active: boolean
}

export interface Storefront {
  id: string
  name: string
  slug: string
  brand_primary: string
  brand_logo_url: string | null
  products: Product[]
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired'

export interface Order {
  id: string
  status: OrderStatus
  amount: string
  paid_at: string | null
}
