import { useState } from 'react'
import { User, Mail, Phone, Building, Save, Palette } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const COLORES = [
  { valor: '#6366f1', nombre: 'Índigo' },
  { valor: '#f43f5e', nombre: 'Rosa' },
  { valor: '#10b981', nombre: 'Esmeralda' },
  { valor: '#f59e0b', nombre: 'Ámbar' },
  { valor: '#0ea5e9', nombre: 'Cielo' },
]

export default function Perfil() {
  const { user, avatar, updateAvatar } = useAuth()
  const inicial = user?.nombre?.[0] ?? 'U'

  const [form, setForm] = useState({
    nombre: user?.nombre ?? 'Carlos López',
    email: user?.email ?? 'carlos@empresa.com',
    telefono: '+52 55 1234 5678',
    departamento: 'Ventas',
  })

  function handleColor(valor) {
    updateAvatar({ tipo: 'color', valor, foto: null })
  }

  function handleColorLibre(e) {
    updateAvatar({ tipo: 'color', valor: e.target.value, foto: null })
  }

  function handleSubmit(e) {
    e.preventDefault()
    toast.success('Perfil actualizado correctamente')
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Mi Perfil</h1>

      {/* Avatar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
            style={{ backgroundColor: avatar?.valor ?? '#6366f1' }}>
            {inicial}
          </div>
          <div>
            <p className="font-bold text-gray-900">{form.nombre}</p>
            <p className="text-sm text-gray-500 capitalize">{user?.rol}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Palette size={16} className="text-gray-400" />
          <p className="text-sm font-semibold text-gray-700">Color de tu perfil</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {COLORES.map(c => (
            <button key={c.valor} onClick={() => handleColor(c.valor)} title={c.nombre}
              className="relative w-10 h-10 rounded-full transition-transform hover:scale-110 active:scale-95 focus:outline-none"
              style={{ backgroundColor: c.valor }}>
              {avatar?.tipo === 'color' && avatar.valor === c.valor && (
                <span className="absolute inset-0 rounded-full ring-3 ring-offset-2 ring-gray-800" />
              )}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-1">
            <input type="color" value={avatar?.tipo === 'color' ? avatar.valor : '#6366f1'} onChange={handleColorLibre}
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-200 p-0.5" />
            <span className="text-xs text-gray-400 font-mono">{avatar?.tipo === 'color' ? avatar.valor : '#6366f1'}</span>
          </div>
        </div>
      </div>

      {/* Datos */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="text-sm font-bold text-gray-900">Datos personales</p>
        <div className="space-y-3">
          {[
            { field: 'nombre', label: 'Nombre completo', icon: User, type: 'text' },
            { field: 'email', label: 'Correo electrónico', icon: Mail, type: 'email' },
            { field: 'telefono', label: 'Teléfono', icon: Phone, type: 'tel' },
            { field: 'departamento', label: 'Departamento', icon: Building, type: 'text' },
          ].map(({ field, label, icon: Icon, type }) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
              <div className="relative">
                <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          ))}
        </div>
        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl text-sm shadow-md shadow-blue-200 transition-colors mt-2">
          <Save size={16} /> Guardar cambios
        </button>
      </form>
    </div>
  )
}
