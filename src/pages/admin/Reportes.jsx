import { Download } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

const pieData = [
  { name: 'Combustible', value: 40, monto: '$21,848.00', color: '#3b82f6' },
  { name: 'Comida', value: 25, monto: '$13,655.00', color: '#22c55e' },
  { name: 'Peaje', value: 15, monto: '$8,193.00', color: '#f59e0b' },
  { name: 'Mantenimiento', value: 10, monto: '$5,462.00', color: '#a855f7' },
  { name: 'Otros', value: 10, monto: '$5,462.00', color: '#6b7280' },
]

const barData = [
  { nombre: 'C. López', monto: 12850 },
  { nombre: 'M. García', monto: 9450 },
  { nombre: 'J. Pérez', monto: 8220 },
  { nombre: 'A. Martínez', monto: 7800 },
  { nombre: 'L. Hernández', monto: 6240 },
]

export default function Reportes() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Reportes</h1>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Período</label>
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
              <option>Este mes</option>
              <option>Último mes</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input type="date" className="border border-gray-300 rounded px-2 py-1.5 text-sm" defaultValue="2024-01-05" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input type="date" className="border border-gray-300 rounded px-2 py-1.5 text-sm" defaultValue="2024-05-16" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Agrupar por</label>
            <select className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white">
              <option>Categoría</option>
              <option>Empleado</option>
            </select>
          </div>
          <button
            onClick={() => toast.success('Reporte generado')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Generar reporte
          </button>
        </div>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
        {[
          { label: 'Total de Gastos', value: '$54,620.00', color: 'text-gray-800' },
          { label: 'Total Aprobado', value: '$45,230.00', color: 'text-green-600' },
          { label: 'Total Rechazado', value: '$2,850.00', color: 'text-red-600' },
          { label: 'Total Pendiente', value: '$6,540.00', color: 'text-yellow-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-lg sm:text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Gastos por categoría</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 text-xs">
              {pieData.map(({ name, value, monto, color }) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-gray-600">{name} {value}%</span>
                  <span className="text-gray-400 ml-auto">{monto}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Top 5 empleados</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} layout="vertical" barSize={14}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
              <Bar dataKey="monto" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => toast.success('Descargando Excel...')}
          className="flex items-center justify-center gap-2 border border-green-500 text-green-600 font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-green-50 transition-colors"
        >
          <Download size={16} /> Descargar Excel
        </button>
        <button
          onClick={() => toast.success('Descargando PDF...')}
          className="flex items-center justify-center gap-2 border border-red-500 text-red-600 font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-red-50 transition-colors"
        >
          <Download size={16} /> Descargar PDF
        </button>
      </div>
    </div>
  )
}
