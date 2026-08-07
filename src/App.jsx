import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardOperador from './pages/operador/Dashboard'
import NuevoGasto from './pages/operador/NuevoGasto'
import Historial from './pages/operador/Historial'
import Borradores from './pages/operador/Borradores'
import Perfil from './pages/operador/Perfil'
import DashboardAdmin from './pages/admin/Dashboard'
import Viajes from './pages/admin/Viajes'
import TodosGastos from './pages/admin/TodosGastos'
import Reportes from './pages/admin/Reportes'
import Categorias from './pages/admin/Categorias'
import Usuarios from './pages/admin/Usuarios'
import Notificaciones from './pages/Notificaciones'

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Operador */}
            <Route element={<ProtectedRoute role="operador" />}>
              <Route path="/operador" element={<DashboardLayout role="operador" />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardOperador />} />
                <Route path="nuevo-gasto" element={<NuevoGasto />} />
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
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}
