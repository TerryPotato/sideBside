import { api } from './client'

export function listar() {
  return api.get('/usuarios')
}

export function crear(data) {
  return api.post('/usuarios', data)
}

export function eliminar(id) {
  return api.del(`/usuarios/${id}`)
}
