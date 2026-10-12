import { test, expect } from '@playwright/test'
import { USUARIOS, iniciarSesion } from './helpers.js'

// Caso real: varios clics en "Crear viaje" mientras el servidor respondia
// crearon 9 viajes iguales, y no habia forma de borrarlos desde la app.

const VIAJE = `Viaje doble clic ${Date.now()}`

test('doble clic crea un solo viaje y se puede eliminar', async ({ page }) => {
  await iniciarSesion(page, USUARIOS.admin)
  await expect(page).toHaveURL(/\/admin/)
  await page.goto('/admin/viajes')

  await page.getByRole('button', { name: 'Nuevo viaje' }).click()
  const form = page.locator('form')
  await form.getByPlaceholder('Ej. Visita cliente Monterrey').fill(VIAJE)
  await form.locator('select').selectOption({ index: 1 })
  const hoy = new Date().toISOString().slice(0, 10)
  await form.locator('input[type="date"]').nth(0).fill(hoy)
  await form.locator('input[type="date"]').nth(1).fill(hoy)

  await form.getByRole('button', { name: 'Crear viaje' }).dblclick()
  await expect(page.getByText('Viaje creado correctamente')).toBeVisible()

  const tarjeta = page.locator('div.rounded-xl', { has: page.getByRole('heading', { name: VIAJE }) })
  await expect(tarjeta).toHaveCount(1)

  await tarjeta.getByTitle('Eliminar viaje').click()
  await page.getByRole('button', { name: 'Sí, eliminar' }).click()
  await expect(page.getByText('Viaje eliminado')).toBeVisible()
  await expect(page.getByRole('heading', { name: VIAJE })).toHaveCount(0)
})
