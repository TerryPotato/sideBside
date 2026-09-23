// Gastos que cuentan contra el presupuesto de un viaje: Aprobado (ya se
// pago, es gasto real) y Pendiente (todavia no se resuelve pero ya esta
// comprometido, sirve para no rebasar el presupuesto a mitad de revision).
// Rechazado no cuenta (nunca se pago) y Borrador tampoco (ni siquiera se ha
// enviado a revision).
export function gastadoDeViaje(gastos) {
  return gastos
    .filter(g => g.estado === 'Aprobado' || g.estado === 'Pendiente')
    .reduce((s, g) => s + g.monto, 0)
}

export function pctPresupuesto(gastado, presupuesto) {
  if (!presupuesto) return 0
  return Math.min(100, Math.round((gastado / presupuesto) * 100))
}
