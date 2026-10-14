import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Las pantallas se cargan por partes. Si se publica una version nueva
// mientras alguien tiene la app abierta, las partes viejas ya no existen y
// abrir otra pantalla fallaria: se recarga para tomar la version nueva.
// El candado de 10 s evita un ciclo de recargas si el fallo es de red.
window.addEventListener('vite:preloadError', (event) => {
  try {
    const ultima = Number(sessionStorage.getItem('recarga-por-version') || 0)
    if (Date.now() - ultima < 10000) return
    sessionStorage.setItem('recarga-por-version', String(Date.now()))
  } catch { /* sin sessionStorage: recargar de todos modos */ }
  event.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
