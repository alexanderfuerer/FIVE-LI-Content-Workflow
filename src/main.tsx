import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handler to catch all errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error('=== GLOBAL ERROR ===')
  console.error('Message:', message)
  console.error('Source:', source)
  console.error('Line:', lineno, 'Column:', colno)
  console.error('Error object:', error)
  console.error('Stack:', error?.stack)
  console.error('====================')
}

window.onunhandledrejection = (event) => {
  console.error('=== UNHANDLED PROMISE REJECTION ===')
  console.error('Reason:', event.reason)
  console.error('Stack:', event.reason?.stack)
  console.error('===================================')
}

console.log('App starting...')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
