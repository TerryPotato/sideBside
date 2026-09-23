import { useState } from 'react'
import { useData } from '../../context/DataContext'
import AprobacionModal from '../../components/AprobacionModal'
import EmptyState from '../../components/EmptyState'
import { Calendar, User, DollarSign } from 'lucide-react'

export default function GastosPendientes() {
  const { viajes, gastosDeViaje } = useData()
  const [viajeModal, setViajeModal] = useState(null)

  const viajesConPendientes = viajes.filter(v => gastosDeViaje(v.id).some(g => g.estado === 'Pendiente'))

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-2">Aprobación de Gastos</h1>
      <p className="text-base text-gray-700 mb-6">Viajes con gastos pendientes de revisión</p>

      {viajeModal && <AprobacionModal viaje={viajeModal} onClose={() => setViajeModal(null)} />}

      {viajesConPendientes.length === 0 ? (
        <EmptyState message="No hay viajes con gastos pendientes" />
      ) : (
        <div className="space-y-3">
          {viajesConPendientes.map(v => {
            const gastos = gastosDeViaje(v.id)
            const pendientes = gastos.filter(g => g.estado === 'Pendiente')
            const totalPendiente = pendientes.reduce((s, g) => s + g.monto, 0)

            return (
              <div key={v.id} className="bg-white rounded-xl border border-black shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-base font-semibold text-gray-800">{v.nombre}</h3>
                    <span className="text-base px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                      {pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-base text-gray-700">
                    <span className="flex items-center gap-1"><User size={16} />{v.usuario}</span>
                    <span className="flex items-center gap-1"><Calendar size={16} />{v.fecha_inicio} → {v.fecha_fin}</span>
                    <span className="flex items-center gap-1"><DollarSign size={16} />Total pendiente: ${totalPendiente.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setViajeModal(v)}
                  className="min-h-11 py-2 flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium px-5 rounded-xl transition-colors"
                >
                  Revisar gastos
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
