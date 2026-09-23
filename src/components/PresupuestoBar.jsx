import { pctPresupuesto } from '../utils/presupuesto'

// variant "dark": para fondos oscuros (banner degradado del dashboard).
// variant "light": para tarjetas blancas (Viajes admin, Historial operador).
export default function PresupuestoBar({ gastado, presupuesto, variant = 'light' }) {
  if (!presupuesto) return null
  const pct = pctPresupuesto(gastado, presupuesto)
  const nivel = pct >= 90 ? 'critico' : pct >= 70 ? 'alerta' : 'ok'

  const track = variant === 'dark' ? 'bg-white/20' : 'bg-gray-100'
  const barra = { critico: 'bg-red-400', alerta: 'bg-yellow-400', ok: variant === 'dark' ? 'bg-green-400' : 'bg-blue-500' }[nivel]
  const labelText = variant === 'dark' ? 'text-blue-200' : 'text-gray-600'
  const valueText = variant === 'dark' ? 'text-white' : 'text-gray-800'
  const pctText = nivel === 'critico' ? (variant === 'dark' ? 'text-red-300' : 'text-red-600') : labelText

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className={labelText}>Presupuesto utilizado</span>
        <span className={`font-bold ${valueText}`}>${gastado.toLocaleString()} / ${presupuesto.toLocaleString()}</span>
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${track}`}>
        <div className={`h-full rounded-full transition-all ${barra}`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`text-sm mt-1 font-semibold ${pctText}`}>{pct}% utilizado{nivel === 'critico' ? ' · cerca del límite' : ''}</p>
    </div>
  )
}
