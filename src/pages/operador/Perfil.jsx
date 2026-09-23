import { useState } from 'react'
import { User, Mail, IdCard, Palette, Pipette, Lock, Eye, EyeOff, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import * as authApi from '../../api/auth'
import FieldHint from '../../components/FieldHint'

// Subconjunto de zonas horarias relevantes para operacion en Mexico/LatAm +
// algunas comunes en EUA/Europa (la empresa piloto opera cruzando frontera).
const ZONAS_HORARIAS = [
  { valor: 'America/Tijuana', label: 'Tijuana (Pacífico, UTC-8/-7)' },
  { valor: 'America/Hermosillo', label: 'Hermosillo (UTC-7, sin horario de verano)' },
  { valor: 'America/Chihuahua', label: 'Chihuahua (Montaña, UTC-7/-6)' },
  { valor: 'America/Mexico_City', label: 'Ciudad de México (Centro, UTC-6)' },
  { valor: 'America/Cancun', label: 'Cancún (Sureste, UTC-5)' },
  { valor: 'America/Bogota', label: 'Bogotá (UTC-5)' },
  { valor: 'America/New_York', label: 'Nueva York (UTC-5/-4)' },
  { valor: 'America/Chicago', label: 'Chicago (UTC-6/-5)' },
  { valor: 'America/Los_Angeles', label: 'Los Ángeles (UTC-8/-7)' },
  { valor: 'Europe/Madrid', label: 'Madrid (UTC+1/+2)' },
  { valor: 'UTC', label: 'UTC' },
]

const COLORES = [
  { valor: '#4f46e5', nombre: 'Índigo' },
  { valor: '#e11d48', nombre: 'Rosa' },
  { valor: '#047857', nombre: 'Esmeralda' },
  { valor: '#b45309', nombre: 'Ámbar' },
  { valor: '#0369a1', nombre: 'Cielo' },
]

const emptyClave = { actual: '', nueva: '', confirmar: '' }

export default function Perfil() {
  const { user, avatar, updateAvatar, updateUser } = useAuth()
  const inicial = user?.nombre?.[0] ?? 'U'

  const form = {
    nombre: user?.nombre ?? '',
    email: user?.email ?? '',
  }

  const [clave, setClave] = useState(emptyClave)
  const [verClave, setVerClave] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [guardandoZona, setGuardandoZona] = useState(false)

  function handleColor(valor) {
    updateAvatar({ tipo: 'color', valor, foto: null })
  }

  function handleColorLibre(e) {
    updateAvatar({ tipo: 'color', valor: e.target.value, foto: null })
  }

  async function handleZonaHoraria(e) {
    const zona_horaria = e.target.value
    setGuardandoZona(true)
    try {
      await authApi.actualizarZonaHoraria(zona_horaria)
      updateUser({ zona_horaria })
      toast.success('Zona horaria actualizada')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGuardandoZona(false)
    }
  }

  async function handleCambiarClave(e) {
    e.preventDefault()
    if (!clave.actual || !clave.nueva) { toast.error('Completa los dos campos'); return }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(clave.nueva)) { toast.error('La nueva contraseña debe tener al menos 8 caracteres, con letras y números'); return }
    if (clave.nueva !== clave.confirmar) { toast.error('La confirmación no coincide'); return }
    setEnviando(true)
    try {
      await authApi.cambiarContrasena(clave.actual, clave.nueva)
      toast.success('Contraseña actualizada')
      setClave(emptyClave)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-base text-gray-700 mt-0.5">Personaliza el color de tu avatar, ajusta tu zona horaria y cambia tu contraseña.</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-black shadow-sm p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
            style={{ backgroundColor: avatar?.valor ?? '#4f46e5' }}>
            {inicial}
          </div>
          <div>
            <p className="font-bold text-gray-900">{form.nombre}</p>
            <p className="text-base text-gray-700 capitalize">{user?.rol}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Palette size={16} className="text-gray-600" />
          <p className="text-base font-semibold text-gray-700">Color de tu perfil</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {COLORES.map(c => (
            <button key={c.valor} onClick={() => handleColor(c.valor)} title={c.nombre}
              aria-label={`Color ${c.nombre}`} aria-pressed={avatar?.tipo === 'color' && avatar.valor === c.valor}
              className="relative w-11 h-11 rounded-full transition-transform hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
              style={{ backgroundColor: c.valor }}>
              {avatar?.tipo === 'color' && avatar.valor === c.valor && (
                <span className="absolute inset-0 rounded-full ring-3 ring-offset-2 ring-gray-800" />
              )}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-1">
            <div className="relative w-10 h-10 rounded-full flex-shrink-0 hover:scale-110 active:scale-95 transition-transform"
              style={{ background: 'conic-gradient(from 0deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ec4899, #ef4444)' }}>
              <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center pointer-events-none">
                <Pipette size={18} className="text-gray-600" />
              </div>
              <input type="color" value={avatar?.tipo === 'color' ? avatar.valor : '#4f46e5'} onChange={handleColorLibre}
                title="Color personalizado"
                className="absolute inset-0 w-full h-full rounded-full opacity-0 cursor-pointer" />
            </div>
            <span className="text-base text-gray-600 font-mono">{avatar?.tipo === 'color' ? avatar.valor : '#4f46e5'}</span>
          </div>
        </div>
      </div>

      {/* Datos */}
      <div className="bg-white rounded-2xl border border-black shadow-sm p-5 space-y-4">
        <div>
          <p className="text-base font-bold text-gray-900">Datos personales</p>
          <p className="text-base text-gray-700 mt-0.5">Administrados por tu empresa. Si algo está desactualizado, pide a tu administrador que lo corrija.</p>
        </div>
        <div className="space-y-3">
          {[
            ...(user?.num_empleado ? [{ field: 'numEmpleado', label: 'Número de empleado', icon: IdCard, value: user.num_empleado }] : []),
            { field: 'nombre', label: 'Nombre completo', icon: User, value: form.nombre },
            { field: 'email', label: 'Correo electrónico', icon: Mail, value: form.email },
          ].map(({ field, label, icon: Icon, value }) => (
            <div key={field}>
              <label className="block text-base font-semibold text-gray-600 mb-1.5">{label}</label>
              <div className="relative">
                <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                <input type="text" value={value} readOnly disabled
                  title="Asignado por la empresa, no editable"
                  className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl pl-10 pr-4 py-3 text-base text-gray-700 cursor-not-allowed" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zona horaria */}
      <div className="bg-white rounded-2xl border border-black shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={16} className="text-gray-600" />
          <p className="text-base font-bold text-gray-900">Zona horaria</p>
        </div>
        <p className="text-base text-gray-700 mb-3">Las fechas y horas de tus gastos y notificaciones se mostrarán con esta zona horaria.</p>
        <select
          value={user?.zona_horaria ?? 'America/Mexico_City'}
          onChange={handleZonaHoraria}
          disabled={guardandoZona}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
        >
          {ZONAS_HORARIAS.map(z => <option key={z.valor} value={z.valor}>{z.label}</option>)}
        </select>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white rounded-2xl border border-black shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} className="text-gray-600" />
          <p className="text-base font-bold text-gray-900">Cambiar contraseña</p>
        </div>
        <form onSubmit={handleCambiarClave} className="space-y-3">
          <div>
            <label className="flex items-center text-base font-semibold text-gray-600 mb-1.5">Contraseña actual<FieldHint text="Tu contraseña actual, para confirmar que eres tú quien hace el cambio." /></label>
            <input type={verClave ? 'text' : 'password'} value={clave.actual}
              onChange={e => setClave(c => ({ ...c, actual: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="flex items-center text-base font-semibold text-gray-600 mb-1.5">Nueva contraseña<FieldHint text="Mínimo 8 caracteres, con al menos una letra y un número." /></label>
            <input type={verClave ? 'text' : 'password'} value={clave.nueva}
              onChange={e => setClave(c => ({ ...c, nueva: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="flex items-center text-base font-semibold text-gray-600 mb-1.5">Confirmar nueva contraseña<FieldHint text="Vuelve a escribir la misma contraseña nueva para evitar errores de dedo." /></label>
            <div className="relative">
              <input type={verClave ? 'text' : 'password'} value={clave.confirmar}
                onChange={e => setClave(c => ({ ...c, confirmar: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-11 text-base focus:outline-none focus:border-blue-500" />
              <button type="button" onClick={() => setVerClave(v => !v)}
                className="absolute inset-y-0 right-0 w-11 flex items-center justify-center text-gray-700 hover:text-gray-700">
                {verClave ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={enviando}
            className="min-h-12 py-2 inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl text-base transition-colors">
            {enviando ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
