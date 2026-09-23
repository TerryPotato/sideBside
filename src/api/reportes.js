import { api } from './client'

function query(params) {
  const usable = Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v))
  const qs = new URLSearchParams(usable).toString()
  return qs ? `?${qs}` : ''
}

export function totales(params) {
  return api.get(`/reportes/totales${query(params)}`)
}

export function porCategoria(params) {
  return api.get(`/reportes/por-categoria${query(params)}`)
}

export function porEmpleado(params) {
  return api.get(`/reportes/por-empleado${query(params)}`)
}

export function porMes(params) {
  return api.get(`/reportes/por-mes${query(params)}`)
}

export function general(params) {
  return api.get(`/reportes${query(params)}`)
}
