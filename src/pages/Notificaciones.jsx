import { useState } from 'react'
import { CheckCircle, XCircle, Clock, Bell, Plane } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const notisOperador = [
  { tipo: 'aprobado', titulo: 'Gasto aprobado — $350.00', detalle: 'Comida con cliente · 14/05/2024', hora: 'Hace 5 min', hoy: true, leido: false },
  { tipo: 'rechazado', titulo: 'Gasto rechazado — $120.00', detalle: 'Café reunión · Motivo: ticket ilegible', hora: 'Hace 2 h', hoy: true, leido: false },
  { tipo: 'viaje', titulo: 'Nuevo viaje asignado', detalle: 'Visita cliente Monterrey · 10/05 → 15/05', hora: 'Hace 3 h', hoy: true, leido: false },
  { tipo: 'aprobado', titulo: 'Gasto aprobado — $800.00', detalle: 'Gasolina autopista Mty · 13/05/2024', hora: 'Ayer 09:10', hoy: false, leido: true },
  { tipo: 'pendiente', titulo: '2 gastos sin revisión', detalle: 'Consulta el historial de tu viaje', hora: 'Hace 2 días', hoy: false, leido: true },
]

const notisAdmin = [
  { tipo: 'pendiente', titulo: 'Nuevo gasto de Carlos López', detalle: 'Gasolina · $800.00 · Viaje Monterrey', hora: 'Hace 5 min', hoy: true, leido: false },
  { tipo: 'pendiente', titulo: 'Nuevo gasto de María García', detalle: 'Almuerzo · $280.00 · Feria CDMX', hora: 'Hace 20 min', hoy: true, leido: false },
  { tipo: 'viaje', titulo: 'Viaje "Feria CDMX" termina hoy', detalle: 'María García · 2 gastos pendientes', hora: 'Hace 1 h', hoy: true, leido: false },
  { tipo: 'info', titulo: '5 gastos esperan aprobación', detalle: 'En 2 viajes activos', hora: 'Ayer 08:00', hoy: false, leido: true },
  { tipo: 'aprobado', titulo: 'Aprobaste gasto de $350.00', detalle: 'Carlos López · Comida con cliente', hora: 'Hace 2 días', hoy: false, leido: true },
]

const config = {
  aprobado: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-600', label: 'Aprobado' },
  rechazado: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-600', label: 'Rechazado' },
  pendiente: { icon: Clock, bg: 'bg-orange-100', text: 'text-orange-500', label: 'Pendiente' },
  info: { icon: Bell, bg: 'bg-blue-100', text: 'text-blue-600', label: 'Aviso' },
  viaje: { icon: Plane, bg: 'bg-indigo-100', text: 'text-indigo-600', label: 'Viaje' },
}

export default function Notificaciones() {
  const { user } = useAuth()
  const lista = user?.rol === 'admin' ? notisAdmin : notisOperador
  const [notis, setNotis] = useState(lista)

  const hoy = notis.filter(n => n.hoy)
  const anteriores = notis.filter(n => !n.hoy)
  const noLeidas = notis.filter(n => !n.leido).length

  function marcar(i) { setNotis(prev => prev.map((n, j) => j === i ? { ...n, leido: true } : n)) }
  function marcarTodas() { setNotis(prev => prev.map(n => ({ ...n, leido: true }))) }

  function Item({ n, i }) {
    const { icon: Icono, bg, text } = config[n.tipo] ?? config.info
    return (
      <div
        onClick={() => marcar(i)}
        className={`flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer border transition-all active:scale-[0.99] ${
          !n.leido
            ? 'bg-white border-blue-200 shadow-sm shadow-blue-100'
            : 'bg-white border-gray-100 shadow-sm opacity-75 hover:opacity-100'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icono size={18} className={text} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug ${!n.leido ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{n.titulo}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.detalle}</p>
          <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{n.hora}</p>
        </div>
        {!n.leido && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-gray-900">Notificaciones</h1>
          {noLeidas > 0 && <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">{noLeidas}</span>}
        </div>
        {noLeidas > 0 && (
          <button onClick={marcarTodas} className="text-xs font-semibold text-blue-600 hover:text-blue-700 active:text-blue-800 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
            Marcar todas
          </button>
        )}
      </div>

      <div className="p-4 space-y-5">
        {/* Hoy */}
        {hoy.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Hoy</p>
            {hoy.map((n, i) => <Item key={i} n={n} i={i} />)}
          </div>
        )}

        {/* Anteriores */}
        {anteriores.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Anteriores</p>
            {anteriores.map((n, i) => <Item key={i + hoy.length} n={n} i={i + hoy.length} />)}
          </div>
        )}

        {notis.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Bell size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Sin notificaciones</p>
          </div>
        )}
      </div>
    </div>
  )
}
