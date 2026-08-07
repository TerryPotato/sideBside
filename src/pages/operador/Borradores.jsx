import { useState } from 'react'
import { Trash2, Send, BookMarked, AlertCircle } from 'lucide-react'
import { useData } from '../../context/DataContext'
import toast from 'react-hot-toast'
import ConfirmModal from '../../components/ConfirmModal'
import EmptyState from '../../components/EmptyState'

export default function Borradores() {
  const { borradores, eliminarBorrador } = useData()
  const [confirmId, setConfirmId] = useState(null)

  function handleEliminar() {
    eliminarBorrador(confirmId)
    setConfirmId(null)
    toast('Borrador eliminado', { icon: '🗑️' })
  }

  function formatFecha(iso) {
    const d = new Date(iso)
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <BookMarked size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Borradores</h1>
          <p className="text-sm text-gray-500">{borradores.length} borrador{borradores.length !== 1 ? 'es' : ''} guardado{borradores.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmId}
        title="¿Eliminar borrador?"
        message="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        confirmClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleEliminar}
        onCancel={() => setConfirmId(null)}
      />

      {borradores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center gap-3">
          <BookMarked size={40} className="text-gray-300" />
          <p className="text-base font-semibold text-gray-700">No tienes borradores guardados</p>
          <p className="text-sm text-gray-400">Cuando guardes un gasto como borrador aparecerá aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {borradores.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {b.monto && b.moneda && (
                      <span className="text-lg font-bold text-gray-900">{b.moneda} ${Number(b.monto).toFixed(2)}</span>
                    )}
                    {b.categoria && (
                      <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">{b.categoria}</span>
                    )}
                  </div>
                  {b.descripcion && <p className="text-sm text-gray-600 mb-1">{b.descripcion}</p>}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
                    {b.fecha && <span>📅 {b.fecha}</span>}
                    {b.ubicacion && <span>📍 {b.ubicacion}</span>}
                    <span>💾 Guardado: {formatFecha(b.guardado_en)}</span>
                  </div>
                  {(!b.recibo && !b.factura) && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg w-fit">
                      <AlertCircle size={12} /> Sin documentos adjuntos
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => toast('Próximamente: continuar desde borrador', { icon: '🚧' })}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                >
                  <Send size={15} /> Continuar y enviar
                </button>
                <button
                  onClick={() => setConfirmId(b.id)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-500 border-2 border-red-100 transition-colors flex-shrink-0"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
