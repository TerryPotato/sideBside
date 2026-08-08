import { useState } from 'react'
import { Plus, Pencil, X, Check, Pipette } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { useData } from '../../context/DataContext'
import toast from 'react-hot-toast'
import IconButton from '../../components/IconButton'

const ICONOS_DISPONIBLES = [
  'UtensilsCrossed', 'Fuel', 'Milestone', 'Wrench', 'BedDouble',
  'Bus', 'Package', 'ShoppingCart', 'Plane', 'Coffee',
  'Car', 'Zap', 'Stethoscope', 'BookOpen', 'Monitor',
]

const COLORES = ['#3b82f6','#22c55e','#f59e0b','#a855f7','#0ea5e9','#ec4899','#f43f5e','#10b981','#6b7280','#ef4444']

function IconoPicker({ seleccionado, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {ICONOS_DISPONIBLES.map(nombre => {
        const Icono = LucideIcons[nombre]
        if (!Icono) return null
        const activo = seleccionado === nombre
        return (
          <button key={nombre} type="button" onClick={() => onChange(nombre)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-all ${activo ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
            <Icono size={18} />
          </button>
        )
      })}
    </div>
  )
}

function CategoriaCard({ cat, onEdit }) {
  const Icono = LucideIcons[cat.icono] ?? LucideIcons.Package
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: cat.color + '22' }}>
        <Icono size={20} style={{ color: cat.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 text-sm">{cat.nombre}</p>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${cat.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {cat.activo ? 'Activa' : 'Inactiva'}
          </span>
        </div>
        <p className="text-sm text-gray-500 truncate">{cat.descripcion}</p>
      </div>
      <IconButton icon={Pencil} label={`Editar ${cat.nombre}`} onClick={() => onEdit(cat)} iconSize={15} rounded="rounded-xl" />
    </div>
  )
}

const emptyForm = { nombre: '', descripcion: '', color: '#3b82f6', icono: 'Package', activo: true }

export default function Categorias() {
  const { categorias, actualizarCategoria, crearCategoria } = useData()
  const [editando, setEditando] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  function set(f, v) { setForm(p => ({ ...p, [f]: v })) }

  function abrirEditar(cat) {
    setForm({ nombre: cat.nombre, descripcion: cat.descripcion, color: cat.color, icono: cat.icono, activo: cat.activo })
    setEditando(cat)
    setShowForm(false)
  }

  function abrirNueva() {
    setForm(emptyForm)
    setEditando(null)
    setShowForm(true)
  }

  function handleGuardar() {
    if (!form.nombre.trim()) { toast.error('El nombre es requerido'); return }
    if (editando) {
      actualizarCategoria(editando.id, form)
      toast.success('Categoría actualizada')
      setEditando(null)
    } else {
      crearCategoria(form)
      toast.success('Categoría creada')
      setShowForm(false)
    }
    setForm(emptyForm)
  }

  const editorOpen = editando || showForm

  function cerrarEditor() {
    setEditando(null)
    setShowForm(false)
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-5 gap-2">
        <h1 className="text-xl font-bold text-gray-900">Categorías</h1>
        <button onClick={abrirNueva} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
          <Plus size={16} /> Nueva
        </button>
      </div>

      <div className="space-y-2.5 max-w-2xl">
        {categorias.map(c => <CategoriaCard key={c.id} cat={c} onEdit={abrirEditar} />)}
      </div>

      {/* Editor */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={cerrarEditor} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg z-10 flex flex-col overflow-hidden" style={{ maxHeight: '92vh' }}>
            <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-100 flex-shrink-0">
              <p className="font-bold text-gray-900">{editando ? 'Editar categoría' : 'Nueva categoría'}</p>
              <IconButton icon={X} label="Cerrar" onClick={cerrarEditor} size="sm" iconSize={18} />
            </div>

            <div className="p-5 overflow-y-auto flex-1">
            {/* Preview */}
            <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
              {(() => { const Icono = LucideIcons[form.icono] ?? LucideIcons.Package; return (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: form.color + '22' }}>
                  <Icono size={20} style={{ color: form.color }} />
                </div>
              )})()}
              <p className="font-semibold text-gray-800 text-sm">{form.nombre || 'Nueva categoría'}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1.5">Nombre</label>
                <input value={form.nombre} onChange={e => set('nombre', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Ej. Combustible" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-1.5">Descripción</label>
                <input value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Breve descripción" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-2">Icono</label>
                <IconoPicker seleccionado={form.icono} onChange={v => set('icono', v)} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 block mb-2">Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLORES.map(c => (
                    <button key={c} type="button" onClick={() => set('color', c)}
                      className="relative w-8 h-8 rounded-full transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                      style={{ backgroundColor: c }}>
                      {form.color === c && <Check size={14} className="absolute inset-0 m-auto text-white" />}
                    </button>
                  ))}
                  <div className="relative w-8 h-8 rounded-full flex-shrink-0 hover:scale-110 active:scale-95 transition-transform"
                    style={{ background: 'conic-gradient(from 0deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ec4899, #ef4444)' }}>
                    <div className="absolute inset-[2px] rounded-full bg-white flex items-center justify-center pointer-events-none">
                      <Pipette size={12} className="text-gray-600" />
                    </div>
                    <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                      title="Color personalizado"
                      className="absolute inset-0 w-full h-full rounded-full opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
              {editando && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-700 flex-1">Estado: <span className="font-semibold">{form.activo ? 'Activa' : 'Inactiva'}</span></span>
                  <button type="button" onClick={() => set('activo', !form.activo)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${form.activo ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                    {form.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              )}
            </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
              <button onClick={handleGuardar} className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 rounded-xl text-sm transition-colors">
                {editando ? 'Guardar cambios' : 'Crear categoría'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
