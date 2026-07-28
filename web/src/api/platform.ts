import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './client'

interface Paginated<T> {
  data: T[]
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

export function usePlatformTenants() {
  return useQuery({
    queryKey: ['platform', 'tenants'],
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<PlatformTenant>>('/platform/tenants')
      return data.data
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
