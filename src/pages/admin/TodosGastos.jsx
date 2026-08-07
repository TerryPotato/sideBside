import { useState, useMemo } from 'react'
import { Eye, Download, ChevronLeft, ChevronRight, X, MapPin, Calendar, Tag, DollarSign, ImageOff, ClipboardCheck } from 'lucide-react'
import EmptyState from '../../components/EmptyState'
import AprobacionModal from '../../components/AprobacionModal'
import toast from 'react-hot-toast'
import { useData } from '../../context/DataContext'

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

const POR_PAGINA = 8

function DetalleModal({ gasto, viaje, onClose }) {
  const estadoBadge = {
    Aprobado: 'text-green-600 bg-green-50',
    Pendiente: 'text-yellow-600 bg-yellow-50',
    Rechazado: 'text-red-600 bg-red-50',
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-800">Detalle del gasto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {/* Comprobante */}
        <div className="bg-gray-900 flex items-center justify-center h-48">
          {gasto.preview ? (
            <img src={gasto.preview} alt="comprobante" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <ImageOff size={32} className="opacity-40" />
              <p className="text-xs opacity-50">Sin comprobante</p>
            </div>
          )}
        </div>

        {/* Datos */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">${gasto.monto?.toFixed(2)}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[gasto.estado]}`}>{gasto.estado}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Row icon={<Tag size={13} />} label="Categoría" value={gasto.categoria} />
            <Row icon={<Calendar size={13} />} label="Fecha" value={gasto.fecha} />
            <Row icon={<DollarSign size={13} />} label="Empleado" value={gasto.empleado} />
            {gasto.ubicacion && <Row icon={<MapPin size={13} />} label="Ubicación" value={gasto.ubicacion} />}
          </div>

          {gasto.descripcion && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Descripción</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{gasto.descripcion}</p>
            </div>
          )}

          {viaje && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Viaje</p>
              <p className="text-sm text-gray-700">{viaje.nombre}</p>
            </div>
          )}

          {gasto.comentario && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Motivo de rechazo</p>
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{gasto.comentario}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-gray-400 mb-0.5">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm text-gray-700 font-medium">{value}</p>
    </div>
  )
}

export default function TodosGastos() {
  const { gastos, viajes, gastosDeViaje } = useData()
  const [gastoDetalle, setGastoDetalle] = useState(null)
  const [aprobacion, setAprobacion] = useState(null) // { viaje, initialIdx }

  function abrirAprobacion(gasto) {
    const viaje = viajes.find(v => v.id === gasto.viaje_id)
    if (!viaje) return
    const pendientes = gastosDeViaje(viaje.id).filter(g => g.estado === 'Pendiente')
    const initialIdx = pendientes.findIndex(g => g.id === gasto.id)
    setAprobacion({ viaje, initialIdx: Math.max(0, initialIdx) })
  }

  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [categoria, setCategoria] = useState('Todas')
  const [estado, setEstado] = useState('Todos')
  const [pagina, setPagina] = useState(1)

  const filtrados = useMemo(() => gastos.filter(g => {
    if (desde && g.fecha < desde) return false
    if (hasta && g.fecha > hasta) return false
    if (categoria !== 'Todas' && g.categoria !== categoria) return false
    if (estado !== 'Todos' && g.estado !== estado) return false
    return true
  }), [gastos, desde, hasta, categoria, estado])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const pagActual = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  function cambiarPagina(n) {
    if (n < 1 || n > totalPaginas) return
    setPagina(n)
  }

  function nombreViaje(viaje_id) {
    return viajes.find(v => v.id === viaje_id)?.nombre ?? '—'
  }

  return (
    <div className="p-4 sm:p-6">
      {gastoDetalle && (
        <DetalleModal
          gasto={gastoDetalle}
          viaje={viajes.find(v => v.id === gastoDetalle.viaje_id)}
          onClose={() => setGastoDetalle(null)}
        />
      )}
      {aprobacion && (
        <AprobacionModal
          viaje={aprobacion.viaje}
          initialIdx={aprobacion.initialIdx}
          onClose={() => setAprobacion(null)}
        />
      )}
      <div className="flex items-center justify-between mb-6 gap-2">
        <h1 className="text-xl font-bold text-gray-800">Todos los Gastos</h1>
        <div className="flex gap-2">
          <button onClick={() => toast.success('Descargando Excel...')} className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm px-3 py-2 rounded-lg hover:bg-gray-50">
            <Download size={14} /><span className="hidden sm:inline">Excel</span>
          </button>
          <button onClick={() => toast.success('Descargando PDF...')} className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm px-3 py-2 rounded-lg hover:bg-gray-50">
            <Download size={14} /><span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Fecha desde</label>
            <input type="date" value={desde} onChange={e => { setDesde(e.target.value); setPagina(1) }} className="border border-gray-300 rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Fecha hasta</label>
            <input type="date" value={hasta} onChange={e => { setHasta(e.target.value); setPagina(1) }} className="border border-gray-300 rounded px-2 py-1 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Categoría</label>
            <select value={categoria} onChange={e => { setCategoria(e.target.value); setPagina(1) }} className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
              <option>Todas</option>
              {['Comida','Combustible','Peaje','Mantenimiento','Hospedaje','Transporte','Otros'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Estado</label>
            <select value={estado} onChange={e => { setEstado(e.target.value); setPagina(1) }} className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
              <option>Todos</option>
              <option>Aprobado</option>
              <option>Pendiente</option>
              <option>Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        {filtrados.length === 0 ? (
          <EmptyState message="No hay gastos con esos filtros" />
        ) : (
          <>
            {/* Tabla desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b">
                    <th className="pb-2 font-medium">Empleado</th>
                    <th className="pb-2 font-medium">Viaje</th>
                    <th className="pb-2 font-medium">Categoría</th>
                    <th className="pb-2 font-medium">Descripción</th>
                    <th className="pb-2 font-medium">Fecha</th>
                    <th className="pb-2 font-medium">Monto</th>
                    <th className="pb-2 font-medium">Estado</th>
                    <th className="pb-2 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagActual.map((g) => (
                    <tr key={g.id} className={`border-b last:border-0 transition-colors ${estadoFila[g.estado]}`}>
                      <td className="py-2.5 text-gray-700 whitespace-nowrap">{g.empleado}</td>
                      <td className="py-2.5 text-gray-500 max-w-[140px] truncate">{nombreViaje(g.viaje_id)}</td>
                      <td className="py-2.5 text-gray-500">{g.categoria}</td>
                      <td className="py-2.5 text-gray-700">{g.descripcion}</td>
                      <td className="py-2.5 text-gray-500 whitespace-nowrap">{g.fecha}</td>
                      <td className="py-2.5 font-medium text-gray-800 whitespace-nowrap">${g.monto.toFixed(2)}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[g.estado]}`}>{g.estado}</span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setGastoDetalle(g)}
                            className="w-7 h-7 bg-green-100 hover:bg-green-200 text-green-600 rounded flex items-center justify-center transition-colors"
                            title="Ver detalle"
                          >
                            <Eye size={14} />
                          </button>
                          {g.estado === 'Pendiente' && (
                            <button
                              onClick={() => abrirAprobacion(g)}
                              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
                              title="Revisar gasto"
                            >
                              <ClipboardCheck size={13} /> Revisar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards mobile */}
            <div className="sm:hidden space-y-3">
              {pagActual.map((g) => (
                <div key={g.id} className={`rounded-xl p-3 border transition-colors ${g.estado === 'Aprobado' ? 'bg-green-50 border-green-200' : g.estado === 'Rechazado' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{g.empleado}</p>
                      <p className="text-xs text-gray-500">{g.descripcion} · {g.categoria}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[g.estado]}`}>{g.estado}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className="text-xs text-gray-400">{g.fecha} · ${g.monto.toFixed(2)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setGastoDetalle(g)}
                        className="w-7 h-7 bg-green-100 hover:bg-green-200 text-green-600 rounded flex items-center justify-center"
                      >
                        <Eye size={14} />
                      </button>
                      {g.estado === 'Pendiente' && (
                        <button
                          onClick={() => abrirAprobacion(g)}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2.5 py-1.5 rounded transition-colors"
                        >
                          <ClipboardCheck size={13} /> Revisar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-gray-400">{filtrados.length} resultados</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => cambiarPagina(pagina - 1)} disabled={pagina === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => cambiarPagina(n)} className={`w-7 h-7 rounded text-sm ${n === pagina ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{n}</button>
                  ))}
                  <button onClick={() => cambiarPagina(pagina + 1)} disabled={pagina === totalPaginas} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
