import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'

import { HeaderProvider } from './contexts/HeaderContext'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <HeaderProvider>
          <App />
        </HeaderProvider>
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
