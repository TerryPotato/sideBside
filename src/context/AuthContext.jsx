import { createContext, useContext, useState } from 'react'
import * as authApi from '../api/auth'
import { getToken, getUser, setSession, clearSession } from '../api/session'

const AuthContext = createContext(null)

const avatarDefault = { tipo: 'color', valor: '#6366f1', foto: null }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser())

  const [avatar, setAvatar] = useState(() => {
    const saved = localStorage.getItem('sbs_avatar')
    return saved ? JSON.parse(saved) : avatarDefault
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
