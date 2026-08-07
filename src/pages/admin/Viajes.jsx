import { useState } from 'react'
import { Plus, X, MapPin, Calendar, User, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { useData } from '../../context/DataContext'
import AprobacionModal from '../../components/AprobacionModal'

const estadoChip = {
  activo: 'bg-green-100 text-green-700',
  completado: 'bg-gray-100 text-gray-600',
}

export default function Viajes() {
  const { viajes, usuariosList: usuarios, crearViaje, gastosDeViaje } = useData()
  const [showForm, setShowForm] = useState(false)
  const [viajeModal, setViajeModal] = useState(null)
  const [form, setForm] = useState({ nombre: '', usuario_id: '', fecha_inicio: '', fecha_fin: '', presupuesto: '' })
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.usuario_id) e.usuario_id = 'Requerido'
    if (!form.fecha_inicio) e.fecha_inicio = 'Requerido'
    if (!form.fecha_fin) e.fecha_fin = 'Requerido'
    if (form.fecha_inicio && form.fecha_fin && form.fecha_fin < form.fecha_inicio) e.fecha_fin = 'Debe ser mayor a la fecha de inicio'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    crearViaje({ ...form, usuario_id: Number(form.usuario_id), presupuesto: Number(form.presupuesto) || 0 })
    toast.success('Viaje creado correctamente')
    setForm({ nombre: '', usuario_id: '', fecha_inicio: '', fecha_fin: '', presupuesto: '' })
    setErrors({})
    setShowForm(false)
  }

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const operadores = usuarios.filter(u => u.rol !== 'admin')

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 gap-2">
        <h1 className="text-xl font-bold text-gray-800">Viajes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 sm:px-4 rounded-lg transition-colors flex-shrink-0"
        >
          <Plus size={16} /><span className="hidden sm:inline">Nuevo viaje</span>
        </button>
      </div>

      {/* Modal de aprobación */}
      {viajeModal && <AprobacionModal viaje={viajeModal} onClose={() => setViajeModal(null)} />}

      {/* Formulario nuevo viaje */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Nuevo viaje</h2>
            <button onClick={() => { setShowForm(false); setErrors({}) }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Nombre del viaje <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Ej. Visita cliente Monterrey"
                  value={form.nombre}
                  onChange={e => set('nombre', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.nombre ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Empleado <span className="text-red-500">*</span></label>
                <select
                  value={form.usuario_id}
                  onChange={e => set('usuario_id', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white ${errors.usuario_id ? 'border-red-400' : 'border-gray-300'}`}
                >
                  <option value="">Seleccionar empleado</option>
                  {operadores.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
                {errors.usuario_id && <p className="text-xs text-red-500 mt-1">{errors.usuario_id}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Presupuesto <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input
                  type="number"
                  placeholder="$ 0.00"
                  value={form.presupuesto}
                  onChange={e => set('presupuesto', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Fecha inicio <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.fecha_inicio}
                  onChange={e => set('fecha_inicio', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.fecha_inicio ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.fecha_inicio && <p className="text-xs text-red-500 mt-1">{errors.fecha_inicio}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Fecha fin <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.fecha_fin}
                  onChange={e => set('fecha_fin', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.fecha_fin ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.fecha_fin && <p className="text-xs text-red-500 mt-1">{errors.fecha_fin}</p>}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setShowForm(false); setErrors({}) }} className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">Crear viaje</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de viajes */}
      <div className="space-y-3">
        {viajes.map(v => {
          const gastos = gastosDeViaje(v.id)
          const pendientes = gastos.filter(g => g.estado === 'Pendiente').length
          return (
            <div key={v.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-800">{v.nombre}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoChip[v.estado]}`}>{v.estado}</span>
                    {pendientes > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                        {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><User size={12} />{v.usuario}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} />{v.fecha_inicio} → {v.fecha_fin}</span>
                    {v.presupuesto > 0 && <span className="flex items-center gap-1"><DollarSign size={12} />Presupuesto: ${v.presupuesto.toLocaleString()}</span>}
                    <span className="flex items-center gap-1"><MapPin size={12} />{gastos.length} gasto{gastos.length !== 1 ? 's' : ''} registrado{gastos.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                {pendientes > 0 && (
                  <button
                    onClick={() => setViajeModal(v)}
                    className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Revisar gastos
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
