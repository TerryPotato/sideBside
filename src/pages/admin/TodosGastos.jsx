import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Eye, FileSpreadsheet, FileText, ChevronLeft, ChevronRight, X, MapPin, Calendar, Tag, DollarSign, ImageOff, ClipboardCheck, Search, Loader2 } from 'lucide-react'
import EmptyState from '../../components/EmptyState'
import AprobacionModal from '../../components/AprobacionModal'
import IconButton from '../../components/IconButton'
import ComprobanteImage from '../../components/ComprobanteImage'
import toast from 'react-hot-toast'
import { useData } from '../../context/DataContext'
import { formatDate } from '../../utils/date'
import { exportExcel, exportPDF, todayStamp } from '../../utils/export'
import * as gastosApi from '../../api/gastos'
import { getFacturaBlobUrl, getFacturaXmlBlobUrl } from '../../api/client'

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

const POR_PAGINA = 8

// El listado (useData/gastos) solo trae los campos basicos para pintar la
// tabla. Al abrir el detalle se pide el registro especifico al backend
// (incluye el motivo de rechazo, que vive en otra tabla y no tiene caso
// cargar para cada fila del listado general).
function DetalleModal({ gastoBasico, viaje, onClose }) {
  const [gasto, setGasto] = useState(gastoBasico)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let cancelado = false
    gastosApi.obtenerDetalle(gastoBasico.id)
      .then(detalle => { if (!cancelado) setGasto(g => ({ ...g, ...detalle })) })
      .catch(() => {})
      .finally(() => !cancelado && setCargando(false))
    return () => { cancelado = true }
  }, [gastoBasico.id])

  const estadoBadge = {
    Aprobado: 'text-green-700 bg-green-50',
    Pendiente: 'text-yellow-700 bg-yellow-50',
    Rechazado: 'text-red-600 bg-red-50',
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white border border-black rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-800">Detalle del gasto</h2>
          <IconButton icon={X} label="Cerrar" onClick={onClose} size="sm" iconSize={20} />
        </div>

        {/* Comprobante */}
        <div className="bg-gray-900 flex items-center justify-center h-48">
          {gasto.foto_url ? (
            <ComprobanteImage gastoId={gasto.id} />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-700">
              <ImageOff size={32} className="opacity-40" />
              <p className="text-base">Sin comprobante</p>
            </div>
          )}
        </div>

        {/* Datos */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">${gasto.monto?.toFixed(2)}</span>
            <span className={`px-2 py-0.5 rounded-full text-base font-medium ${estadoBadge[gasto.estado]}`}>{gasto.estado}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-base">
            {gasto.iva > 0 && <Row icon={<DollarSign size={16} />} label="IVA" value={`$${gasto.iva.toFixed(2)}`} />}
            <Row icon={<Tag size={16} />} label="Categoría" value={gasto.categoria} />
            <Row icon={<Calendar size={16} />} label="Fecha" value={formatDate(gasto.fecha)} />
            <Row icon={<DollarSign size={16} />} label="Empleado" value={gasto.empleado} />
            {gasto.ubicacion && <Row icon={<MapPin size={16} />} label="Ubicación" value={gasto.ubicacion} />}
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
                  className="flex items-center gap-2 text-base text-blue-600 hover:underline w-fit"
                >
                  <FileText size={16} /> Ver factura (PDF)
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
                  className="flex items-center gap-2 text-base text-blue-600 hover:underline w-fit"
                >
                  <FileText size={16} /> Ver factura (XML)
                </button>
              )}
            </div>
          )}

          {gasto.descripcion && (
            <div>
              <p className="text-base text-gray-600 mb-1">Descripción</p>
              <p className="text-base text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{gasto.descripcion}</p>
            </div>
          )}

          {viaje && (
            <div>
              <p className="text-base text-gray-600 mb-1">Viaje</p>
              <p className="text-base text-gray-700">{viaje.nombre}</p>
            </div>
          )}

          {cargando ? (
            <p className="flex items-center gap-2 text-base text-gray-700"><Loader2 size={16} className="animate-spin" /> Cargando detalle...</p>
          ) : gasto.comentario && (
            <div>
              <p className="text-base text-gray-600 mb-1">Motivo de rechazo</p>
              <p className="text-base text-red-600 bg-red-50 rounded-lg px-3 py-2">{gasto.comentario}</p>
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
      <div className="flex items-center gap-1 text-gray-600 mb-0.5">
        {icon}
        <span className="text-base">{label}</span>
      </div>
      <p className="text-base text-gray-700 font-medium">{value}</p>
    </div>
  )
}

export default function TodosGastos() {
  const { gastos, viajes, categorias, gastosDeViaje } = useData()
  const [gastoDetalle, setGastoDetalle] = useState(null)
  const [aprobacion, setAprobacion] = useState(null) // { viaje, initialIdx }

  function abrirAprobacion(gasto) {
    const viaje = viajes.find(v => v.id === gasto.viaje_id)
    if (!viaje) return
    const pendientes = gastosDeViaje(viaje.id).filter(g => g.estado === 'Pendiente')
    const initialIdx = pendientes.findIndex(g => g.id === gasto.id)
    setAprobacion({ viaje, initialIdx: Math.max(0, initialIdx) })
  }

  // Al llegar desde una notificacion se abre ese gasto: para revisarlo si
  // sigue pendiente, o su detalle si ya se aprobo o rechazo.
  const { state } = useLocation()
  const [avisoAbierto, setAvisoAbierto] = useState(null)
  useEffect(() => {
    if (!state?.gastoId || avisoAbierto === state) return
    const gasto = gastos.find(g => g.id === state.gastoId)
    if (!gasto) return
    setAvisoAbierto(state)
    if (gasto.estado === 'Pendiente') abrirAprobacion(gasto)
    else setGastoDetalle(gasto)
  }, [state, gastos])

  const [busqueda, setBusqueda] = useState('')
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
    const q = busqueda.trim().toLowerCase()
    if (q && !g.empleado.toLowerCase().includes(q) && !(g.descripcion ?? '').toLowerCase().includes(q)) return false
    return true
  }), [gastos, busqueda, desde, hasta, categoria, estado])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const pagActual = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  function cambiarPagina(n) {
    if (n < 1 || n > totalPaginas) return
    setPagina(n)
  }

  function nombreViaje(viaje_id) {
    return viajes.find(v => v.id === viaje_id)?.nombre ?? '—'
  }

  async function descargarExcel() {
    if (filtrados.length === 0) return toast.error('No hay gastos para exportar')
    await exportExcel(`gastos-${todayStamp()}.xlsx`, [{
      name: 'Gastos',
      rows: filtrados.map(g => ({
        Empleado: g.empleado,
        Viaje: nombreViaje(g.viaje_id),
        Categoría: g.categoria,
        Descripción: g.descripcion,
        Fecha: formatDate(g.fecha),
        Monto: g.monto,
        Estado: g.estado,
      })),
    }])
    toast.success('Excel descargado')
  }

  async function descargarPDF() {
    if (filtrados.length === 0) return toast.error('No hay gastos para exportar')
    await exportPDF({
      filename: `gastos-${todayStamp()}.pdf`,
      title: 'Todos los Gastos',
      subtitle: `generado el ${new Date().toLocaleDateString('es-MX')}`,
      sections: [{
        columns: [
          { header: 'Empleado', key: 'empleado' },
          { header: 'Viaje', key: 'viaje' },
          { header: 'Categoría', key: 'categoria' },
          { header: 'Descripción', key: 'descripcion' },
          { header: 'Fecha', key: 'fecha' },
          { header: 'Monto', key: 'monto' },
          { header: 'Estado', key: 'estado' },
        ],
        rows: filtrados.map(g => ({
          empleado: g.empleado,
          viaje: nombreViaje(g.viaje_id),
          categoria: g.categoria,
          descripcion: g.descripcion,
          fecha: formatDate(g.fecha),
          monto: `$${g.monto.toFixed(2)}`,
          estado: g.estado,
        })),
      }],
    })
    toast.success('PDF descargado')
  }

  return (
    <div className="p-4 sm:p-6">
      {gastoDetalle && (
        <DetalleModal
          gastoBasico={gastoDetalle}
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
      <div className="flex items-start justify-between mb-6 gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Todos los Gastos</h1>
          <p className="text-base text-gray-700 mt-0.5">Filtra y busca los gastos de todo tu equipo. Da clic en el ícono del ojo para ver el detalle completo de un gasto.</p>
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

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-black shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-base text-gray-600">Buscar</label>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700" />
              <input
                type="text"
                value={busqueda}
                onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
                placeholder="Empleado o descripción..."
                className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-base focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[9rem] sm:flex-none">
            <label className="text-base text-gray-700">Fecha desde</label>
            <input type="date" value={desde} onChange={e => { setDesde(e.target.value); setPagina(1) }} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[9rem] sm:flex-none">
            <label className="text-base text-gray-700">Fecha hasta</label>
            <input type="date" value={hasta} onChange={e => { setHasta(e.target.value); setPagina(1) }} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[9rem] sm:flex-none">
            <label className="text-base text-gray-700">Categoría</label>
            <select value={categoria} onChange={e => { setCategoria(e.target.value); setPagina(1) }} className="border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 bg-white w-full">
              <option>Todas</option>
              {categorias.map(c => <option key={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[9rem] sm:flex-none">
            <label className="text-base text-gray-700">Estado</label>
            <select value={estado} onChange={e => { setEstado(e.target.value); setPagina(1) }} className="border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 bg-white w-full">
              <option>Todos</option>
              <option>Aprobado</option>
              <option>Pendiente</option>
              <option>Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-black shadow-sm p-4">
        {filtrados.length === 0 ? (
          <EmptyState message="No hay gastos con esos filtros" />
        ) : (
          <>
            {/* Tabla desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="text-left text-base text-gray-600 border-b">
                    <th className="pb-2 pr-4 font-medium">Empleado</th>
                    <th className="pb-2 pr-4 font-medium">Viaje</th>
                    <th className="pb-2 pr-4 font-medium">Categoría</th>
                    <th className="pb-2 pr-4 font-medium">Descripción</th>
                    <th className="pb-2 pr-4 font-medium">Fecha</th>
                    <th className="pb-2 pr-4 font-medium">Monto</th>
                    <th className="pb-2 pr-4 font-medium">Estado</th>
                    <th className="pb-2 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagActual.map((g) => (
                    <tr key={g.id} className={`border-b last:border-0 transition-colors ${estadoFila[g.estado]}`}>
                      <td className="py-2.5 pr-4 text-gray-700 whitespace-nowrap">{g.empleado}</td>
                      <td className="py-2.5 pr-4 text-gray-700 max-w-[140px] truncate">{nombreViaje(g.viaje_id)}</td>
                      <td className="py-2.5 pr-4 text-gray-700">{g.categoria}</td>
                      <td className="py-2.5 pr-4 text-gray-700">{g.descripcion}</td>
                      <td className="py-2.5 pr-4 text-gray-700 whitespace-nowrap">{formatDate(g.fecha)}</td>
                      <td className="py-2.5 pr-4 font-medium text-gray-800 whitespace-nowrap">${g.monto.toFixed(2)}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-base font-medium ${estadoBadge[g.estado]}`}>{g.estado}</span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <IconButton icon={Eye} label="Ver detalle" onClick={() => setGastoDetalle(g)} variant="success" size="sm" iconSize={18} />
                          {g.estado === 'Pendiente' && (
                            <button
                              onClick={() => abrirAprobacion(g)}
                              className="min-h-11 py-2 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium px-2.5 rounded-xl transition-colors"
                              title="Revisar gasto"
                            >
                              <ClipboardCheck size={16} /> Revisar
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
                      <p className="text-base font-medium text-gray-800">{g.empleado}</p>
                      <p className="text-base text-gray-700">{g.descripcion} · {g.categoria}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-base font-medium ${estadoBadge[g.estado]}`}>{g.estado}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className="text-base text-gray-600">{formatDate(g.fecha)} · ${g.monto.toFixed(2)}</span>
                    <div className="flex gap-2">
                      <IconButton icon={Eye} label="Ver detalle" onClick={() => setGastoDetalle(g)} variant="success" iconSize={18} />
                      {g.estado === 'Pendiente' && (
                        <button
                          onClick={() => abrirAprobacion(g)}
                          className="min-h-11 py-2 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium px-2.5 rounded-xl transition-colors"
                        >
                          <ClipboardCheck size={16} /> Revisar
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
                <p className="text-base text-gray-600">{filtrados.length} resultados</p>
                <div className="flex items-center gap-1">
                  <IconButton icon={ChevronLeft} label="Página anterior" onClick={() => cambiarPagina(pagina - 1)} disabled={pagina === 1} size="sm" iconSize={16} />
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => cambiarPagina(n)} className={`w-11 h-11 inline-flex items-center justify-center rounded-xl text-base ${n === pagina ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{n}</button>
                  ))}
                  <IconButton icon={ChevronRight} label="Página siguiente" onClick={() => cambiarPagina(pagina + 1)} disabled={pagina === totalPaginas} size="sm" iconSize={16} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
