import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

import { HeaderProvider } from './contexts/HeaderContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <HeaderProvider>
        <App />
      </HeaderProvider>
    </BrowserRouter>
  </React.StrictMode>
)
