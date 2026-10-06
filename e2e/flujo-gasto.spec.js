import path from 'node:path'
import { test, expect } from '@playwright/test'
import { USUARIOS, iniciarSesion, crearViajePara } from './helpers.js'

// El flujo principal de la app de punta a punta: el operador registra un
// gasto con comprobante, el admin lo aprueba y el operador recibe el aviso.
// Si esto se rompe, la app no sirve para lo que existe.

const sufijo = Date.now()
const VIAJE = `Viaje E2E ${sufijo}`
const DESCRIPCION = `Gasolina E2E ${sufijo}`
const RECIBO = path.join(import.meta.dirname, '..', 'src', 'assets', 'recibo-generico.jpg')

test.beforeAll(async ({ request }) => {
  await crearViajePara(request, USUARIOS.operador.email, VIAJE)
})

test('operador envia un gasto y el admin lo aprueba', async ({ browser }) => {
  // --- Operador registra el gasto ---
  const operador = await (await browser.newContext()).newPage()
  await iniciarSesion(operador, USUARIOS.operador)
  await expect(operador).toHaveURL(/\/operador\/dashboard/)
  await operador.goto('/operador/nuevo-gasto')

  const form = operador.locator('form')
  await form.locator('select').filter({ hasText: 'Selecciona tu viaje' }).selectOption({ label: VIAJE })
  await form.locator('input[type="number"]').first().fill('850.50')
  await form.locator('select').filter({ hasText: 'Selecciona una categoría' }).selectOption({ label: 'Combustible' })
  await form.locator('input[type="date"]').fill(new Date().toISOString().slice(0, 10))
  await form.getByPlaceholder('¿En qué se gastó?').fill(DESCRIPCION)
  // Al subir el recibo se intenta la lectura con IA; en pruebas no hay clave
  // de Gemini, asi que falla con un aviso y el formulario sigue llenable.
  await form.locator('input[type="file"]').first().setInputFiles(RECIBO)
  await expect(form.getByText('recibo-generico.jpg')).toBeVisible()

  await form.getByRole('button', { name: 'Enviar gasto' }).click()
  await expect(operador.getByText('Gasto enviado correctamente')).toBeVisible()

  // --- Admin lo revisa y aprueba ---
  const admin = await (await browser.newContext()).newPage()
  await iniciarSesion(admin, USUARIOS.admin)
  await expect(admin).toHaveURL(/\/admin\/dashboard/)
  await admin.goto('/admin/todos-gastos')

  const fila = admin.locator('tr', { hasText: DESCRIPCION })
  await expect(fila).toContainText('Pendiente')
  await fila.getByRole('button', { name: 'Revisar' }).click()
  await admin.getByRole('button', { name: 'Aprobar', exact: true }).click()
  await admin.getByRole('button', { name: 'Sí, aprobar' }).click()
  await expect(admin.getByText(/aprobado/i).first()).toBeVisible()
  await expect(admin.locator('tr', { hasText: DESCRIPCION })).toContainText('Aprobado')

  // --- Operador ve la notificacion ---
  await operador.goto('/operador/notificaciones')
  await expect(operador.getByText('Gasto aprobado — $850.50')).toBeVisible()
})
