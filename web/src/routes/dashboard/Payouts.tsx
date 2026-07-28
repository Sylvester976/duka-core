import { useDashboardPayouts } from '../../api/dashboard'
import { StatusBadge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { formatKES } from '../../lib/formatKES'

export function Payouts() {
  const { data: payouts, isPending } = useDashboardPayouts()

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl">Payouts</h1>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-subtle">
              <th className="px-4 py-2 font-medium">Gross</th>
              <th className="px-4 py-2 font-medium">Platform fee</th>
              <th className="px-4 py-2 font-medium">Net</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">M-Pesa ref</th>
            </tr>
          </thead>
          <tbody>
            {payouts?.map((payout) => (
              <tr key={payout.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 tabular-nums">{formatKES(payout.gross_amount)}</td>
                <td className="px-4 py-2.5 tabular-nums text-text-muted">{formatKES(payout.platform_fee)}</td>
                <td className="px-4 py-2.5 tabular-nums font-medium">{formatKES(payout.net_amount)}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={payout.status} />
                </td>
                <td className="px-4 py-2.5 text-text-subtle">{payout.mpesa_b2c_txn_id ?? '—'}</td>
              </tr>
            ))}
            {!isPending && payouts?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                  No payouts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
