const KEY = 'sbs_session'

// Por seguridad la sesion solo vive en sessionStorage (se borra al cerrar
// la pestana/navegador). Ya no existe "recordarme en este dispositivo":
// guardar el token en localStorage lo dejaria expuesto indefinidamente en
// un equipo compartido, y el JWT ya expira solo a los 30 min de cualquier
// forma, asi que no habia beneficio real, solo riesgo.
function read() {
  const raw = sessionStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : null
}

export function getSession() {
  return read()
}

export function getToken() {
  return getSession()?.token ?? null
}

export function getUser() {
  return getSession()?.user ?? null
}

export function setSession(token, user) {
  sessionStorage.setItem(KEY, JSON.stringify({ token, user }))
}

export function clearSession() {
  sessionStorage.removeItem(KEY)
  localStorage.removeItem(KEY) // limpia sesiones viejas guardadas antes de este cambio
}
