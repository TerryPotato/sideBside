import { User, Mail, Phone, Building, IdCard, Palette, Pipette } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

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

  const form = {
    nombre: user?.nombre ?? 'Carlos López',
    email: user?.email ?? 'carlos@empresa.com',
    telefono: '+52 55 1234 5678',
    departamento: 'Ventas',
  }
  const numEmpleado = user?.num_empleado ?? 'EMP-001'

  function handleColor(valor) {
    updateAvatar({ tipo: 'color', valor, foto: null })
  }

  function handleColorLibre(e) {
    updateAvatar({ tipo: 'color', valor: e.target.value, foto: null })
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
          <Palette size={16} className="text-gray-600" />
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
            <div className="relative w-10 h-10 rounded-full flex-shrink-0 hover:scale-110 active:scale-95 transition-transform"
              style={{ background: 'conic-gradient(from 0deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ec4899, #ef4444)' }}>
              <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center pointer-events-none">
                <Pipette size={15} className="text-gray-600" />
              </div>
              <input type="color" value={avatar?.tipo === 'color' ? avatar.valor : '#6366f1'} onChange={handleColorLibre}
                title="Color personalizado"
                className="absolute inset-0 w-full h-full rounded-full opacity-0 cursor-pointer" />
            </div>
            <span className="text-sm text-gray-600 font-mono">{avatar?.tipo === 'color' ? avatar.valor : '#6366f1'}</span>
          </div>
        </div>
      </div>

      {/* Datos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div>
          <p className="text-sm font-bold text-gray-900">Datos personales</p>
          <p className="text-sm text-gray-500 mt-0.5">Administrados por tu empresa. Si algo está desactualizado, pide a tu administrador que lo corrija.</p>
        </div>
        <div className="space-y-3">
          {[
            { field: 'numEmpleado', label: 'Número de empleado', icon: IdCard, value: numEmpleado },
            { field: 'nombre', label: 'Nombre completo', icon: User, value: form.nombre },
            { field: 'email', label: 'Correo electrónico', icon: Mail, value: form.email },
            { field: 'telefono', label: 'Teléfono', icon: Phone, value: form.telefono },
            { field: 'departamento', label: 'Departamento', icon: Building, value: form.departamento },
          ].map(({ field, label, icon: Icon, value }) => (
            <div key={field}>
              <label className="block text-sm font-semibold text-gray-600 mb-1.5">{label}</label>
              <div className="relative">
                <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                <input type="text" value={value} readOnly disabled
                  title="Asignado por la empresa, no editable"
                  className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-500 cursor-not-allowed" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
