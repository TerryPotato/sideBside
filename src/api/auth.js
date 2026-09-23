import { api } from './client'

export function login(email, contrasena) {
  return api.post('/auth/login', { email, contrasena })
}

export function logout() {
  return api.post('/auth/logout')
}

export function cambiarContrasena(actual, nueva) {
  return api.put('/auth/cambiar-contrasena', { actual, nueva })
}

export function olvideContrasena(email) {
  return api.post('/auth/olvide-contrasena', { email })
}

export function restablecerContrasena(token, nueva) {
  return api.post('/auth/restablecer-contrasena', { token, nueva })
}

export function actualizarZonaHoraria(zona_horaria) {
  return api.put('/auth/zona-horaria', { zona_horaria })
}
