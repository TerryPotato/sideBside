import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmModal from '../../components/ConfirmModal'

export default function DetalleGasto() {
  const navigate = useNavigate()
  const [comentario, setComentario] = useState('')
  const [modal, setModal] = useState({ open: false, tipo: null })

  function confirmar() {
    const tipo = modal.tipo
    setModal({ open: false, tipo: null })
    if (tipo === 'aprobar') {
      toast.success('Gasto aprobado correctamente')
    } else {
      if (!comentario.trim()) {
        toast.error('Escribe un motivo de rechazo')
        return
      }
      toast.error('Gasto rechazado')
    }
    navigate('/admin/gastos-pendientes')
  }

  return (
    <div className="p-4 sm:p-6">
      <Link to="/admin/gastos-pendientes" className="flex items-center gap-1 text-blue-600 hover:underline text-base mb-4">
        <ArrowLeft size={16} /> Volver
      </Link>

      <h1 className="text-xl font-bold text-gray-800 mb-6">Detalle del Gasto</h1>

      <ConfirmModal
        open={modal.open}
        title={modal.tipo === 'aprobar' ? '¿Aprobar este gasto?' : '¿Rechazar este gasto?'}
        message={modal.tipo === 'aprobar'
          ? 'El empleado recibirá una notificación de aprobación.'
          : 'El empleado recibirá el motivo de rechazo indicado.'}
        confirmLabel={modal.tipo === 'aprobar' ? 'Sí, aprobar' : 'Sí, rechazar'}
        confirmClass={modal.tipo === 'aprobar' ? 'bg-green-700 hover:bg-green-800' : 'bg-red-600 hover:bg-red-700'}
        onConfirm={confirmar}
        onCancel={() => setModal({ open: false, tipo: null })}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-4">
          <Row label="Empleado" value="Carlos López" />
          <Row label="Categoría" value="Combustible" />
          <Row label="Descripción" value="Gasolina para visita a cliente" />
          <Row label="Monto" value="$800.00" bold />
          <Row label="Fecha" value="13/05/2024  09:15 a.m." />
          <div>
            <p className="text-base text-gray-600 mb-0.5">Ubicación</p>
            <div className="flex items-center gap-1 text-base text-gray-700">
              <MapPin size={16} className="text-gray-600" /> Querétaro, Qro.
            </div>
          </div>
          <div>
            <p className="text-base text-gray-600 mb-0.5">Estado</p>
            <span className="px-2 py-0.5 rounded-full text-base font-medium text-yellow-700 bg-yellow-50">Pendiente</span>
          </div>

          <div>
            <p className="text-base text-gray-600 mb-1">Comentario al rechazar</p>
            <textarea
              placeholder="Escribe el motivo del rechazo..."
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              rows={3}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setModal({ open: true, tipo: 'aprobar' })}
              className="min-h-11 py-2 flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-medium rounded-xl text-base transition-colors"
            >
              <Check size={16} /> Aprobar gasto
            </button>
            <button
              onClick={() => setModal({ open: true, tipo: 'rechazar' })}
              className="min-h-11 py-2 flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-base transition-colors"
            >
              <X size={16} /> Rechazar gasto
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Comprobante</h2>
          <div className="bg-gray-100 rounded-lg h-52 sm:h-64 flex items-center justify-center text-gray-600 text-base">
            Vista previa del comprobante
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div>
      <p className="text-base text-gray-600 mb-0.5">{label}</p>
      <p className={`text-base ${bold ? 'font-bold text-gray-800' : 'text-gray-700'}`}>{value}</p>
    </div>
  )
}
