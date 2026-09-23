import { getToken, clearSession } from './session'

const BASE_URL = import.meta.env.VITE_API_URL

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken()
  const isFormData = body instanceof FormData
  const finalHeaders = { ...headers }
  if (token) finalHeaders.Authorization = `Bearer ${token}`
  if (body !== undefined && !isFormData) finalHeaders['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  })

  // El JWT dura 30 min. Un 401 en una llamada que sí llevaba token significa
  // sesión vencida, no credenciales invalidas de un login (ese caso no manda token).
  if (res.status === 401 && token) {
    clearSession()
    window.location.href = '/login'
    throw new Error('Tu sesion expiro, inicia sesion de nuevo')
  }

  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || 'Error de conexion con el servidor')
  }
  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}

// Los comprobantes van protegidos por Authorization, asi que no se pueden
// cargar con <img src="...">: hay que traerlos como blob.
export async function getComprobanteBlobUrl(gastoId) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/gastos/${gastoId}/comprobante`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('No se pudo cargar el comprobante')
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

// Misma razon que arriba: la factura (imagen o PDF) tambien va protegida.
export async function getFacturaBlobUrl(gastoId) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/gastos/${gastoId}/factura`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('No se pudo cargar la factura')
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

// XML del CFDI, separado del PDF (mismo endpoint protegido, distinto archivo).
export async function getFacturaXmlBlobUrl(gastoId) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/gastos/${gastoId}/factura-xml`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('No se pudo cargar la factura XML')
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}
