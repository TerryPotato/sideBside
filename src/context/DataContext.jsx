import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'
import * as viajesApi from '../api/viajes'
import * as gastosApi from '../api/gastos'
import * as categoriasApi from '../api/categorias'
import * as usuariosApi from '../api/usuarios'
import * as notificacionesApi from '../api/notificaciones'

const DataContext = createContext(null)

// El backend maneja los estados de gasto en minuscula ('pendiente',
// 'aprobado', 'rechazado'); el front los usa capitalizados en badges y
// comparaciones ('Pendiente', 'Aprobado', 'Rechazado') desde que era mock.
function normalizarGasto(g) {
  return { ...g, estado: g.estado.charAt(0).toUpperCase() + g.estado.slice(1) }
}

function normalizarCategoria(c) {
  return { ...c, activo: c.estado === 'activo' }
}

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [viajes, setViajes] = useState([])
  const [gastos, setGastos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [usuariosList, setUsuariosList] = useState([])
  const [notificaciones, setNotificaciones] = useState([])
  const borradores = gastos.filter(g => g.estado === 'Borrador')

  const recargarViajes = useCallback(async () => setViajes(await viajesApi.listar()), [])
  const recargarGastos = useCallback(async () => setGastos((await gastosApi.listar()).map(normalizarGasto)), [])
  const recargarCategorias = useCallback(async () => setCategorias((await categoriasApi.listar()).map(normalizarCategoria)), [])
  const recargarUsuarios = useCallback(async () => {
    const filas = await usuariosApi.listar()
    setUsuariosList(filas.filter(u => u.estado === 'activo'))
  }, [])
  const recargarNotificaciones = useCallback(async () => setNotificaciones(await notificacionesApi.listar()), [])

  useEffect(() => {
    if (!user) {
      setViajes([])
      setGastos([])
      setCategorias([])
      setUsuariosList([])
      setNotificaciones([])
      return
    }
    recargarCategorias().catch(err => toast.error(err.message))
    recargarGastos().catch(err => toast.error(err.message))
    recargarViajes().catch(err => toast.error(err.message))
    recargarNotificaciones().catch(err => toast.error(err.message))
    // GET /api/usuarios es solo-admin: un operador recibiria 403.
    if (user.rol === 'admin') {
      recargarUsuarios().catch(err => toast.error(err.message))
    } else {
      setUsuariosList([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Refresco periodico para que el badge de no-leidas y la pantalla de
  // notificaciones no dependan de que el usuario navegue a otra pagina.
  // Silencioso a proposito: un blip de red cada 60s no debe interrumpir con
  // un toast.
  useEffect(() => {
    if (!user) return
    const id = setInterval(() => {
      recargarNotificaciones().catch(() => {})
    }, 60000)
    return () => clearInterval(id)
  }, [user?.id, recargarNotificaciones])

  async function crearViaje(data) {
    await viajesApi.crear({
      nombre: data.nombre,
      usuario_id: Number(data.usuario_id),
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      presupuesto: Number(data.presupuesto) || 0,
    })
    await recargarViajes()
  }

  // No manda usuario_id: el backend (viajes.controller actualizar) no lo
  // acepta, el operador asignado no se puede cambiar despues de creado.
  async function actualizarViaje(id, cambios) {
    await viajesApi.actualizar(id, {
      nombre: cambios.nombre,
      fecha_inicio: cambios.fecha_inicio,
      fecha_fin: cambios.fecha_fin,
      presupuesto: cambios.presupuesto === undefined ? undefined : Number(cambios.presupuesto) || 0,
      estado: cambios.estado,
    })
    await recargarViajes()
  }

  async function agregarGasto(gasto) {
    const categoriaObj = categorias.find(c => c.nombre === gasto.categoria)
    if (!categoriaObj) throw new Error('Selecciona una categoria valida')

    const { id } = await gastosApi.crear({
      viaje_id: Number(gasto.viaje_id),
      categoria_id: categoriaObj.id,
      monto: Number(gasto.monto),
      iva: gasto.iva ? Number(gasto.iva) : 0,
      moneda: gasto.moneda,
      descripcion: gasto.descripcion || null,
      ubicacion: gasto.ubicacion || null,
      fecha: gasto.fecha,
      enviar: gasto.enviar ?? true,
    })

    if (gasto.recibo) {
      await gastosApi.subirComprobante(id, gasto.recibo)
    }
    if (gasto.facturaPdf) {
      await gastosApi.subirFactura(id, gasto.facturaPdf)
    }
    if (gasto.facturaXml) {
      await gastosApi.subirFacturaXml(id, gasto.facturaXml)
    }

    await recargarGastos()
  }

  async function aprobarGasto(id) {
    await gastosApi.aprobar(id)
    await recargarGastos()
  }

  async function rechazarGasto(id, comentario) {
    await gastosApi.rechazar(id, comentario)
    await recargarGastos()
  }

  function gastosDeViaje(viaje_id) {
    return gastos.filter(g => g.viaje_id === viaje_id)
  }

  function viajesActivosDeUsuario(usuario_id) {
    return viajes.filter(v => v.usuario_id === usuario_id && v.estado === 'activo')
  }

  // Edicion de un borrador (o de un gasto pendiente) desde
  // NuevoGasto en modo edicion: el gasto ya existe en la BD, se actualiza
  // con los datos del formulario y, si el usuario elige "Enviar gasto" en
  // vez de "Guardar como borrador", enviar:true lo transiciona a pendiente
  // y dispara la notificacion al admin igual que un envio normal. No manda
  // viaje_id: actualizar() en el backend no lo acepta, el viaje de un gasto
  // no se puede cambiar despues de creado.
  async function actualizarGasto(id, gasto) {
    const categoriaObj = categorias.find(c => c.nombre === gasto.categoria)
    if (!categoriaObj) throw new Error('Selecciona una categoria valida')

    await gastosApi.actualizar(id, {
      categoria_id: categoriaObj.id,
      monto: Number(gasto.monto),
      iva: gasto.iva ? Number(gasto.iva) : 0,
      moneda: gasto.moneda,
      descripcion: gasto.descripcion || null,
      ubicacion: gasto.ubicacion || null,
      fecha: gasto.fecha,
      enviar: gasto.enviar ?? false,
    })

    if (gasto.recibo) await gastosApi.subirComprobante(id, gasto.recibo)
    if (gasto.facturaPdf) await gastosApi.subirFactura(id, gasto.facturaPdf)
    if (gasto.facturaXml) await gastosApi.subirFacturaXml(id, gasto.facturaXml)

    await recargarGastos()
  }

  async function eliminarBorrador(id) {
    await gastosApi.eliminar(id)
    await recargarGastos()
  }

  async function actualizarCategoria(id, cambios) {
    await categoriasApi.actualizar(id, {
      nombre: cambios.nombre,
      descripcion: cambios.descripcion,
      color: cambios.color,
      icono: cambios.icono,
      estado: cambios.activo === undefined ? undefined : cambios.activo ? 'activo' : 'inactivo',
    })
    await recargarCategorias()
  }

  async function crearCategoria(data) {
    await categoriasApi.crear({
      nombre: data.nombre,
      descripcion: data.descripcion,
      color: data.color,
      icono: data.icono,
    })
    await recargarCategorias()
  }

  // El backend borra en firme si la categoria no tiene gastos asociados, o
  // la desactiva si si los tiene (rompería la FK gastos.categoria_id). El
  // mensaje de respuesta le dice a la pantalla cual de los dos paso.
  async function eliminarCategoria(id) {
    const { mensaje } = await categoriasApi.eliminar(id)
    await recargarCategorias()
    return mensaje
  }

  // El backend genera la contrasena temporal y se la manda por correo
  // directo al usuario nuevo: el admin nunca la recibe ni la ve (protege al
  // operador). Aqui solo regresa los datos basicos del usuario creado.
  async function agregarUsuario(data) {
    const creado = await usuariosApi.crear({
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      num_empleado: data.num_empleado,
    })
    await recargarUsuarios()
    return creado
  }

  async function eliminarUsuario(id) {
    await usuariosApi.eliminar(id)
    await recargarUsuarios()
  }

  async function marcarNotificacionLeida(id) {
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n))
    try {
      await notificacionesApi.marcarLeida(id)
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function marcarTodasNotificacionesLeidas() {
    setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })))
    try {
      await notificacionesApi.marcarTodasLeidas()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <DataContext.Provider value={{
      viajes, gastos, categorias, usuariosList, borradores, notificaciones,
      crearViaje, actualizarViaje, agregarGasto, actualizarGasto, aprobarGasto, rechazarGasto,
      gastosDeViaje, viajesActivosDeUsuario,
      eliminarBorrador,
      actualizarCategoria, crearCategoria, eliminarCategoria,
      agregarUsuario, eliminarUsuario,
      marcarNotificacionLeida, marcarTodasNotificacionesLeidas,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
