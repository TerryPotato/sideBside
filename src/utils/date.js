export function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateRange(start, end) {
  return `${formatDate(start)} → ${formatDate(end)}`
}

// gastos.fecha es DATE puro (sin hora), asi que no aplica zona horaria: el
// dia es el mismo la mires desde donde la mires. Lo que si trae hora real
// (fecha_creacion de un gasto, una notificacion, un borrador) debe
// mostrarse en la zona horaria que el usuario eligio en su perfil, no
// siempre la del navegador/servidor.
export function formatDateTime(isoStr, zonaHoraria) {
  if (!isoStr) return ''
  try {
    return new Date(isoStr).toLocaleString('es-MX', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      timeZone: zonaHoraria || undefined,
    })
  } catch {
    // Zona horaria invalida/desconocida: cae al comportamiento anterior.
    return new Date(isoStr).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }
}
