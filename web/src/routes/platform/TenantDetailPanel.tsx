import { usePlatformTenant, useUpdateTenantStatus } from '../../api/platform'
import { StatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatKES } from '../../lib/formatKES'

export function TenantDetailPanel({ tenantId, onClose }: { tenantId: string | null; onClose: () => void }) {
  const { data, isPending } = usePlatformTenant(tenantId ?? '')
  const updateStatus = useUpdateTenantStatus()

  if (!tenantId) return null

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex h-full w-full max-w-sm flex-col overflow-y-auto bg-surface p-5">
        {isPending || !data ? (
          <p className="text-text-muted">Loading…</p>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{data.tenant.name}</h2>
              <StatusBadge status={data.tenant.status} />
            </div>

            <p className="mb-1 text-sm text-text-muted">Slug</p>
            <p className="mb-4 text-sm">{data.tenant.slug}</p>

            <p className="mb-1 text-sm text-text-muted">Platform fee</p>
            <p className="mb-4 text-sm">{data.tenant.platform_fee_percent}%</p>

            <p className="mb-2 text-sm text-text-muted">Remittance by status</p>
            <div className="mb-4 space-y-2 text-sm">
              {data.remittance.map((row) => (
                <div key={row.status} className="flex items-center justify-between">
                  <StatusBadge status={row.status} />
                  <span className="tabular-nums text-text-muted">{row.count}</span>
                  <span className="tabular-nums">{formatKES(row.net_total)}</span>
                </div>
              ))}
              {data.remittance.length === 0 && <p className="text-text-subtle">No payouts yet.</p>}
            </div>

            <div className="mt-auto border-t border-border pt-4">
              {data.tenant.status === 'active' ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  loading={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: data.tenant.id, status: 'suspended' })}
                >
                  Suspend tenant
                </Button>
              ) : (
                <Button
                  className="w-full"
                  loading={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ id: data.tenant.id, status: 'active' })}
                >
                  Reactivate tenant
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
