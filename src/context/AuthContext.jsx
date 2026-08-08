import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const avatarDefault = { tipo: 'color', valor: '#6366f1', foto: null }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sbs_user') ?? sessionStorage.getItem('sbs_user')
    return saved ? JSON.parse(saved) : null
  })

  const [avatar, setAvatar] = useState(() => {
    const saved = localStorage.getItem('sbs_avatar')
    return saved ? JSON.parse(saved) : avatarDefault
  })

  function login(email, password, remember = false) {
    const rol = email.startsWith('admin') ? 'admin' : 'operador'
    const u = { email, nombre: rol === 'admin' ? 'Ana Martínez' : 'Carlos López', rol }
    const storage = remember ? localStorage : sessionStorage
    storage.setItem('sbs_user', JSON.stringify(u))
    setUser(u)
    return rol
  }

  function logout() {
    localStorage.removeItem('sbs_user')
    sessionStorage.removeItem('sbs_user')
    setUser(null)
  }

  function updateAvatar(nuevoAvatar) {
    const next = { ...avatar, ...nuevoAvatar }
    localStorage.setItem('sbs_avatar', JSON.stringify(next))
    setAvatar(next)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, avatar, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
