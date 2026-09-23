import { api } from './client'

export function listar() {
  return api.get('/gastos')
}

export function crear(data) {
  return api.post('/gastos', data)
}

export function actualizar(id, data) {
  return api.put(`/gastos/${id}`, data)
}

export function eliminar(id) {
  return api.del(`/gastos/${id}`)
}

export function subirComprobante(id, file) {
  const form = new FormData()
  form.append('foto', file)
  return api.post(`/gastos/${id}/comprobante`, form)
}

export function subirFactura(id, file) {
  const form = new FormData()
  form.append('foto', file)
  return api.post(`/gastos/${id}/factura`, form)
}

export function subirFacturaXml(id, file) {
  const form = new FormData()
  form.append('foto', file)
  return api.post(`/gastos/${id}/factura-xml`, form)
}

// No crea nada: solo manda la foto a leer y regresa datos sugeridos para
// prellenar el formulario. El usuario los confirma al enviar el gasto real.
export function extraerRecibo(file) {
  const form = new FormData()
  form.append('foto', file)
  return api.post('/gastos/extraer-recibo', form)
}

export function obtenerDetalle(id) {
  return api.get(`/gastos/${id}`)
}

export function aprobar(id, comentario) {
  return api.put(`/gastos/${id}/aprobar`, { comentario })
}

export function rechazar(id, comentario) {
  return api.put(`/gastos/${id}/rechazar`, { comentario })
}
