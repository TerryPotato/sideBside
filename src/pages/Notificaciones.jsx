import { CheckCircle, XCircle, Clock, Bell, Plane, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { formatDateTime } from '../utils/date'
import { destinoNotificacion } from '../utils/notificacionDestino'

const config = {
  aprobado: { icon: CheckCircle, bg: 'bg-green-100', text: 'text-green-800', label: 'Aprobado' },
  rechazado: { icon: XCircle, bg: 'bg-red-100', text: 'text-red-600', label: 'Rechazado' },
  pendiente: { icon: Clock, bg: 'bg-orange-100', text: 'text-orange-700', label: 'Pendiente' },
  info: { icon: Bell, bg: 'bg-blue-100', text: 'text-blue-600', label: 'Aviso' },
  viaje: { icon: Plane, bg: 'bg-indigo-100', text: 'text-indigo-600', label: 'Viaje' },
}

function esHoy(iso) {
  return new Date(iso).toDateString() === new Date().toDateString()
}

export default function Notificaciones() {
  const { notificaciones, marcarNotificacionLeida, marcarTodasNotificacionesLeidas, gastos, viajes } = useData()
  const { user } = useAuth()
  const navigate = useNavigate()

  function abrir(n, destino) {
    if (!n.leido) marcarNotificacionLeida(n.id)
    if (destino) navigate(destino.ruta, { state: destino.state })
  }

  const hoy = notificaciones.filter(n => esHoy(n.fecha_creacion))
  const anteriores = notificaciones.filter(n => !esHoy(n.fecha_creacion))
  const noLeidas = notificaciones.filter(n => !n.leido).length

  function Item({ n }) {
    const { icon: Icono, bg, text } = config[n.tipo] ?? config.info
    const destino = destinoNotificacion(n, { rol: user?.rol, gastos, viajes })
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => abrir(n, destino)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(n, destino) } }}
        className={`flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer border transition-all active:scale-[0.99] ${
          !n.leido
            ? 'bg-blue-50 border-blue-300 border-l-4 border-l-blue-600 shadow-md shadow-blue-100'
            : 'bg-white border-gray-200 shadow-sm'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icono size={18} className={text} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-base leading-snug ${!n.leido ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{n.titulo}</p>
          {n.detalle && <p className="text-base text-gray-700 mt-0.5 leading-relaxed">{n.detalle}</p>}
          <p className="text-base text-gray-600 mt-1.5 font-medium">
            {formatDateTime(n.fecha_creacion, user?.zona_horaria)}
          </p>
        </div>
        {!n.leido && <span className="bg-blue-600 text-white text-base font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0">Nueva</span>}
        {destino && <ChevronRight size={20} className="text-gray-500 flex-shrink-0 self-center" />}
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-gray-900">Notificaciones</h1>
          {noLeidas > 0 && <span className="bg-red-600 text-white text-base font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">{noLeidas}</span>}
        </div>
        {noLeidas > 0 && (
          <button onClick={marcarTodasNotificacionesLeidas} className="min-h-11 py-2 inline-flex items-center justify-center text-base font-semibold text-blue-600 hover:text-blue-700 active:text-blue-800 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
            Marcar todas
          </button>
        )}
      </div>

      <div className="p-4 space-y-5">
        <p className="text-base text-gray-700 -mt-1">Aquí ves los avisos de gastos, viajes y aprobaciones. Da clic en una para ver el gasto o viaje del que se trata.</p>

        {/* Hoy */}
        {hoy.length > 0 && (
          <div className="space-y-2">
            <p className="text-base font-bold text-gray-600 uppercase tracking-widest px-1">Hoy</p>
            {hoy.map(n => <Item key={n.id} n={n} />)}
          </div>
        )}

        {/* Anteriores */}
        {anteriores.length > 0 && (
          <div className="space-y-2">
            <p className="text-base font-bold text-gray-600 uppercase tracking-widest px-1">Anteriores</p>
            {anteriores.map(n => <Item key={n.id} n={n} />)}
          </div>
        )}

        {notificaciones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600">
            <Bell size={40} className="mb-3 opacity-30" />
            <p className="text-base">Sin notificaciones</p>
          </div>
        )}
      </div>
    </div>
  )
}
