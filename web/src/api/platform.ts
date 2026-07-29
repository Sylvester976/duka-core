import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'

interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface PageParams {
  page?: number
  sort?: string
  direction?: 'asc' | 'desc'
}

export interface PlatformOverview {
  tenants_total: number
  tenants_active: number
  tenants_suspended: number
  platform_earnings_total: string
  pending_payouts: number
}

export function usePlatformOverview() {
  return useQuery({
    queryKey: ['platform', 'overview'],
    queryFn: async () => {
      const { data } = await apiClient.get<PlatformOverview>('/platform/overview')
      return data
    },
  })
}

export interface PlatformTenant {
  id: string
  name: string
  slug: string
  status: 'active' | 'suspended'
  platform_fee_percent: string
  monthly_fee: string
  orders_count: number
  net_remitted: string | null
  created_at: string
}

export function usePlatformTenants(params: PageParams = {}) {
  return useQuery({
    queryKey: ['platform', 'tenants', params],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<PlatformTenant>>('/platform/tenants', { params })
      return data
    },
  })
}

export interface PlatformTenantRemittance {
  status: string
  count: number
  net_total: string
  fee_total: string
}

export interface PlatformTenantDetail {
  tenant: PlatformTenant
  orders_count: number
  remittance: PlatformTenantRemittance[]
}

export function usePlatformTenant(id: string) {
  return useQuery({
    queryKey: ['platform', 'tenants', 'detail', id],
    queryFn: async () => {
      const { data } = await apiClient.get<PlatformTenantDetail>(`/platform/tenants/${id}`)
      return data
    },
    enabled: id !== '',
  })
}

export interface CreateTenantPayload {
  name: string
  slug: string
  brand_primary: string
  platform_fee_percent: number
  monthly_fee: number
  mpesa_shortcode?: string | null
  mpesa_b2c_msisdn?: string | null
  owner_name: string
  owner_email: string
  owner_password: string
}

export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateTenantPayload) => {
      const { data } = await apiClient.post<PlatformTenant>('/platform/tenants', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] })
      queryClient.invalidateQueries({ queryKey: ['platform', 'overview'] })
    },
  })
}

export function useUpdateTenantStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'suspended' }) => {
      const { data } = await apiClient.patch<PlatformTenant>(`/platform/tenants/${id}/status`, { status })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] })
      queryClient.invalidateQueries({ queryKey: ['platform', 'overview'] })
    },
  })
}
