import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from './client'
import type { Order, Storefront } from '../lib/types'

export function useStorefront(slug: string) {
  return useQuery({
    queryKey: ['storefront', slug],
    queryFn: async () => {
      const { data } = await apiClient.get<Storefront>(`/shop/${slug}`)
      return data
    },
  })
}

interface CheckoutPayload {
  customer_msisdn: string
  items: { product_id: string; quantity: number }[]
}

interface CheckoutResponse {
  order_id: string
  status: string
}

export function useCheckout(slug: string) {
  return useMutation({
    mutationFn: async (payload: CheckoutPayload) => {
      const { data } = await apiClient.post<CheckoutResponse>(`/shop/${slug}/checkout`, payload)
      return data
    },
  })
}

export function useOrderStatus(slug: string, orderId: string) {
  return useQuery({
    queryKey: ['order-status', slug, orderId],
    queryFn: async () => {
      const { data } = await apiClient.get<Order>(`/shop/${slug}/orders/${orderId}/status`)
      return data
    },
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 2500 : false),
  })
}
