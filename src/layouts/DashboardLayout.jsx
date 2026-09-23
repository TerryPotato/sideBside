import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, PlusSquare, History,
  Bell, LogOut, Users, List,
  BarChart2, Tag, Menu, X, Plane, BookMarked
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import IconButton from '../components/IconButton'

// Orden pensado por frecuencia de uso real: lo que se hace a diario arriba,
// lo que se configura una vez y ya casi no se toca, abajo.
const operadorNav = [
  { to: '/operador/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/operador/nuevo-gasto', icon: PlusSquare, label: 'Nuevo Gasto' },
  { to: '/operador/historial', icon: History, label: 'Historial' },
  { to: '/operador/notificaciones', icon: Bell, label: 'Notificaciones' },
  { to: '/operador/borradores', icon: BookMarked, label: 'Borradores' },
]

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/admin/todos-gastos', icon: List, label: 'Todos los Gastos' },
  { to: '/admin/viajes', icon: Plane, label: 'Viajes' },
  { to: '/admin/reportes', icon: BarChart2, label: 'Reportes' },
  { to: '/admin/notificaciones', icon: Bell, label: 'Notificaciones' },
  { to: '/admin/categorias', icon: Tag, label: 'Categorías' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
]

function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <LogOut size={22} className="text-red-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">¿Cerrar sesión?</h3>
        <p className="text-sm text-gray-700 text-center mb-6">Se cerrará tu sesión actual. Tendrás que volver a iniciar sesión para acceder.</p>
        <div className="flex flex-col gap-2">
          <button onClick={onConfirm} className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
            Sí, cerrar sesión
          </button>
          <button onClick={onCancel} className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

function SidebarContent({ navItems, onNavigate, onLogout, user, avatar, noLeidas }) {
  return (
    <>
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">S</div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">SideBSide</p>
            <p className="text-blue-300 text-xs">Gestión de gastos</p>
          </div>
        </div>
        {user && (
          <NavLink
            to={`/${user.rol}/perfil`}
            onClick={onNavigate}
            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl px-3 py-2.5 transition-colors w-full"
          >
            {avatar?.tipo === 'foto' && avatar.foto ? (
              <img src={avatar.foto} alt="avatar" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: avatar?.valor ?? '#6366f1' }}>
                {user.nombre[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.nombre}</p>
              <p className="text-blue-300 text-sm capitalize">Editar perfil</p>
            </div>
          </NavLink>
        )}
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors ${
                isActive
                  ? 'bg-blue-500 text-white font-semibold'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white active:bg-white/20'
              }`
            }
          >
            <Icon size={18} />
            {label}
            {label === 'Notificaciones' && noLeidas > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-sm font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {noLeidas}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-200 bg-red-500/20 w-full font-medium"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </>
  )
}

export default function DashboardLayout({ role }) {
  const navigate = useNavigate()
  const { user, logout, avatar } = useAuth()
  const { notificaciones } = useData()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoutModal, setLogoutModal] = useState(false)
  const navItems = role === 'admin' ? adminNav : operadorNav
  const noLeidas = notificaciones.filter(n => !n.leido).length

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {logoutModal && <LogoutModal onConfirm={handleLogout} onCancel={() => setLogoutModal(false)} />}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 bg-[#1a2456] flex-col flex-shrink-0">
        <SidebarContent navItems={navItems} onLogout={() => setLogoutModal(true)} user={user} avatar={avatar} noLeidas={noLeidas} />
      </aside>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar mobile drawer */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-[#1a2456] flex flex-col z-40 transition-transform duration-300 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <IconButton icon={X} label="Cerrar menú" onClick={() => setMobileOpen(false)} variant="ghostOnDark" iconSize={22} className="absolute top-3 right-3" />
        <SidebarContent navItems={navItems} onLogout={() => { setMobileOpen(false); setLogoutModal(true) }} user={user} avatar={avatar} noLeidas={noLeidas} onNavigate={() => setMobileOpen(false)} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Barra top mobile */}
        <header className="md:hidden bg-[#1a2456] px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow">
          <IconButton icon={Menu} label="Abrir menú" onClick={() => setMobileOpen(true)} variant="ghostOnDark" iconSize={24} className="-ml-1.5" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm">S</div>
            <span className="text-white font-bold text-sm">SideBSide</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
