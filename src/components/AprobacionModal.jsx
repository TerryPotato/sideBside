import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Check, XCircle, ImageOff, MapPin, Calendar, Tag, DollarSign, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { useData } from '../context/DataContext'
import IconButton from './IconButton'
import ComprobanteImage from './ComprobanteImage'
import ConfirmModal from './ConfirmModal'
import { getFacturaBlobUrl, getFacturaXmlBlobUrl } from '../api/client'
import { formatDate } from '../utils/date'

// Motivos mas comunes al rechazar un gasto: un clic los pone en el
// comentario (sigue siendo editable/ampliable a mano despues).
const MOTIVOS_RECHAZO = [
  'Comprobante ilegible',
  'Monto no coincide con el comprobante',
  'Gasto fuera de politica',
  'Falta el comprobante',
  'Categoria incorrecta',
  'Gasto duplicado',
]

export default function AprobacionModal({ viaje, onClose, initialIdx = 0 }) {
  const { gastosDeViaje, aprobarGasto, rechazarGasto } = useData()
  const pendientes = gastosDeViaje(viaje.id).filter(g => g.estado === 'Pendiente')

  const [idx, setIdx] = useState(Math.min(initialIdx, Math.max(0, pendientes.length - 1)))
  const [comentario, setComentario] = useState('')
  const [rechazando, setRechazando] = useState(false)
  const [confirmandoAprobar, setConfirmandoAprobar] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const gasto = pendientes[idx]
  const total = pendientes.length

  if (total === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 z-10 text-center">
          <Check size={40} className="text-green-500 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">No hay gastos pendientes en este viaje</p>
          <button onClick={onClose} className="mt-4 text-sm text-blue-500 hover:underline">Cerrar</button>
        </div>
      </div>
    )
  }

  async function handleAprobar() {
    setConfirmandoAprobar(false)
    setEnviando(true)
    try {
      await aprobarGasto(gasto.id)
      toast.success(`Gasto de $${gasto.monto} aprobado`)
      setComentario('')
      setRechazando(false)
      if (idx >= total - 1) onClose()
      else setIdx(i => Math.min(i, total - 2))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setEnviando(false)
    }
  }

  async function handleRechazar() {
    if (!comentario.trim()) {
      toast.error('Escribe el motivo del rechazo')
      return
    }
    setEnviando(true)
    try {
      await rechazarGasto(gasto.id, comentario)
      toast.success('Gasto rechazado')
      setComentario('')
      setRechazando(false)
      if (idx >= total - 1) onClose()
      else setIdx(i => Math.min(i, total - 2))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <ConfirmModal
        open={confirmandoAprobar}
        title="¿Aprobar este gasto?"
        message={`Se aprobará el gasto de $${gasto.monto?.toFixed(2)} y el empleado recibirá una notificación. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, aprobar"
        confirmClass="bg-green-600 hover:bg-green-700"
        onConfirm={handleAprobar}
        onCancel={() => setConfirmandoAprobar(false)}
      />

      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden" style={{ maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-[#1a2456]">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">{viaje.nombre}</h2>
            <span className="bg-yellow-400 text-yellow-900 text-sm font-bold px-2 py-0.5 rounded-full flex-shrink-0">
              {total} pendiente{total !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-blue-200 text-sm">{idx + 1} / {total}</span>
            <IconButton icon={X} label="Cerrar" onClick={onClose} variant="ghostOnDark" size="sm" iconSize={20} />
          </div>
        </div>

        {/* Body split */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">

          {/* LEFT — comprobante */}
          <div className="sm:w-1/2 bg-gray-900 flex flex-col items-center justify-center p-4 min-h-48 sm:min-h-0 relative">
            {gasto.foto_url ? (
              <ComprobanteImage gastoId={gasto.id} className="max-h-full max-w-full object-contain rounded-lg" emptyLabel="No se pudo cargar el comprobante" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-700">
                <ImageOff size={40} className="opacity-40" />
                <p className="text-sm text-center opacity-60">Sin comprobante adjunto</p>
              </div>
            )}

            {/* Navegación */}
            {total > 1 && (
              <div className="absolute bottom-3 flex gap-2">
                <IconButton
                  icon={ChevronLeft} label="Recibo anterior" variant="onImage"
                  onClick={() => { setIdx(i => i - 1); setRechazando(false); setComentario('') }}
                  disabled={idx === 0}
                />
                <IconButton
                  icon={ChevronRight} label="Siguiente recibo" variant="onImage"
                  onClick={() => { setIdx(i => i + 1); setRechazando(false); setComentario('') }}
                  disabled={idx === total - 1}
                />
              </div>
            )}
          </div>

          {/* RIGHT — datos + acciones */}
          <div className="sm:w-1/2 flex flex-col overflow-y-auto">
            <div className="flex-1 p-5 space-y-4">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide mb-3">Datos del gasto</p>
                <DataRow icon={<DollarSign size={14} />} label="Monto" value={<span className="text-lg font-bold text-gray-900">${gasto.monto.toFixed(2)}</span>} />
                {gasto.iva > 0 && <DataRow icon={<DollarSign size={14} />} label="IVA" value={`$${gasto.iva.toFixed(2)}`} />}
                <DataRow icon={<Tag size={14} />} label="Categoría" value={gasto.categoria} />
                <DataRow icon={<Calendar size={14} />} label="Fecha" value={formatDate(gasto.fecha)} />
                {gasto.ubicacion && <DataRow icon={<MapPin size={14} />} label="Ubicación" value={gasto.ubicacion} />}
              </div>

              {(gasto.factura_url || gasto.factura_xml_url) && (
                <div className="flex flex-wrap gap-3">
                  {gasto.factura_url && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const url = await getFacturaBlobUrl(gasto.id)
                          window.open(url, '_blank', 'noopener')
                        } catch (err) {
                          toast.error(err.message)
                        }
                      }}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline w-fit"
                    >
                      <FileText size={14} /> Ver factura (PDF)
                    </button>
                  )}
                  {gasto.factura_xml_url && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const url = await getFacturaXmlBlobUrl(gasto.id)
                          window.open(url, '_blank', 'noopener')
                        } catch (err) {
                          toast.error(err.message)
                        }
                      }}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline w-fit"
                    >
                      <FileText size={14} /> Ver factura (XML)
                    </button>
                  )}
                </div>
              )}

              {gasto.descripcion && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Descripción</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{gasto.descripcion}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-1">Empleado</p>
                <p className="text-sm font-medium text-gray-800">{gasto.empleado}</p>
              </div>

              {/* Comentario rechazo */}
              {rechazando && (
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">Motivo del rechazo <span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {MOTIVOS_RECHAZO.map(motivo => (
                      <button
                        key={motivo}
                        type="button"
                        onClick={() => setComentario(c => c ? `${c}${c.endsWith('.') ? '' : '.'} ${motivo}` : motivo)}
                        className="text-sm bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 border border-red-200 px-2.5 py-1 rounded-full transition-colors"
                      >
                        {motivo}
                      </button>
                    ))}
                  </div>
                  <textarea
                    autoFocus
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    placeholder="Explica por qué se rechaza este gasto..."
                    rows={3}
                    className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="p-4 border-t bg-gray-50 flex flex-col gap-2">
              {!rechazando ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmandoAprobar(true)}
                    disabled={enviando}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                  >
                    <Check size={16} /> Aprobar
                  </button>
                  <button
                    onClick={() => setRechazando(true)}
                    disabled={enviando}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                  >
                    <XCircle size={16} /> Rechazar
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setRechazando(false); setComentario('') }}
                    disabled={enviando}
                    className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRechazar}
                    disabled={enviando}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                  >
                    <XCircle size={16} /> Confirmar rechazo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DataRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 mt-0.5 flex-shrink-0">{icon}</span>
      <span className="text-sm text-gray-600 w-20 flex-shrink-0 mt-0.5">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  )
}
