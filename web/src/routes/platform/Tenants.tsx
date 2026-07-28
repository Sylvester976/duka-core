import { useState } from 'react'
import { usePlatformTenants } from '../../api/platform'
import { StatusBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { formatKES } from '../../lib/formatKES'
import { TenantDetailPanel } from './TenantDetailPanel'

export function Tenants() {
  const { data: tenants, isPending } = usePlatformTenants()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl">Tenants</h1>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-subtle">
              <th className="px-4 py-2 font-medium">Business</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Orders</th>
              <th className="px-4 py-2 font-medium">Net remitted</th>
            </tr>
          </thead>
          <tbody>
            {tenants?.map((tenant) => (
              <tr
                key={tenant.id}
                onClick={() => setSelectedId(tenant.id)}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-2"
              >
                <td className="px-4 py-2.5">
                  <p>{tenant.name}</p>
                  <p className="text-xs text-text-subtle">{tenant.slug}</p>
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={tenant.status} />
                </td>
                <td className="px-4 py-2.5 tabular-nums">{tenant.orders_count}</td>
                <td className="px-4 py-2.5 tabular-nums">
                  {tenant.net_remitted ? formatKES(tenant.net_remitted) : '—'}
                </td>
              </tr>
            ))}
            {!isPending && tenants?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                  No tenants yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <TenantDetailPanel tenantId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
