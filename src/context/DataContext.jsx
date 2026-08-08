import { createContext, useContext, useState } from 'react'
import reciboEjemplo from '../assets/recibo-generico.jpg'

const usuarios = [
  { id: 1, nombre: 'Carlos López', email: 'carlos@empresa.com', num_empleado: 'EMP-001' },
  { id: 2, nombre: 'María García', email: 'maria@empresa.com', num_empleado: 'EMP-002' },
  { id: 3, nombre: 'Juan Pérez', email: 'juan@empresa.com', num_empleado: 'EMP-003' },
  { id: 4, nombre: 'Luis Hernández', email: 'luis@empresa.com', num_empleado: 'EMP-004' },
]

const viajesIniciales = [
  { id: 1, nombre: 'Visita cliente Monterrey', usuario_id: 1, usuario: 'Carlos López', fecha_inicio: '2024-05-10', fecha_fin: '2024-05-15', presupuesto: 5000, estado: 'activo' },
  { id: 2, nombre: 'Feria industrial CDMX', usuario_id: 2, usuario: 'María García', fecha_inicio: '2024-05-12', fecha_fin: '2024-05-14', presupuesto: 3000, estado: 'activo' },
  { id: 3, nombre: 'Capacitación Guadalajara', usuario_id: 3, usuario: 'Juan Pérez', fecha_inicio: '2024-04-20', fecha_fin: '2024-04-25', presupuesto: 4000, estado: 'completado' },
]

const gastosIniciales = [
  { id: 1, viaje_id: 1, usuario_id: 1, empleado: 'Carlos López', categoria: 'Combustible', descripcion: 'Gasolina autopista Mty', monto: 800, moneda: 'MXN', fecha: '2024-05-13', estado: 'Pendiente', preview: reciboEjemplo, ubicacion: 'Monterrey, NL' },
  { id: 2, viaje_id: 1, usuario_id: 1, empleado: 'Carlos López', categoria: 'Comida', descripcion: 'Cena con cliente', monto: 350, moneda: 'MXN', fecha: '2024-05-13', estado: 'Pendiente', preview: reciboEjemplo, ubicacion: 'Monterrey, NL' },
  { id: 3, viaje_id: 1, usuario_id: 1, empleado: 'Carlos López', categoria: 'Peaje', descripcion: 'Casetas autopista', monto: 120, moneda: 'MXN', fecha: '2024-05-11', estado: 'Aprobado', preview: reciboEjemplo, ubicacion: 'Monterrey, NL' },
  { id: 4, viaje_id: 2, usuario_id: 2, empleado: 'María García', categoria: 'Comida', descripcion: 'Almuerzo de trabajo', monto: 280, moneda: 'MXN', fecha: '2024-05-12', estado: 'Pendiente', preview: reciboEjemplo, ubicacion: 'CDMX' },
  { id: 5, viaje_id: 2, usuario_id: 2, empleado: 'María García', categoria: 'Transporte', descripcion: 'Uber al evento', monto: 95, moneda: 'MXN', fecha: '2024-05-12', estado: 'Pendiente', preview: reciboEjemplo, ubicacion: 'CDMX' },
  { id: 6, viaje_id: 3, usuario_id: 3, empleado: 'Juan Pérez', categoria: 'Hospedaje', descripcion: 'Hotel 2 noches', monto: 1800, moneda: 'MXN', fecha: '2024-04-21', estado: 'Aprobado', preview: reciboEjemplo, ubicacion: 'Guadalajara' },
]

const categoriasIniciales = [
  { id: 1, nombre: 'Combustible', descripcion: 'Gasolina y diésel', color: '#3b82f6', icono: 'Fuel', activo: true },
  { id: 2, nombre: 'Comida', descripcion: 'Alimentos y restaurantes', color: '#22c55e', icono: 'UtensilsCrossed', activo: true },
  { id: 3, nombre: 'Peaje', descripcion: 'Casetas y estacionamientos', color: '#f59e0b', icono: 'Milestone', activo: true },
  { id: 4, nombre: 'Mantenimiento', descripcion: 'Servicios de mantenimiento', color: '#a855f7', icono: 'Wrench', activo: true },
  { id: 5, nombre: 'Hospedaje', descripcion: 'Hoteles y hospedajes', color: '#0ea5e9', icono: 'BedDouble', activo: true },
  { id: 6, nombre: 'Transporte', descripcion: 'Transporte público o privado', color: '#6b7280', icono: 'Bus', activo: false },
  { id: 7, nombre: 'Otros', descripcion: 'Otros gastos no clasificados', color: '#ec4899', icono: 'Package', activo: true },
]

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [viajes, setViajes] = useState(viajesIniciales)
  const [gastos, setGastos] = useState(gastosIniciales)
  const [categorias, setCategorias] = useState(categoriasIniciales)
  const [usuariosList, setUsuariosList] = useState(usuarios)
  const [borradores, setBorradores] = useState([])

  function crearViaje(data) {
    const usuario = usuariosList.find(u => u.id === Number(data.usuario_id))
    setViajes(prev => [{ ...data, id: Date.now(), usuario: usuario?.nombre ?? '', estado: 'activo' }, ...prev])
  }

  function agregarGasto(gasto) {
    setGastos(prev => [{ ...gasto, id: Date.now() }, ...prev])
  }

  function aprobarGasto(id) {
    setGastos(prev => prev.map(g => g.id === id ? { ...g, estado: 'Aprobado' } : g))
  }

  function rechazarGasto(id, comentario) {
    setGastos(prev => prev.map(g => g.id === id ? { ...g, estado: 'Rechazado', comentario } : g))
  }

  function revertirGasto(id) {
    setGastos(prev => prev.map(g => g.id === id ? { ...g, estado: 'Pendiente', comentario: undefined } : g))
  }

  function gastosDeViaje(viaje_id) {
    return gastos.filter(g => g.viaje_id === viaje_id)
  }

  function viajesActivosDeUsuario(usuario_id) {
    return viajes.filter(v => v.usuario_id === usuario_id && v.estado === 'activo')
  }

  function saveDraft(data) {
    setBorradores(prev => [{ ...data, id: Date.now(), guardado_en: new Date().toISOString() }, ...prev])
  }

  function eliminarBorrador(id) {
    setBorradores(prev => prev.filter(b => b.id !== id))
  }

  function actualizarCategoria(id, cambios) {
    setCategorias(prev => prev.map(c => c.id === id ? { ...c, ...cambios } : c))
  }

  function crearCategoria(data) {
    setCategorias(prev => [...prev, { ...data, id: Date.now(), activo: true }])
  }

  function agregarUsuario(data) {
    setUsuariosList(prev => [...prev, { ...data, id: Date.now() }])
  }

  function eliminarUsuario(id) {
    setUsuariosList(prev => prev.filter(u => u.id !== id))
  }

  return (
    <DataContext.Provider value={{
      viajes, gastos, categorias, usuariosList, borradores,
      crearViaje, agregarGasto, aprobarGasto, rechazarGasto, revertirGasto,
      gastosDeViaje, viajesActivosDeUsuario,
      saveDraft, eliminarBorrador,
      actualizarCategoria, crearCategoria,
      agregarUsuario, eliminarUsuario,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
