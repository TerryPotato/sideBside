import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import * as authApi from '../api/auth'

// Misma regla que el backend (src/utils/validations.js validarFortalezaContrasena):
// minimo 8 caracteres, al menos una letra y un numero.
const CONTRASENA_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

function Requisito({ ok, label }) {
  return (
    <li className={`flex items-center gap-1.5 text-base ${ok ? 'text-green-700' : 'text-gray-700'}`}>
      {ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {label}
    </li>
  )
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')

  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const tieneLongitud = nueva.length >= 8
  const tieneLetraYNumero = /[A-Za-z]/.test(nueva) && /\d/.test(nueva)
  const esValida = CONTRASENA_REGEX.test(nueva)
  const coinciden = nueva.length > 0 && nueva === confirmar

  async function handleSubmit(e) {
    e.preventDefault()
    if (!token) { toast.error('El enlace no es válido'); return }
    if (!esValida) { toast.error('La contraseña no cumple los requisitos'); return }
    if (!coinciden) { toast.error('Las contraseñas no coinciden'); return }
    setEnviando(true)
    try {
      await authApi.restablecerContrasena(token, nueva)
      toast.success('Contraseña restablecida, ya puedes iniciar sesión')
      navigate('/login')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2456] to-[#2a3a8f] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">S</div>
            <span className="text-2xl font-bold text-[#1a2456]">SideBSide</span>
          </div>
        </div>

        {!token ? (
          <div className="text-center">
            <p className="text-base text-gray-700 mb-4">Este enlace no es válido o ya expiró. Solicita uno nuevo desde la pantalla de inicio de sesión.</p>
            <Link to="/login" className="text-base text-blue-600 hover:underline font-medium">Volver a iniciar sesión</Link>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Nueva contraseña</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-base text-gray-700 mb-1">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={verClave ? 'text' : 'password'}
                    value={nueva}
                    onChange={e => setNueva(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base pr-11 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button type="button" onClick={() => setVerClave(v => !v)}
                    className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-gray-600 hover:text-gray-800">
                    {verClave ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <ul className="mt-2 space-y-1">
                  <Requisito ok={tieneLongitud} label="Al menos 8 caracteres" />
                  <Requisito ok={tieneLetraYNumero} label="Al menos una letra y un número" />
                </ul>
              </div>
              <div>
                <label className="block text-base text-gray-700 mb-1">Confirmar contraseña</label>
                <input
                  type={verClave ? 'text' : 'password'}
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {confirmar.length > 0 && !coinciden && <p className="text-base text-red-600 mt-1">Las contraseñas no coinciden</p>}
              </div>
              <button type="submit" disabled={enviando || !esValida || !coinciden}
                className="min-h-12 py-2 inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl text-base transition-colors">
                {enviando ? 'Guardando...' : 'Restablecer contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
