import { useState } from 'react'
import { ChevronDown, ChevronUp, Download, Calendar, DollarSign } from 'lucide-react'
import { useData } from '../../context/DataContext'
import EmptyState from '../../components/EmptyState'
import toast from 'react-hot-toast'

const estadoBadge = {
  Aprobado: 'text-green-700 bg-green-100',
  Pendiente: 'text-yellow-700 bg-yellow-100',
  Rechazado: 'text-red-700 bg-red-100',
}

const estadoFila = {
  Aprobado: 'bg-green-50 hover:bg-green-100',
  Pendiente: 'bg-yellow-50 hover:bg-yellow-100',
  Rechazado: 'bg-red-50 hover:bg-red-100',
}

export default function Historial() {
  const { viajes, gastosDeViaje } = useData()
  const usuarioId = 1
  const misViajes = viajes.filter(v => v.usuario_id === usuarioId)
  const [abiertos, setAbiertos] = useState({})

  function toggle(id) {
    setAbiertos(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (misViajes.length === 0) return <EmptyState message="No tienes viajes registrados" />

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 gap-2">
        <h1 className="text-xl font-bold text-gray-800">Historial de Gastos</h1>
        <div className="flex gap-2">
          <button onClick={() => toast.success('Descargando Excel...')} className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm px-3 py-2 rounded-lg hover:bg-gray-50">
            <Download size={14} /><span className="hidden sm:inline">Excel</span>
          </button>
          <button onClick={() => toast.success('Descargando PDF...')} className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm px-3 py-2 rounded-lg hover:bg-gray-50">
            <Download size={14} /><span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {misViajes.map(v => {
          const gastos = gastosDeViaje(v.id)
          const total = gastos.reduce((s, g) => s + g.monto, 0)
          const pendientes = gastos.filter(g => g.estado === 'Pendiente').length
          const abierto = !!abiertos[v.id]

          return (
            <div key={v.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Cabecera del viaje */}
              <button
                onClick={() => toggle(v.id)}
                className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-gray-800">{v.nombre}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {v.estado}
                    </span>
                    {pendientes > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                        {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar size={11} />{v.fecha_inicio} → {v.fecha_fin}</span>
                    <span className="flex items-center gap-1"><DollarSign size={11} />Total: ${total.toFixed(2)}</span>
                    <span>{gastos.length} gasto{gastos.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <span className="text-gray-400 flex-shrink-0">
                  {abierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>

              {/* Gastos del viaje */}
              {abierto && (
                <div className="border-t">
                  {gastos.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No hay gastos en este viaje</p>
                  ) : (
                    <>
                      {/* Tabla desktop */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-gray-400 bg-gray-50 border-b">
                              <th className="px-5 py-2 font-medium">Fecha</th>
                              <th className="px-5 py-2 font-medium">Descripción</th>
                              <th className="px-5 py-2 font-medium">Categoría</th>
                              <th className="px-5 py-2 font-medium">Monto</th>
                              <th className="px-5 py-2 font-medium">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gastos.map((g, i) => (
                              <tr key={i} className={`border-b last:border-0 transition-colors ${estadoFila[g.estado]}`}>
                                <td className="px-5 py-2.5 text-gray-500 whitespace-nowrap">{g.fecha}</td>
                                <td className="px-5 py-2.5 text-gray-700">{g.descripcion}</td>
                                <td className="px-5 py-2.5 text-gray-500">{g.categoria}</td>
                                <td className="px-5 py-2.5 font-medium text-gray-800">${g.monto.toFixed(2)}</td>
                                <td className="px-5 py-2.5">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[g.estado]}`}>{g.estado}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Cards mobile */}
                      <div className="sm:hidden divide-y">
                        {gastos.map((g, i) => (
                          <div key={i} className={`p-4 flex items-start justify-between gap-2 transition-colors ${estadoFila[g.estado]}`}>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{g.descripcion}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{g.categoria} · {g.fecha}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className="text-sm font-semibold text-gray-800">${g.monto.toFixed(2)}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[g.estado]}`}>{g.estado}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Resumen pie */}
                      <div className="px-5 py-3 bg-gray-50 border-t flex justify-end text-xs text-gray-500 gap-4">
                        <span>Total del viaje: <span className="font-semibold text-gray-800">${total.toFixed(2)}</span></span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
