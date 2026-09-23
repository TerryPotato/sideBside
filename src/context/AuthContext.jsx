import { createContext, useContext, useState } from 'react'
import * as authApi from '../api/auth'
import { getToken, getUser, setSession, clearSession } from '../api/session'

const AuthContext = createContext(null)

const avatarDefault = { tipo: 'color', valor: '#4f46e5', foto: null }
const COLORES_ANTERIORES = { '#6366f1': '#4f46e5', '#f43f5e': '#e11d48', '#10b981': '#047857', '#f59e0b': '#b45309', '#0ea5e9': '#0369a1' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser())

  const [avatar, setAvatar] = useState(() => {
    const saved = localStorage.getItem('sbs_avatar')
    if (!saved) return avatarDefault
    const a = JSON.parse(saved)
    // Los colores de avatar originales eran muy claros para la inicial en
    // blanco (contraste < 4.5:1); se cambian por su tono accesible.
    return a.tipo === 'color' && COLORES_ANTERIORES[a.valor] ? { ...a, valor: COLORES_ANTERIORES[a.valor] } : a
  })

  async function login(email, password) {
    const { token, usuario } = await authApi.login(email, password)
    setSession(token, usuario)
    setUser(usuario)
    return usuario.rol
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch {
      // Sesion stateless: si la llamada falla igual se limpia localmente.
    }
    clearSession()
    setUser(null)
  }

  // Actualiza campos del usuario en memoria + sesion (ej. zona_horaria)
  // sin requerir un nuevo login.
  function updateUser(cambios) {
    setUser(prev => {
      const next = { ...prev, ...cambios }
      setSession(getToken(), next)
      return next
    })
  }

  function updateAvatar(nuevoAvatar) {
    const next = { ...avatar, ...nuevoAvatar }
    localStorage.setItem('sbs_avatar', JSON.stringify(next))
    setAvatar(next)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, avatar, updateAvatar, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
