import { useState } from 'react'
import { Plus, Trash2, X, MailCheck, Search } from 'lucide-react'
import { useData } from '../../context/DataContext'
import toast from 'react-hot-toast'
import IconButton from '../../components/IconButton'
import FieldHint from '../../components/FieldHint'

// La contrasena temporal ya no pasa por el admin: el backend la genera y la
// manda directo al correo del usuario nuevo (protege al operador — el admin
// nunca la ve ni queda expuesta en esta pantalla).
function UsuarioCreadoModal({ usuario, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white border border-black rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
          <MailCheck size={22} className="text-blue-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">Usuario creado</h3>
        <p className="text-base text-gray-600 text-center mb-4">
          Enviamos la contraseña temporal por correo a <span className="font-semibold">{usuario.nombre}</span> ({usuario.email}). Por seguridad, no se muestra aquí.
        </p>
        <button onClick={onClose} className="min-h-12 py-2 inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-base transition-colors">
          Entendido
        </button>
      </div>
    </div>
  )
}

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
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">¿Desactivar usuario?</h3>
        <p className="text-base text-gray-700 text-center mb-4">Dejará de aparecer en la lista y no podrá iniciar sesión. Para confirmar, escribe el nombre del usuario:</p>
        <p className="text-base font-bold text-gray-900 text-center mb-3">"{usuario.nombre}"</p>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe el nombre aquí"
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-red-400 mb-4"
          autoFocus
        />
        <div className="flex flex-col gap-2">
          <button onClick={onConfirm} disabled={!match}
            className="min-h-12 py-2 inline-flex items-center justify-center w-full bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-base transition-colors">
            Desactivar usuario
          </button>
          <button onClick={onCancel} className="min-h-12 py-2 inline-flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-base transition-colors">
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
  const [creado, setCreado] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [busqueda, setBusqueda] = useState('')

  const usuariosFiltrados = usuariosList.filter(u => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return true
    return u.nombre.toLowerCase().includes(q)
      || u.email.toLowerCase().includes(q)
      || (u.num_empleado ?? '').toLowerCase().includes(q)
  })

  function validate() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.email.trim()) e.email = 'Requerido'
    if (!form.num_empleado.trim()) e.num_empleado = 'Requerido'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      const usuario = await agregarUsuario(form)
      setForm(emptyForm)
      setErrors({})
      setShowForm(false)
      setCreado(usuario)
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function confirmDelete() {
    try {
      await eliminarUsuario(deleteTarget.id)
      toast('Usuario desactivado', { icon: '🗑️' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleteTarget(null)
    }
  }

  function set(f, v) { setForm(prev => ({ ...prev, [f]: v })); setErrors(e => ({ ...e, [f]: '' })) }

  return (
    <div className="p-4 sm:p-6">
      {deleteTarget && <DeleteModal usuario={deleteTarget} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}
      {creado && <UsuarioCreadoModal usuario={creado} onClose={() => setCreado(null)} />}

      <div className="flex items-start justify-between mb-5 gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-base text-gray-700 mt-0.5">Da de alta a tus operadores y administradores. Al crear uno, la contraseña temporal se le manda directo a su correo.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="min-h-11 py-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-4 rounded-xl text-base transition-colors shadow-sm flex-shrink-0">
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, correo o número de empleado..."
          className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-base focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-gray-900">Nuevo usuario</p>
            <button onClick={() => { setShowForm(false); setErrors({}) }} className="text-gray-600 hover:text-gray-600 p-1"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { f: 'nombre', label: 'Nombre completo', hint: 'El nombre con el que aparecerá en toda la plataforma.' },
                { f: 'email', label: 'Correo electrónico', hint: 'A este correo se le manda la contraseña temporal de acceso.' },
                { f: 'num_empleado', label: 'Número de empleado', hint: 'El identificador interno de tu empresa para este empleado.' },
              ].map(({ f, label, hint }) => (
                <div key={f} className={f === 'nombre' ? 'sm:col-span-2' : ''}>
                  <label className="flex items-center text-base font-semibold text-gray-600 mb-1">{label} <span className="text-red-600 ml-1">*</span><FieldHint text={hint} /></label>
                  <input value={form[f]} onChange={e => set(f, e.target.value)}
                    className={`w-full border-2 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 ${errors[f] ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors[f] && <p className="text-base text-red-600 mt-1">{errors[f]}</p>}
                </div>
              ))}
              <div>
                <label className="flex items-center text-base font-semibold text-gray-600 mb-1">Rol<FieldHint text="Operador solo registra y ve sus propios gastos. Administrador puede aprobar gastos y gestionar todo el equipo." /></label>
                <select value={form.rol} onChange={e => set('rol', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 bg-white">
                  <option value="operador">Operador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => { setShowForm(false); setErrors({}) }}
                className="min-h-11 py-2 flex-1 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl text-base hover:bg-gray-50 transition-colors">Cancelar</button>
              <button type="submit" className="min-h-11 py-2 flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base transition-colors">Crear usuario</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista desktop */}
      <div className="bg-white rounded-2xl border border-black shadow-sm overflow-hidden">
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="text-left bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-base font-bold text-gray-700 uppercase tracking-wide">Empleado</th>
                <th className="px-5 py-3 text-base font-bold text-gray-700 uppercase tracking-wide">No. Empleado</th>
                <th className="px-5 py-3 text-base font-bold text-gray-700 uppercase tracking-wide">Correo</th>
                <th className="px-5 py-3 text-base font-bold text-gray-700 uppercase tracking-wide">Rol</th>
                <th className="px-5 py-3 text-base font-bold text-gray-700 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuariosFiltrados.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3.5 font-semibold text-gray-900">{u.nombre}</td>
                  <td className="px-5 py-3.5 font-mono text-base text-gray-600">{u.num_empleado || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-base font-bold ${rolBadge[u.rol] ?? 'bg-gray-100 text-gray-600'}`}>{u.rol ?? 'operador'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <IconButton icon={Trash2} label={`Eliminar a ${u.nombre}`} onClick={() => setDeleteTarget(u)} variant="danger" iconSize={18} />
                  </td>
                </tr>
              ))}
              {usuariosFiltrados.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-base text-gray-700">Ningún usuario coincide con "{busqueda}"</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cards mobile */}
        <div className="sm:hidden divide-y divide-gray-100">
          {usuariosFiltrados.length === 0 && (
            <p className="px-4 py-8 text-center text-base text-gray-700">Ningún usuario coincide con "{busqueda}"</p>
          )}
          {usuariosFiltrados.map(u => (
            <div key={u.id} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-base flex-shrink-0">
                {u.nombre[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-base">{u.nombre}</p>
                <p className="text-base text-gray-700">{u.num_empleado || '—'} · {u.email}</p>
                <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-base font-bold ${rolBadge[u.rol] ?? 'bg-gray-100 text-gray-600'}`}>{u.rol ?? 'operador'}</span>
              </div>
              <button onClick={() => setDeleteTarget(u)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 flex-shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
