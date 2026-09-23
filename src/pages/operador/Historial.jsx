import { useState } from 'react'
import { ChevronDown, ChevronUp, FileSpreadsheet, FileText, Calendar, DollarSign } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import EmptyState from '../../components/EmptyState'
import PresupuestoBar from '../../components/PresupuestoBar'
import { gastadoDeViaje } from '../../utils/presupuesto'
import toast from 'react-hot-toast'
import { formatDate, formatDateRange } from '../../utils/date'
import { exportExcel, exportPDF, todayStamp } from '../../utils/export'

const estadoBadge = {
  Aprobado: 'text-green-800 bg-green-100',
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
  const { user } = useAuth()
  const misViajes = viajes.filter(v => v.usuario_id === user?.id)
  const [abiertos, setAbiertos] = useState({})

  function toggle(id) {
    setAbiertos(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (misViajes.length === 0) return <EmptyState message="No tienes viajes registrados" />

  const filas = misViajes.flatMap(v => gastosDeViaje(v.id).map(g => ({ ...g, viajeNombre: v.nombre })))

  function descargarExcel() {
    if (filas.length === 0) return toast.error('No hay gastos para exportar')
    exportExcel(`historial-gastos-${todayStamp()}.xlsx`, [{
      name: 'Historial',
      rows: filas.map(g => ({
        Viaje: g.viajeNombre,
        Fecha: formatDate(g.fecha),
        Descripción: g.descripcion,
        Categoría: g.categoria,
        Monto: g.monto,
        Estado: g.estado,
      })),
    }])
    toast.success('Excel descargado')
  }

  function descargarPDF() {
    if (filas.length === 0) return toast.error('No hay gastos para exportar')
    exportPDF({
      filename: `historial-gastos-${todayStamp()}.pdf`,
      title: 'Historial de Gastos',
      subtitle: `${user?.nombre ?? ''} · generado el ${new Date().toLocaleDateString('es-MX')}`,
      sections: [{
        columns: [
          { header: 'Viaje', key: 'viaje' },
          { header: 'Fecha', key: 'fecha' },
          { header: 'Descripción', key: 'descripcion' },
          { header: 'Categoría', key: 'categoria' },
          { header: 'Monto', key: 'monto' },
          { header: 'Estado', key: 'estado' },
        ],
        rows: filas.map(g => ({
          viaje: g.viajeNombre,
          fecha: formatDate(g.fecha),
          descripcion: g.descripcion,
          categoria: g.categoria,
          monto: `$${g.monto.toFixed(2)}`,
          estado: g.estado,
        })),
      }],
    })
    toast.success('PDF descargado')
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-start justify-between mb-6 gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Historial de Gastos</h1>
          <p className="text-base text-gray-700 mt-0.5">Consulta tus gastos anteriores agrupados por viaje. Da clic en un viaje para ver el detalle de cada gasto.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={descargarExcel} aria-label="Descargar Excel" className="min-h-11 py-2 flex items-center gap-1.5 border border-gray-300 text-gray-600 text-base px-3 rounded-xl hover:bg-gray-50">
            <FileSpreadsheet size={16} /><span className="hidden sm:inline">Excel</span>
          </button>
          <button onClick={descargarPDF} aria-label="Descargar PDF" className="min-h-11 py-2 flex items-center gap-1.5 border border-gray-300 text-gray-600 text-base px-3 rounded-xl hover:bg-gray-50">
            <FileText size={16} /><span className="hidden sm:inline">PDF</span>
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
            <div key={v.id} className="bg-white rounded-xl border border-black shadow-sm overflow-hidden">
              {/* Cabecera del viaje */}
              <button
                onClick={() => toggle(v.id)}
                className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-base font-semibold text-gray-800">{v.nombre}</p>
                    <span className={`text-base px-2 py-0.5 rounded-full font-medium ${v.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {v.estado}
                    </span>
                    {pendientes > 0 && (
                      <span className="text-base px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                        {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-base text-gray-600 mb-2">
                    <span className="flex items-center gap-1"><Calendar size={16} />{formatDateRange(v.fecha_inicio, v.fecha_fin)}</span>
                    <span className="flex items-center gap-1"><DollarSign size={16} />Total: ${total.toFixed(2)}</span>
                    <span>{gastos.length} gasto{gastos.length !== 1 ? 's' : ''}</span>
                  </div>
                  {v.presupuesto > 0 && (
                    <div className="max-w-xs">
                      <PresupuestoBar gastado={gastadoDeViaje(gastos)} presupuesto={v.presupuesto} />
                    </div>
                  )}
                </div>
                <span className="text-gray-600 flex-shrink-0">
                  {abierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>

              {/* Gastos del viaje */}
              {abierto && (
                <div className="border-t">
                  {gastos.length === 0 ? (
                    <p className="text-base text-gray-600 text-center py-6">No hay gastos en este viaje</p>
                  ) : (
                    <>
                      {/* Tabla desktop */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-base">
                          <thead>
                            <tr className="text-left text-base text-gray-600 bg-gray-50 border-b">
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
                                <td className="px-5 py-2.5 text-gray-700 whitespace-nowrap">{formatDate(g.fecha)}</td>
                                <td className="px-5 py-2.5 text-gray-700">{g.descripcion}</td>
                                <td className="px-5 py-2.5 text-gray-700">{g.categoria}</td>
                                <td className="px-5 py-2.5 font-medium text-gray-800">${g.monto.toFixed(2)}</td>
                                <td className="px-5 py-2.5">
                                  <span className={`px-2 py-0.5 rounded-full text-base font-medium ${estadoBadge[g.estado]}`}>{g.estado}</span>
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
                              <p className="text-base font-medium text-gray-800">{g.descripcion}</p>
                              <p className="text-base text-gray-600 mt-0.5">{g.categoria} · {formatDate(g.fecha)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className="text-base font-semibold text-gray-800">${g.monto.toFixed(2)}</span>
                              <span className={`px-2 py-0.5 rounded-full text-base font-medium ${estadoBadge[g.estado]}`}>{g.estado}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Resumen pie */}
                      <div className="px-5 py-3 bg-gray-50 border-t flex justify-end text-base text-gray-700 gap-4">
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
