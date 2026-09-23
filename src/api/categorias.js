import { api } from './client'

export function listar() {
  return api.get('/categorias')
}

export function crear(data) {
  return api.post('/categorias', data)
}

export function actualizar(id, cambios) {
  return api.put(`/categorias/${id}`, cambios)
}

export function eliminar(id) {
  return api.del(`/categorias/${id}`)
}
