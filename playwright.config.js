import { defineConfig, devices } from '@playwright/test'

// Las E2E levantan su propio backend y frontend en puertos distintos a los de
// desarrollo (5001/5174 en vez de 5000/5173), contra la base `sidebside_test`
// que el backend recrea desde cero al arrancar (ver
// sidebside-backend/tests/preparar-db.js). Asi se pueden correr con los
// servidores de desarrollo abiertos y nunca tocan datos reales.
const API_PORT = 5001
const WEB_PORT = 5174

export default defineConfig({
  testDir: './e2e',
  // Una sola base compartida: los flujos van en serie para no pisarse.
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run start:e2e --prefix ../sidebside-backend',
      url: `http://localhost:${API_PORT}/api/health`,
      env: { PORT: String(API_PORT), FRONTEND_URL: `http://localhost:${WEB_PORT}` },
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}`,
      env: { VITE_API_URL: `http://localhost:${API_PORT}/api` },
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
})

export const API_URL = `http://localhost:${API_PORT}/api`
