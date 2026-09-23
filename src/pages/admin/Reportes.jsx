import { useEffect, useState, useCallback } from 'react'
import { Download } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import * as reportesApi from '../../api/reportes'
import { formatDate } from '../../utils/date'
import { exportExcel, exportPDF, todayStamp } from '../../utils/export'

const pieColors = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#6b7280', '#ec4899']

const totalesVacios = {
  cantidad_gastos: 0, monto_total: 0,
  monto_aprobado: 0, monto_rechazado: 0, monto_pendiente: 0,
}

export default function Reportes() {
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [totales, setTotales] = useState(totalesVacios)
  const [pieData, setPieData] = useState([])
  const [barData, setBarData] = useState([])
  const [empleadoData, setEmpleadoData] = useState([])
  const [cargando, setCargando] = useState(false)
  const [descargando, setDescargando] = useState(false)

  const generarReporte = useCallback(async () => {
    setCargando(true)
    const params = { fecha_desde: desde || undefined, fecha_hasta: hasta || undefined }
    try {
      const [t, porCat, porEmp] = await Promise.all([
        reportesApi.totales(params),
        reportesApi.porCategoria(params),
        reportesApi.porEmpleado(params),
      ])
      setTotales(t)
      setPieData(porCat.map(c => ({ name: c.categoria, value: Number(c.monto_total) })))
      setBarData(porEmp.slice(0, 5).map(e => ({ nombre: e.empleado, monto: Number(e.monto_total) })))
      setEmpleadoData(porEmp.map(e => ({ empleado: e.empleado, cantidad: Number(e.cantidad), monto_total: Number(e.monto_total) })))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCargando(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta])

  useEffect(() => { generarReporte() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function descargarExcel() {
    setDescargando(true)
    try {
      const params = { fecha_desde: desde || undefined, fecha_hasta: hasta || undefined }
      const detalle = await reportesApi.general(params)
      exportExcel(`reporte-gastos-${todayStamp()}.xlsx`, [
        {
          name: 'Resumen',
          rows: [{
            'Total de gastos': totales.cantidad_gastos,
            'Monto total': Number(totales.monto_total),
            'Monto aprobado': Number(totales.monto_aprobado),
            'Monto rechazado': Number(totales.monto_rechazado),
            'Monto pendiente': Number(totales.monto_pendiente),
          }],
        },
        { name: 'Por categoría', rows: pieData.map(c => ({ Categoría: c.name, Monto: c.value })) },
        { name: 'Por empleado', rows: empleadoData.map(e => ({ Empleado: e.empleado, Gastos: e.cantidad, 'Monto total': e.monto_total })) },
        {
          name: 'Detalle',
          rows: detalle.map(g => ({ Fecha: formatDate(g.fecha), Empleado: g.empleado, Categoría: g.categoria, Monto: Number(g.monto), Estado: g.estado })),
        },
      ])
      toast.success('Excel descargado')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDescargando(false)
    }
  }

  async function descargarPDF() {
    setDescargando(true)
    try {
      const params = { fecha_desde: desde || undefined, fecha_hasta: hasta || undefined }
      const detalle = await reportesApi.general(params)
      const rango = desde || hasta ? `Período: ${desde ? formatDate(desde) : '—'} a ${hasta ? formatDate(hasta) : '—'}` : 'Período: todos los registros'
      exportPDF({
        filename: `reporte-gastos-${todayStamp()}.pdf`,
        title: 'Reporte de Gastos',
        subtitle: `${rango} · generado el ${new Date().toLocaleDateString('es-MX')}`,
        sections: [
          {
            heading: 'Resumen',
            columns: [
              { header: 'Total gastos', key: 'cantidad' },
              { header: 'Monto total', key: 'total' },
              { header: 'Aprobado', key: 'aprobado' },
              { header: 'Rechazado', key: 'rechazado' },
              { header: 'Pendiente', key: 'pendiente' },
            ],
            rows: [{
              cantidad: totales.cantidad_gastos,
              total: `$${Number(totales.monto_total).toFixed(2)}`,
              aprobado: `$${Number(totales.monto_aprobado).toFixed(2)}`,
              rechazado: `$${Number(totales.monto_rechazado).toFixed(2)}`,
              pendiente: `$${Number(totales.monto_pendiente).toFixed(2)}`,
            }],
          },
          {
            heading: 'Por categoría',
            columns: [{ header: 'Categoría', key: 'categoria' }, { header: 'Monto', key: 'monto' }],
            rows: pieData.map(c => ({ categoria: c.name, monto: `$${c.value.toFixed(2)}` })),
          },
          {
            heading: 'Por empleado',
            columns: [{ header: 'Empleado', key: 'empleado' }, { header: 'Gastos', key: 'cantidad' }, { header: 'Monto total', key: 'monto' }],
            rows: empleadoData.map(e => ({ empleado: e.empleado, cantidad: e.cantidad, monto: `$${e.monto_total.toFixed(2)}` })),
          },
          {
            heading: 'Detalle de gastos',
            columns: [
              { header: 'Fecha', key: 'fecha' },
              { header: 'Empleado', key: 'empleado' },
              { header: 'Categoría', key: 'categoria' },
              { header: 'Monto', key: 'monto' },
              { header: 'Estado', key: 'estado' },
            ],
            rows: detalle.map(g => ({ fecha: formatDate(g.fecha), empleado: g.empleado, categoria: g.categoria, monto: `$${Number(g.monto).toFixed(2)}`, estado: g.estado })),
          },
        ],
      })
      toast.success('PDF descargado')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl font-bold text-gray-800">Reportes</h1>
      <p className="text-sm text-gray-700 mb-6 mt-0.5">Analiza los gastos de tu equipo por categoría y empleado en el periodo que elijas, y descárgalo en Excel o PDF.</p>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-black shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Desde</label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Hasta</label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-sm" />
          </div>
          <button
            onClick={generarReporte}
            disabled={cargando}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {cargando ? 'Generando...' : 'Generar reporte'}
          </button>
        </div>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
        {[
          { label: 'Total de Gastos', value: `$${Number(totales.monto_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'text-gray-800' },
          { label: 'Total Aprobado', value: `$${Number(totales.monto_aprobado).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'text-green-600' },
          { label: 'Total Rechazado', value: `$${Number(totales.monto_rechazado).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'text-red-600' },
          { label: 'Total Pendiente', value: `$${Number(totales.monto_pendiente).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'text-yellow-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-black shadow-sm p-3 sm:p-4">
            <p className="text-sm text-gray-700 mb-1">{label}</p>
            <p className={`text-lg sm:text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-black shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Gastos por categoría</h2>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 text-sm">
                {pieData.map(({ name, value }, i) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                    <span className="text-gray-600">{name}</span>
                    <span className="text-gray-600 ml-auto">${value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 text-center py-8">Sin datos en este período</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-black shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Top 5 empleados</h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} layout="vertical" barSize={14}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                <Bar dataKey="monto" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-600 text-center py-8">Sin datos en este período</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={descargarExcel}
          disabled={descargando}
          className="flex items-center justify-center gap-2 border border-green-500 text-green-600 font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-green-50 disabled:opacity-50 transition-colors"
        >
          <Download size={16} /> Descargar Excel
        </button>
        <button
          onClick={descargarPDF}
          disabled={descargando}
          className="flex items-center justify-center gap-2 border border-blue-500 text-blue-600 font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-blue-50 disabled:opacity-50 transition-colors"
        >
          <Download size={16} /> Descargar PDF
        </button>
      </div>
    </div>
  )
}
