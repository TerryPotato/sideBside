import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import * as authApi from '../api/auth'

function OlvideContrasena({ onBack }) {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) { toast.error('Ingresa tu correo electrónico.'); return }
    setEnviando(true)
    try {
      await authApi.olvideContrasena(email.trim())
      setEnviado(true)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail size={22} className="text-blue-600" />
        </div>
        <h2 className="text-base font-semibold text-gray-800 mb-2">Revisa tu correo</h2>
        <p className="text-sm text-gray-600 mb-6">Si <span className="font-medium">{email}</span> tiene una cuenta, te enviamos un enlace para restablecer tu contraseña. Es válido por 1 hora.</p>
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-blue-600 hover:underline mx-auto font-medium">
          <ArrowLeft size={14} /> Volver a iniciar sesión
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
        <ArrowLeft size={14} /> Volver
      </button>
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Recuperar contraseña</h2>
        <p className="text-sm text-gray-600 mb-4">Ingresa tu correo y te mandamos un enlace para restablecerla.</p>
        <label htmlFor="recuperar-email" className="block text-sm text-gray-700 mb-1">Correo electrónico</label>
        <input
          id="recuperar-email"
          type="email"
          autoComplete="email"
          placeholder="usuario@ejemplo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <button type="submit" disabled={enviando} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
        {enviando ? 'Enviando...' : 'Enviar enlace de recuperación'}
      </button>
    </form>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [modo, setModo] = useState('login') // 'login' | 'olvide'

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.email.trim()) errs.email = 'Ingresa tu correo electrónico.'
    if (!form.password) errs.password = 'Ingresa tu contraseña.'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setEnviando(true)
    try {
      const rol = await login(form.email, form.password)
      navigate(`/${rol}/dashboard`)
    } catch (err) {
      // El backend ahora distingue "no existe esa cuenta" de "contrasena
      // incorrecta" (a proposito, ver auth.controller.js login()): se marca
      // el campo correspondiente ademas del toast, para que sea obvio cual
      // corregir sin tener que releer el mensaje.
      if (/no existe ninguna cuenta/i.test(err.message)) {
        setErrors({ email: err.message })
      } else if (/contrasena no es correcta/i.test(err.message)) {
        setErrors({ password: err.message })
      }
      toast.error(err.message)
    } finally {
      setEnviando(false)
    }
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

        {modo === 'olvide' ? (
          <OlvideContrasena onBack={() => setModo('login')} />
        ) : (
          <>
            <h2 className="text-lg font-semibold text-gray-700 mb-6">Iniciar sesión</h2>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm text-gray-700 mb-1">Correo electrónico</label>
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
                <label htmlFor="password" className="block text-sm text-gray-700 mb-1">Contraseña</label>
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

              <button type="submit" disabled={enviando} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
                {enviando ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="text-center mt-4 space-y-1">
              <button
                type="button"
                onClick={() => setModo('olvide')}
                className="text-sm text-blue-500 hover:underline"
              >
                Olvidé mi contraseña
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
