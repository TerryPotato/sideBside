import { Link } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, FileText, Plane, ChevronRight, Users, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useData } from '../../context/DataContext'

const pieColors = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#6b7280']

const barData = [
  { mes: 'Ene', monto: 8200 },
  { mes: 'Feb', monto: 12400 },
  { mes: 'Mar', monto: 18900 },
  { mes: 'Abr', monto: 22100 },
  { mes: 'May', monto: 30500 },
]

export default function DashboardAdmin() {
  const { viajes, gastos, usuariosList } = useData()

  const pendientes = gastos.filter(g => g.estado === 'Pendiente')
  const aprobados = gastos.filter(g => g.estado === 'Aprobado')
  const rechazados = gastos.filter(g => g.estado === 'Rechazado')
  const viajesActivos = viajes.filter(v => v.estado === 'activo')
  const viajesConPendientes = viajesActivos.filter(v => gastos.some(g => g.viaje_id === v.id && g.estado === 'Pendiente'))

  const totalAprobado = aprobados.reduce((s, g) => s + g.monto, 0)
  const totalPendiente = pendientes.reduce((s, g) => s + g.monto, 0)

  // Gastos por categoría para pie
  const porCategoria = gastos.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.monto
    return acc
  }, {})
  const pieData = Object.entries(porCategoria).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5)

  // Últimos gastos
  const recientes = [...gastos].slice(0, 5)

  const estadoBadge = {
    Aprobado: 'text-green-700 bg-green-100',
    Pendiente: 'text-yellow-700 bg-yellow-100',
    Rechazado: 'text-red-700 bg-red-100',
  }

  return (
    <div className="p-4 sm:p-5 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Panel de control</h1>
          <p className="text-sm text-gray-500">Vista general de la operación</p>
        </div>
        <Link to="/admin/viajes"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-blue-200 transition-colors flex-shrink-0">
          <Plane size={16} /> Viajes
        </Link>
      </div>

      {/* Alerta viajes con pendientes */}
      {viajesConPendientes.length > 0 && (
        <Link to="/admin/viajes" className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 active:bg-yellow-100 transition-colors">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-yellow-900 text-sm">{pendientes.length} gastos esperan tu aprobación</p>
            <p className="text-sm text-yellow-700">En {viajesConPendientes.length} viaje{viajesConPendientes.length !== 1 ? 's' : ''} · ${totalPendiente.toLocaleString()} MXN</p>
          </div>
          <ChevronRight size={18} className="text-yellow-600 flex-shrink-0" />
        </Link>
      )}

      {/* Stats 4 tarjetas en grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Clock, grad: 'from-yellow-400 to-orange-400', label: 'Pendientes', value: pendientes.length, sub: `$${totalPendiente.toLocaleString()} MXN` },
          { icon: CheckCircle, grad: 'from-green-500 to-emerald-500', label: 'Aprobados', value: aprobados.length, sub: `$${totalAprobado.toLocaleString()} MXN` },
          { icon: XCircle, grad: 'from-red-500 to-rose-500', label: 'Rechazados', value: rechazados.length, sub: `${gastos.length > 0 ? Math.round((rechazados.length / gastos.length) * 100) : 0}% del total` },
          { icon: FileText, grad: 'from-blue-600 to-indigo-600', label: 'Total gastos', value: gastos.length, sub: `${viajesActivos.length} viajes activos` },
        ].map(({ icon: Icon, grad, label, value, sub }) => (
          <div key={label} className={`bg-gradient-to-br ${grad} rounded-2xl p-4 text-white flex sm:flex-row flex-col sm:items-center gap-3`}>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold opacity-80">{label}</p>
              <p className="text-3xl font-black leading-tight">{value}</p>
              <p className="text-sm opacity-70">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts lado a lado en desktop, stack en mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Gráfica tendencia mensual */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-blue-600" />
            <p className="font-bold text-gray-900 text-sm">Gastos por mes</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} barSize={22} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Total']} cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="monto" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie por categoría */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 rounded-full bg-blue-600" />
            <p className="font-bold text-gray-900 text-sm">Por categoría</p>
          </div>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-3">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                    <span className="text-sm text-gray-700 truncate flex-1">{d.name}</span>
                    <span className="text-sm font-bold text-gray-900">${d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 text-center py-8">Sin datos aún</p>
          )}
        </div>
      </div>

      {/* Viajes activos + actividad reciente lado a lado en desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Viajes activos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Plane size={15} className="text-blue-600" />
              <p className="font-bold text-gray-900 text-sm">Viajes activos</p>
            </div>
            <Link to="/admin/viajes" className="text-sm font-semibold text-blue-600 flex items-center gap-0.5">
              Ver todos <ChevronRight size={13} />
            </Link>
          </div>
          {viajesActivos.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-6">Sin viajes activos</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {viajesActivos.slice(0, 4).map(v => {
                const gV = gastos.filter(g => g.viaje_id === v.id)
                const pend = gV.filter(g => g.estado === 'Pendiente').length
                return (
                  <div key={v.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Plane size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{v.nombre}</p>
                      <p className="text-sm text-gray-600">{v.usuario} · {gV.length} gasto{gV.length !== 1 ? 's' : ''}</p>
                    </div>
                    {pend > 0 && (
                      <span className="text-sm bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full flex-shrink-0">{pend}</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-blue-600" />
              <p className="font-bold text-gray-900 text-sm">Actividad reciente</p>
            </div>
            <Link to="/admin/todos-gastos" className="text-sm font-semibold text-blue-600 flex items-center gap-0.5">
              Ver todos <ChevronRight size={13} />
            </Link>
          </div>
          {recientes.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-6">Sin actividad</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recientes.map((g, i) => (
                <div key={i} className={`px-4 py-3 flex items-center gap-3 transition-colors ${g.estado === 'Aprobado' ? 'bg-green-50' : g.estado === 'Rechazado' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${g.estado === 'Aprobado' ? 'bg-green-500' : g.estado === 'Rechazado' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{g.empleado}</p>
                    <p className="text-sm text-gray-600 truncate">{g.descripcion} · {g.categoria}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">${g.monto.toLocaleString()}</p>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${estadoBadge[g.estado]}`}>{g.estado}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resumen empleados */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-blue-600" />
            <p className="font-bold text-gray-900 text-sm">Empleados activos</p>
          </div>
          <Link to="/admin/usuarios" className="text-sm font-semibold text-blue-600 flex items-center gap-0.5">
            Gestionar <ChevronRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {usuariosList.slice(0, 4).map(u => {
            const ugastos = gastos.filter(g => g.usuario_id === u.id)
            const upend = ugastos.filter(g => g.estado === 'Pendiente').length
            return (
              <div key={u.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {u.nombre[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{u.nombre.split(' ')[0]}</p>
                  <p className="text-xs text-gray-600">{ugastos.length} gastos{upend > 0 ? ` · ${upend} pend.` : ''}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
