import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App'

import { HeaderProvider } from './contexts/HeaderContext'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <HeaderProvider>
        <App />
      </HeaderProvider>
    </HashRouter>
  </React.StrictMode>
)
