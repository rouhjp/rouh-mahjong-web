import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.js'
import { DebugPage } from './pages/DebugPage.js'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || '/'}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/debug" element={<DebugPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
