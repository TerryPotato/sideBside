import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Pencil, BookMarked, AlertCircle } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import ConfirmModal from '../../components/ConfirmModal'
import { formatDate, formatDateTime } from '../../utils/date'

export default function Borradores() {
  const { borradores, eliminarBorrador } = useData()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [confirmId, setConfirmId] = useState(null)

  async function handleEliminar() {
    try {
      await eliminarBorrador(confirmId)
      toast('Borrador eliminado', { icon: '🗑️' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setConfirmId(null)
    }
  }

  function formatFecha(iso) {
    return formatDateTime(iso, user?.zona_horaria)
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <BookMarked size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Borradores</h1>
          <p className="text-base text-gray-700">{borradores.length} borrador{borradores.length !== 1 ? 'es' : ''} guardado{borradores.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <p className="text-base text-gray-700 -mt-2 mb-5">Un borrador no se envía a revisión hasta que le das clic a "Continuar editando" y lo completas. También puedes eliminarlo si ya no lo necesitas.</p>

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
        <div className="bg-white rounded-2xl border border-black shadow-sm p-8 flex flex-col items-center text-center gap-3">
          <BookMarked size={40} className="text-gray-300" />
          <p className="text-base font-semibold text-gray-700">No tienes borradores guardados</p>
          <p className="text-base text-gray-600">Cuando guardes un gasto como borrador aparecerá aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {borradores.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-black shadow-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {b.monto && b.moneda && (
                      <span className="text-lg font-bold text-gray-900">{b.moneda} ${Number(b.monto).toFixed(2)}</span>
                    )}
                    {b.categoria && (
                      <span className="text-base bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">{b.categoria}</span>
                    )}
                  </div>
                  {b.descripcion && <p className="text-base text-gray-600 mb-1">{b.descripcion}</p>}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-base text-gray-600">
                    {b.fecha && <span>📅 {formatDate(b.fecha)}</span>}
                    {b.ubicacion && <span>📍 {b.ubicacion}</span>}
                    <span>💾 Guardado: {formatFecha(b.fecha_creacion)}</span>
                  </div>
                  {!b.foto_url && !b.factura_url && !b.factura_xml_url && (
                    <div className="flex items-center gap-1 mt-2 text-base text-yellow-700 bg-yellow-50 px-2 py-1 rounded-lg w-fit">
                      <AlertCircle size={16} /> Sin documentos adjuntos
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => navigate(`/operador/nuevo-gasto/${b.id}`)}
                  className="min-h-11 py-2 flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-base transition-colors"
                >
                  <Pencil size={18} /> Continuar editando
                </button>
                <button
                  onClick={() => setConfirmId(b.id)}
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 border-2 border-red-100 transition-colors flex-shrink-0"
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
