import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { OrderStatusPage } from './routes/storefront/OrderStatusPage'
import { StorePage } from './routes/storefront/StorePage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div>duka-core</div>} />
          <Route path="/shop/:slug" element={<StorePage />} />
          <Route path="/shop/:slug/orders/:orderId" element={<OrderStatusPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
