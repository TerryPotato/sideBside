import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.email.trim()) errs.email = 'Ingresa tu correo electrónico.'
    if (!form.password) errs.password = 'Ingresa tu contraseña.'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    const rol = login(form.email, form.password, form.remember)
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
          <p className="text-sm text-blue-500">Gestión de gastos operativos</p>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-6">Iniciar sesión</h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm text-gray-600 mb-1">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="usuario@ejemplo.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.email && <p id="email-error" className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-600 mb-1">Contraseña</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`w-full border rounded-lg px-3 py-2 text-sm pr-11 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-gray-600 hover:text-gray-800"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p id="password-error" className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" checked={form.remember} onChange={e => set('remember', e.target.checked)} className="rounded" />
            <label htmlFor="remember" className="text-sm text-gray-600">Recordarme en este dispositivo</label>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
            Iniciar sesión
          </button>
        </form>

        <div className="text-center mt-4 space-y-1">
          <button
            type="button"
            onClick={() => toast('La recuperación de contraseña estará disponible próximamente', { icon: '🚧' })}
            className="text-sm text-blue-500 hover:underline"
          >
            Olvidé mi contraseña
          </button>
        </div>
      </div>
    </div>
  )
}
