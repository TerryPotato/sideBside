import { Link } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, Plus, ChevronRight, Plane, TrendingUp, FileText, BookMarked } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'

const estadoBadge = {
  Aprobado: 'text-green-700 bg-green-100',
  Pendiente: 'text-yellow-700 bg-yellow-100',
  Rechazado: 'text-red-700 bg-red-100',
}

const estadoColor = { Aprobado: '#22c55e', Pendiente: '#f59e0b', Rechazado: '#ef4444' }

export default function DashboardOperador() {
  const { user } = useAuth()
  const { gastos, viajes, borradores } = useData()
  const usuarioId = 1

  const misGastos = gastos.filter(g => g.usuario_id === usuarioId)
  const misViajes = viajes.filter(v => v.usuario_id === usuarioId)
  const viajeActivo = misViajes.find(v => v.estado === 'activo')

  const pendientes = misGastos.filter(g => g.estado === 'Pendiente').length
  const aprobados = misGastos.filter(g => g.estado === 'Aprobado').length
  const rechazados = misGastos.filter(g => g.estado === 'Rechazado').length
  const totalMonto = misGastos.filter(g => g.estado === 'Aprobado').reduce((s, g) => s + g.monto, 0)

  const recientes = [...misGastos].slice(0, 4)

  const gastosDeViajeActivo = viajeActivo ? misGastos.filter(g => g.viaje_id === viajeActivo.id) : []
  const totalViaje = gastosDeViajeActivo.reduce((s, g) => s + g.monto, 0)
  const pctPresupuesto = viajeActivo?.presupuesto ? Math.min(100, Math.round((totalViaje / viajeActivo.presupuesto) * 100)) : 0

  return (
    <div className="p-4 sm:p-5 space-y-4">

      {/* Saludo + botón */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">¡Hola, {user?.nombre?.split(' ')[0] ?? 'Carlos'}! 👋</h1>
          <p className="text-sm text-gray-500">Aquí está el resumen de tus gastos</p>
        </div>
        <Link to="/operador/nuevo-gasto"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-blue-200 transition-colors flex-shrink-0">
          <Plus size={16} /> Nuevo gasto
        </Link>
      </div>

      {/* Viaje activo banner */}
      {viajeActivo ? (
        <div className="bg-gradient-to-r from-[#1a2456] to-[#2a3a8f] rounded-2xl p-4 text-white">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Plane size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-200 font-medium">Viaje activo</p>
                <p className="font-bold text-sm leading-tight">{viajeActivo.nombre}</p>
              </div>
            </div>
            <span className="text-xs bg-green-400/30 text-green-200 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Activo</span>
          </div>
          <div className="flex items-center justify-between text-xs text-blue-200 mb-2">
            <span>📅 {viajeActivo.fecha_inicio} → {viajeActivo.fecha_fin}</span>
            <span>{gastosDeViajeActivo.length} gastos registrados</span>
          </div>
          {viajeActivo.presupuesto > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-200">Presupuesto utilizado</span>
                <span className="text-white font-bold">${totalViaje.toLocaleString()} / ${viajeActivo.presupuesto.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${pctPresupuesto >= 90 ? 'bg-red-400' : pctPresupuesto >= 70 ? 'bg-yellow-400' : 'bg-green-400'}`}
                  style={{ width: `${pctPresupuesto}%` }} />
              </div>
              <p className={`text-xs mt-1 font-semibold ${pctPresupuesto >= 90 ? 'text-red-300' : 'text-blue-200'}`}>{pctPresupuesto}% utilizado</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
          <Plane size={20} className="text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Sin viaje activo</p>
            <p className="text-xs text-yellow-600">Pide a tu admin que te asigne un viaje para registrar gastos.</p>
          </div>
        </div>
      )}

      {/* Stats 2x2 compacto */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Clock, bg: 'bg-yellow-100', color: 'text-yellow-600', label: 'Pendientes', value: pendientes, sub: 'Por revisar' },
          { icon: CheckCircle, bg: 'bg-green-100', color: 'text-green-600', label: 'Aprobados', value: aprobados, sub: `$${totalMonto.toLocaleString()} MXN` },
          { icon: XCircle, bg: 'bg-red-100', color: 'text-red-600', label: 'Rechazados', value: rechazados, sub: 'Revisa el motivo' },
          { icon: FileText, bg: 'bg-blue-100', color: 'text-blue-600', label: 'Total gastos', value: misGastos.length, sub: `${misViajes.length} viaje${misViajes.length !== 1 ? 's' : ''}` },
        ].map(({ icon: Icon, bg, color, label, value, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex sm:flex-row flex-col sm:items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500">{label}</p>
              <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/operador/nuevo-gasto" className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl p-4 flex items-center gap-3 transition-colors">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Plus size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm">Nuevo gasto</span>
        </Link>
        <Link to="/operador/borradores" className="bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-100 shadow-sm rounded-2xl p-4 flex items-center gap-3 transition-colors">
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookMarked size={18} className="text-orange-600" />
          </div>
          <div>
            <span className="text-gray-800 font-bold text-sm block">Borradores</span>
            <span className="text-xs text-gray-400">{borradores.length} guardado{borradores.length !== 1 ? 's' : ''}</span>
          </div>
        </Link>
      </div>

      {/* Últimos gastos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <p className="font-bold text-gray-900 text-sm">Últimos gastos</p>
          <Link to="/operador/historial" className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>
        {recientes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aún no tienes gastos registrados</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recientes.map((g, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 transition-colors ${g.estado === 'Aprobado' ? 'bg-green-50' : g.estado === 'Rechazado' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: estadoColor[g.estado] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{g.descripcion}</p>
                  <p className="text-xs text-gray-400">{g.categoria} · {g.fecha}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">${g.monto.toLocaleString()}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${estadoBadge[g.estado]}`}>{g.estado}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Distribución mini */}
      {misGastos.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-blue-600" />
            <p className="font-bold text-gray-900 text-sm">Distribución de mis gastos</p>
          </div>
          <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-3">
            {aprobados > 0 && <div className="bg-green-400 transition-all" style={{ width: `${(aprobados / misGastos.length) * 100}%` }} />}
            {pendientes > 0 && <div className="bg-yellow-400 transition-all" style={{ width: `${(pendientes / misGastos.length) * 100}%` }} />}
            {rechazados > 0 && <div className="bg-red-400 transition-all" style={{ width: `${(rechazados / misGastos.length) * 100}%` }} />}
          </div>
          <div className="flex gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full" />Aprobados {Math.round((aprobados / misGastos.length) * 100)}%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-400 rounded-full" />Pendientes {Math.round((pendientes / misGastos.length) * 100)}%</span>
            {rechazados > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full" />Rechazados {Math.round((rechazados / misGastos.length) * 100)}%</span>}
          </div>
        </div>
      )}
    </div>
  )
}
