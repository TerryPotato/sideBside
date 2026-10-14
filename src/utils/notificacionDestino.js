// Las notificaciones no guardan el id del gasto o viaje del que hablan, solo
// el texto. Para llevar al usuario a lo que se le notifica se busca por los
// datos que el texto si trae: monto, descripcion, empleado o nombre del viaje.
// Si no hay coincidencia se abre la pantalla general de ese tipo de aviso.

function montoDe(texto) {
  const m = /\$([\d,]+(?:\.\d+)?)/.exec(texto ?? '')
  return m ? Number(m[1].replace(/,/g, '')) : null
}

// Entre varios gastos iguales, el creado mas cerca (antes) del aviso.
function masCercano(candidatos, fechaAviso) {
  const aviso = new Date(fechaAviso).getTime()
  return [...candidatos].sort((a, b) => {
    const da = aviso - new Date(a.fecha_creacion ?? 0).getTime()
    const db = aviso - new Date(b.fecha_creacion ?? 0).getTime()
    // Primero los creados antes del aviso, y de esos el mas reciente.
    if ((da >= 0) !== (db >= 0)) return da >= 0 ? -1 : 1
    return Math.abs(da) - Math.abs(db)
  })[0]
}

export function destinoNotificacion(n, { rol, gastos, viajes }) {
  const base = `/${rol}`

  if (rol === 'admin') {
    if (n.tipo !== 'pendiente') return null
    const empleado = (n.titulo ?? '').replace(/^Nuevo gasto de\s+/, '').trim()
    const monto = montoDe(n.detalle)
    const candidatos = gastos.filter(g =>
      g.empleado === empleado && (monto === null || Math.abs(g.monto - monto) < 0.005))
    const gasto = masCercano(candidatos, n.fecha_creacion)
    return { ruta: `${base}/todos-gastos`, state: gasto ? { gastoId: gasto.id } : undefined }
  }

  if (n.tipo === 'aprobado' || n.tipo === 'rechazado') {
    const monto = montoDe(n.titulo)
    const estado = n.tipo === 'aprobado' ? 'Aprobado' : 'Rechazado'
    let candidatos = gastos.filter(g => monto === null || Math.abs(g.monto - monto) < 0.005)
    // Si el gasto se volvio a editar puede haber cambiado de estado; se
    // prefiere el que sigue en el estado del aviso.
    const mismoEstado = candidatos.filter(g => g.estado === estado)
    if (mismoEstado.length) candidatos = mismoEstado
    const mismaDescripcion = candidatos.filter(g => g.descripcion && g.descripcion === n.detalle)
    if (mismaDescripcion.length) candidatos = mismaDescripcion
    const gasto = masCercano(candidatos, n.fecha_creacion)
    return {
      ruta: `${base}/historial`,
      state: gasto ? { viajeId: gasto.viaje_id, gastoId: gasto.id } : undefined,
    }
  }

  if (n.tipo === 'viaje') {
    const nombre = (n.titulo ?? '').split(': ').slice(1).join(': ').trim()
    // "Viaje eliminado" ya no existe; los demas se buscan por nombre.
    const viaje = viajes.filter(v => v.nombre === nombre).sort((a, b) => b.id - a.id)[0]
    if (!viaje) return /eliminado/i.test(n.titulo) ? null : { ruta: `${base}/historial` }
    return { ruta: `${base}/historial`, state: { viajeId: viaje.id } }
  }

  return null
}
