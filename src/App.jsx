import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster, ToastBar, toast } from 'react-hot-toast'
import { X } from 'lucide-react'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
// Cada pantalla se descarga al abrirla. Antes todo venia en un solo archivo
// de 2 MB (con Excel y PDF incluidos) que el login tenia que bajar completo.
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const DashboardOperador = lazy(() => import('./pages/operador/Dashboard'))
const NuevoGasto = lazy(() => import('./pages/operador/NuevoGasto'))
const Historial = lazy(() => import('./pages/operador/Historial'))
const Borradores = lazy(() => import('./pages/operador/Borradores'))
const Perfil = lazy(() => import('./pages/operador/Perfil'))
const DashboardAdmin = lazy(() => import('./pages/admin/Dashboard'))
const Viajes = lazy(() => import('./pages/admin/Viajes'))
const TodosGastos = lazy(() => import('./pages/admin/TodosGastos'))
const Reportes = lazy(() => import('./pages/admin/Reportes'))
const Categorias = lazy(() => import('./pages/admin/Categorias'))
const Usuarios = lazy(() => import('./pages/admin/Usuarios'))
const Notificaciones = lazy(() => import('./pages/Notificaciones'))

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{ duration: 8500, style: { position: 'relative', overflow: 'hidden', paddingBottom: 10, paddingRight: 10 } }}
          >
            {(t) => (
              <ToastBar toast={t}>
                {({ icon, message }) => (
                  <>
                    {icon}
                    <div className="flex-1">{message}</div>
                    {t.type !== 'loading' && (
                      <button
                        onClick={() => toast.dismiss(t.id)}
                        className="ml-1 flex-shrink-0 text-gray-600 hover:text-gray-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                    {t.type !== 'loading' && (
                      <span
                        key={t.id}
                        className="absolute left-0 bottom-0 h-1 w-full bg-current opacity-25 origin-left"
                        style={{
                          animation: `toast-progress ${t.duration}ms linear forwards`,
                          animationPlayState: t.visible ? 'running' : 'paused',
                        }}
                      />
                    )}
                  </>
                )}
              </ToastBar>
            )}
          </Toaster>
          <Suspense fallback={<div className="min-h-screen" />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/restablecer-contrasena" element={<ResetPassword />} />

            {/* Operador */}
            <Route element={<ProtectedRoute role="operador" />}>
              <Route path="/operador" element={<DashboardLayout role="operador" />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardOperador />} />
                <Route path="nuevo-gasto" element={<NuevoGasto />} />
                <Route path="nuevo-gasto/:id" element={<NuevoGasto />} />
                <Route path="historial" element={<Historial />} />
                <Route path="borradores" element={<Borradores />} />
                <Route path="notificaciones" element={<Notificaciones />} />
                <Route path="perfil" element={<Perfil />} />
              </Route>
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute role="admin" />}>
              <Route path="/admin" element={<DashboardLayout role="admin" />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardAdmin />} />
                <Route path="viajes" element={<Viajes />} />
                <Route path="todos-gastos" element={<TodosGastos />} />
                <Route path="reportes" element={<Reportes />} />
                <Route path="categorias" element={<Categorias />} />
                <Route path="usuarios" element={<Usuarios />} />
                <Route path="notificaciones" element={<Notificaciones />} />
                <Route path="perfil" element={<Perfil />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}
