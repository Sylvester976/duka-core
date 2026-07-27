import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { DashboardLayout } from './routes/dashboard/DashboardLayout'
import { Login } from './routes/dashboard/Login'
import { Orders } from './routes/dashboard/Orders'
import { Overview } from './routes/dashboard/Overview'
import { Payouts } from './routes/dashboard/Payouts'
import { ProtectedRoute } from './routes/dashboard/ProtectedRoute'
import { Products } from './routes/dashboard/Products'
import { Settings } from './routes/dashboard/Settings'
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
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
