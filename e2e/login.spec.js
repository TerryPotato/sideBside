import { test, expect } from '@playwright/test'
import { USUARIOS, iniciarSesion } from './helpers.js'

test('admin entra a su dashboard', async ({ page }) => {
  await iniciarSesion(page, USUARIOS.admin)
  await expect(page).toHaveURL(/\/admin\/dashboard/)
})

test('operador entra a su dashboard', async ({ page }) => {
  await iniciarSesion(page, USUARIOS.operador)
  await expect(page).toHaveURL(/\/operador\/dashboard/)
})

test('contrasena incorrecta muestra el error en el campo', async ({ page }) => {
  await iniciarSesion(page, { email: USUARIOS.admin.email, contrasena: 'NoEsEsta123' })
  await expect(page.locator('#password-error')).toContainText(/contrasena no es correcta/i)
  await expect(page).toHaveURL(/\/login/)
})

test('operador no puede abrir paginas de admin', async ({ page }) => {
  await iniciarSesion(page, USUARIOS.operador)
  await expect(page).toHaveURL(/\/operador\/dashboard/)
  await page.goto('/admin/usuarios')
  await expect(page).not.toHaveURL(/\/admin\/usuarios/)
})

test('sin sesion manda al login', async ({ page }) => {
  await page.goto('/operador/historial')
  await expect(page).toHaveURL(/\/login/)
})
