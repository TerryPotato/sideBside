import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useData } from '../../context/DataContext'
import toast from 'react-hot-toast'

const rolBadge = {
  admin: 'bg-blue-100 text-blue-700',
  operador: 'bg-gray-100 text-gray-600',
}

function DeleteModal({ usuario, onConfirm, onCancel }) {
  const [input, setInput] = useState('')
  const match = input.trim().toLowerCase() === usuario.nombre.toLowerCase()
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <Trash2 size={22} className="text-red-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">¿Eliminar usuario?</h3>
        <p className="text-sm text-gray-500 text-center mb-4">Esta acción no se puede deshacer. Para confirmar, escribe el nombre del usuario:</p>
        <p className="text-sm font-bold text-gray-900 text-center mb-3">"{usuario.nombre}"</p>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe el nombre aquí"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 mb-4"
          autoFocus
        />
        <div className="flex flex-col gap-2">
          <button onClick={onConfirm} disabled={!match}
            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors">
            Eliminar permanentemente
          </button>
          <button onClick={onCancel} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

const emptyForm = { nombre: '', email: '', num_empleado: '', rol: 'operador' }

export default function Usuarios() {
  const { usuariosList, agregarUsuario, eliminarUsuario } = useData()
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.email.trim()) e.email = 'Requerido'
    if (!form.num_empleado.trim()) e.num_empleado = 'Requerido'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    agregarUsuario(form)
    toast.success(`Usuario ${form.nombre} creado`)
    setForm(emptyForm)
    setErrors({})
    setShowForm(false)
  }

  function confirmDelete() {
    eliminarUsuario(deleteTarget.id)
    toast('Usuario eliminado', { icon: '🗑️' })
    setDeleteTarget(null)
  }

  function set(f, v) { setForm(prev => ({ ...prev, [f]: v })); setErrors(e => ({ ...e, [f]: '' })) }

  return (
    <div className="p-4 sm:p-6">
      {deleteTarget && <DeleteModal usuario={deleteTarget} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}

      <div className="flex items-center justify-between mb-5 gap-2">
        <h1 className="text-xl font-bold text-gray-900">Usuarios</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-gray-900">Nuevo usuario</p>
            <button onClick={() => { setShowForm(false); setErrors({}) }} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { f: 'nombre', label: 'Nombre completo' },
                { f: 'email', label: 'Correo electrónico' },
                { f: 'num_empleado', label: 'Número de empleado' },
              ].map(({ f, label }) => (
                <div key={f} className={f === 'nombre' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label} <span className="text-red-500">*</span></label>
                  <input value={form[f]} onChange={e => set(f, e.target.value)}
                    className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 ${errors[f] ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors[f] && <p className="text-xs text-red-500 mt-1">{errors[f]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Rol</label>
                <select value={form.rol} onChange={e => set('rol', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-white">
                  <option value="operador">Operador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => { setShowForm(false); setErrors({}) }}
                className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">Crear usuario</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista desktop */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Empleado</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">No. Empleado</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Correo</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Rol</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuariosList.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 font-semibold text-gray-900">{u.nombre}</td>
                  <td className="px-5 py-3.5 font-mono text-sm text-gray-600">{u.num_empleado || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${rolBadge[u.rol] ?? 'bg-gray-100 text-gray-600'}`}>{u.rol ?? 'operador'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setDeleteTarget(u)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-500 border border-red-100 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards mobile */}
        <div className="sm:hidden divide-y divide-gray-100">
          {usuariosList.map(u => (
            <div key={u.id} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                {u.nombre[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{u.nombre}</p>
                <p className="text-xs text-gray-500">{u.num_empleado || '—'} · {u.email}</p>
                <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-bold ${rolBadge[u.rol] ?? 'bg-gray-100 text-gray-600'}`}>{u.rol ?? 'operador'}</span>
              </div>
              <button onClick={() => setDeleteTarget(u)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 flex-shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
