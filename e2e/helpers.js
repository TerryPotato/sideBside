import { expect } from '@playwright/test'
import { API_URL } from '../playwright.config.js'

// Los mismos usuarios que siembra sidebside-backend/tests/preparar-db.js.
export const USUARIOS = {
  admin: { email: 'admin@test.local', contrasena: 'Admin12345' },
  operador: { email: 'operador@test.local', contrasena: 'Operador12345' },
}

export async function iniciarSesion(page, { email, contrasena }) {
  await page.goto('/login')
  await page.getByLabel('Correo electrónico').fill(email)
  await page.locator('#password').fill(contrasena)
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click()
}

// Preparar datos por la API es mas rapido y estable que hacerlo por la UI;
// la UI se reserva para lo que la prueba realmente quiere verificar.
export async function tokenApi(request, usuario) {
  const res = await request.post(`${API_URL}/auth/login`, { data: usuario })
  expect(res.ok()).toBeTruthy()
  return (await res.json()).token
}

export async function crearViajePara(request, emailOperador, nombre) {
  const token = await tokenApi(request, USUARIOS.admin)
  const headers = { Authorization: `Bearer ${token}` }
  const usuarios = await (await request.get(`${API_URL}/usuarios`, { headers })).json()
  const operador = usuarios.find(u => u.email === emailOperador)
  const hoy = new Date().toISOString().slice(0, 10)
  const res = await request.post(`${API_URL}/viajes`, {
    headers,
    data: { nombre, usuario_id: operador.id, fecha_inicio: hoy, fecha_fin: hoy, presupuesto: 5000 },
  })
  expect(res.status()).toBe(201)
}
