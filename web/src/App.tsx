import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router'
import { AuthProvider } from './lib/auth'
import { DashboardLayout } from './routes/dashboard/DashboardLayout'
import { Login } from './routes/dashboard/Login'
import { Orders } from './routes/dashboard/Orders'
import { Overview } from './routes/dashboard/Overview'
import { Payouts } from './routes/dashboard/Payouts'
import { ProtectedRoute } from './routes/dashboard/ProtectedRoute'
import { Products } from './routes/dashboard/Products'
import { Settings } from './routes/dashboard/Settings'
import { PlatformLayout } from './routes/platform/PlatformLayout'
import { PlatformOverview } from './routes/platform/PlatformOverview'
import { PlatformProtectedRoute } from './routes/platform/PlatformProtectedRoute'
import { Tenants } from './routes/platform/Tenants'
import { OrderStatusPage } from './routes/storefront/OrderStatusPage'
import { StorePage } from './routes/storefront/StorePage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<div>duka-core</div>} />
            <Route path="/shop/:slug" element={<StorePage />} />
            <Route path="/shop/:slug/orders/:orderId" element={<OrderStatusPage />} />

            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Overview />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<Orders />} />
                <Route path="payouts" element={<Payouts />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            <Route element={<PlatformProtectedRoute />}>
              <Route path="/platform" element={<PlatformLayout />}>
                <Route index element={<PlatformOverview />} />
                <Route path="tenants" element={<Tenants />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
