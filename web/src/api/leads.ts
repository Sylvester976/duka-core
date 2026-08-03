import { useMutation } from '@tanstack/react-query'
import { apiClient } from './client'

interface LeadPayload {
  name: string
  email: string
  company?: string
  message: string
}

export function useSubmitLead() {
  return useMutation({
    mutationFn: async (payload: LeadPayload) => {
      const { data } = await apiClient.post('/leads', payload)
      return data
    },
  })
}
