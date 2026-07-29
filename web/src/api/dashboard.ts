import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'

interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface SortParams {
  sort?: string
  direction?: 'asc' | 'desc'
}

interface PageParams extends SortParams {
  page?: number
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: string
  image_url: string | null
  is_active: boolean
}

export function useDashboardProducts(params: PageParams = {}) {
  return useQuery({
    queryKey: ['dashboard', 'products', params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Product>>('/dashboard/products', { params })
      return data
    },
  })
}

interface ProductPayload {
  name: string
  price: number
  description?: string | null
  image_url?: string | null
  is_active?: boolean
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ProductPayload) => {
      const { data } = await apiClient.post<Product>('/dashboard/products', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'products'] }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<ProductPayload> & { id: string }) => {
      const { data } = await apiClient.put<Product>(`/dashboard/products/${id}`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'products'] }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/dashboard/products/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'products'] }),
  })
}

export interface OrderItem {
  id: string
  product_id: string
  quantity: number
  unit_price: string
  product?: Product
}

export interface DashboardPayout {
  id: string
  order_id: string
  gross_amount: string
  platform_fee: string
  net_amount: string
  status: string
  mpesa_b2c_txn_id: string | null
  paid_at: string | null
}

export interface DashboardOrder {
  id: string
  customer_msisdn: string
  amount: string
  status: string
  mpesa_txn_id: string | null
  paid_at: string | null
  created_at: string
  items?: OrderItem[]
  payout?: DashboardPayout | null
}

interface OrdersParams extends PageParams {
  status?: string
}

export function useDashboardOrders(params: OrdersParams = {}) {
  return useQuery({
    queryKey: ['dashboard', 'orders', params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<DashboardOrder>>('/dashboard/orders', { params })
      return data
    },
  })
}

export function useDashboardOrder(id: string) {
  return useQuery({
    queryKey: ['dashboard', 'orders', 'detail', id],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardOrder>(`/dashboard/orders/${id}`)
      return data
    },
    enabled: id !== '',
  })
}

export function useDashboardPayouts(params: PageParams = {}) {
  return useQuery({
    queryKey: ['dashboard', 'payouts', params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<DashboardPayout>>('/dashboard/payouts', { params })
      return data
    },
  })
}

export interface Overview {
  today_revenue: string
  orders_today: number
  pending_payouts: number
  net_today: string
  today_revenue_change_pct: number | null
  orders_today_change_pct: number | null
  net_today_change_pct: number | null
}

export function useOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const { data } = await apiClient.get<Overview>('/dashboard/overview')
      return data
    },
  })
}

export interface TenantSettings {
  id: string
  name: string
  slug: string
  brand_primary: string
  brand_logo_url: string | null
  mpesa_shortcode: string | null
  mpesa_b2c_msisdn: string | null
}

export function useTenantSettings() {
  return useQuery({
    queryKey: ['dashboard', 'settings'],
    queryFn: async () => {
      const { data } = await apiClient.get<TenantSettings>('/dashboard/settings')
      return data
    },
  })
}

export function useUpdateTenantSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<TenantSettings>) => {
      const { data } = await apiClient.put<TenantSettings>('/dashboard/settings', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'settings'] }),
  })
}
