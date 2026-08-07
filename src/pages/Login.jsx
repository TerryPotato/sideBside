import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Por favor ingresa tu correo y contraseña.')
      return
    }
    const rol = login(form.email, form.password)
    navigate(`/${rol}/dashboard`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2456] to-[#2a3a8f] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">S</div>
            <span className="text-2xl font-bold text-[#1a2456]">SideBSide</span>
          </div>
          <p className="text-xs text-blue-500">Gestión de gastos operativos</p>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-6">Iniciar sesión</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Correo electrónico</label>
            <input
              type="email"
              placeholder="usuario@ejemplo.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" checked={form.remember} onChange={e => setForm({ ...form, remember: e.target.checked })} className="rounded" />
            <label htmlFor="remember" className="text-sm text-gray-600">Recordarme</label>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
            Iniciar sesión
          </button>
        </form>

        <div className="text-center mt-4 space-y-1">
          <a href="#" className="block text-sm text-blue-500 hover:underline">Olvidé mi contraseña</a>
          <p className="text-xs text-gray-400">Usa <span className="font-medium">admin@...</span> para entrar como administrador</p>
        </div>
      </div>
    </div>
  )
}
