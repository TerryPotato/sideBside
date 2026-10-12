import { api } from './client'

export function listar() {
  return api.get('/viajes')
}

export function crear(data) {
  return api.post('/viajes', data)
}

export function actualizar(id, cambios) {
  return api.put(`/viajes/${id}`, cambios)
}

export function eliminar(id) {
  return api.del(`/viajes/${id}`)
}
