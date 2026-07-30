import { useEffect, useState } from 'react'
import { useDashboardOrder } from '../../api/dashboard'
import { StatusBadge } from '../../components/ui/Badge'
import { Sheet } from '../../components/ui/Sheet'
import { Tab, TabList, TabPanel, Tabs } from '../../components/ui/Tabs'
import { formatKES } from '../../lib/formatKES'

export function OrderDetailPanel({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const { data: order, isPending } = useDashboardOrder(orderId ?? '')
  const [tab, setTab] = useState('items')

  useEffect(() => {
    setTab('items')
  }, [orderId])

  return (
    <Sheet open={!!orderId} onClose={onClose}>
      {isPending || !order ? (
        <p className="text-text-muted">Loading…</p>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-lg">Order</h2>
            <StatusBadge status={order.status} />
          </div>

          <p className="mb-1 text-sm text-text-muted">Customer</p>
          <p className="mb-4 text-sm">{order.customer_msisdn}</p>

          <Tabs value={tab} onChange={setTab}>
            <TabList>
              <Tab value="items">Items</Tab>
              <Tab value="payment">Payment</Tab>
            </TabList>

            <TabPanel value="items">
              <ul className="mb-4 space-y-1 text-sm">
                {order.items?.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity} × {item.product?.name ?? 'Product'}
                    </span>
                    <span className="tabular-nums">{formatKES(Number(item.unit_price) * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between border-t border-border pt-3 font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatKES(order.amount)}</span>
              </div>
            </TabPanel>

            <TabPanel value="payment">
              {order.mpesa_txn_id && <p className="mb-3 text-xs text-text-subtle">M-Pesa ref: {order.mpesa_txn_id}</p>}

              {order.payout ? (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Platform fee</span>
                    <span className="tabular-nums">{formatKES(order.payout.platform_fee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Net</span>
                    <span className="tabular-nums">{formatKES(order.payout.net_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Status</span>
                    <StatusBadge status={order.payout.status} />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-muted">No payout yet.</p>
              )}
            </TabPanel>
          </Tabs>
        </>
      )}
    </Sheet>
  )
}
