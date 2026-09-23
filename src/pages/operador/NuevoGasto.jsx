import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Upload, X, AlertCircle, MapPin, Loader2, FileCheck, Sparkles, CheckCircle2, RotateCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'
import FieldHint from '../../components/FieldHint'
import * as gastosApi from '../../api/gastos'
import { reducirImagen } from '../../utils/imagen'

const monedas = [{ val: 'MXN', label: 'MXN — Peso mexicano' }, { val: 'USD', label: 'USD — Dólar' }, { val: 'EUR', label: 'EUR — Euro' }]

const empty = {
  viaje_id: '', monto: '', iva: '', moneda: 'MXN', categoria: '', descripcion: '', fecha: '', ubicacion: '',
  recibo: null, reciboPreview: null,
  facturaPdf: null, facturaPdfPreview: null,
  facturaXml: null, facturaXmlPreview: null,
}

function FileSlot({ label, sublabel, file, preview, esPDF, error, onFile, onRemove, accept, yaExiste, hint }) {
  return (
    <div>
      <p className="text-base font-semibold text-gray-800 mb-0.5 flex items-center">{label}{hint && <FieldHint text={hint} />}</p>
      {sublabel && <p className="text-base text-gray-700 mb-2">{sublabel}</p>}
      {!file && yaExiste && (
        <p className="text-base text-green-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5 mb-2 flex items-center gap-1.5">
          <FileCheck size={16} /> Ya adjuntado · sube uno nuevo para reemplazarlo
        </p>
      )}
      {file ? (
        <div className="border-2 border-blue-200 bg-blue-50 rounded-xl p-3 flex items-center gap-3">
          {preview
            ? <img src={preview} alt="vista previa" className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-gray-200" />
            : <div className="w-14 h-14 bg-white rounded-lg flex flex-col items-center justify-center flex-shrink-0 border border-gray-200">
                <span className="text-base font-bold text-gray-700">{esPDF ? 'PDF' : 'XML'}</span>
              </div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-gray-800 truncate">{file.name}</p>
            <p className="text-base text-gray-700">{(file.size / 1024).toFixed(0)} KB · Listo para enviar</p>
          </div>
          <button type="button" onClick={onRemove} className="w-11 h-11 flex items-center justify-center rounded-xl bg-white text-gray-600 hover:text-red-500 hover:bg-red-50 active:bg-red-100 border border-gray-200 flex-shrink-0 transition-colors">
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 cursor-pointer active:bg-gray-50 transition-colors ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
          <Upload size={22} className={`mb-2 ${error ? 'text-red-400' : 'text-gray-600'}`} />
          <p className="text-base font-medium text-gray-700 text-center">Toca para subir</p>
          <p className="text-base text-gray-600 mt-0.5">{accept.replace(/\./g, '').replace(/,/g, ', ').toUpperCase()}</p>
          <input type="file" accept={accept} className="hidden" onChange={onFile} />
        </label>
      )}
      {error && <p className="text-base text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={16} />{error}</p>}
    </div>
  )
}

const NOMBRES_CAMPO = { monto: 'monto', iva: 'IVA', fecha: 'fecha', comercio: 'comercio', ubicacion: 'ubicación', categoria_sugerida: 'categoría' }

// Panel arriba del formulario: es lo primero que ve el operador, asi se
// entera de que puede empezar por la foto en vez de teclear todo. Tambien
// deja el resultado a la vista (un toast dura 4 s y si el usuario no estaba
// mirando, parecia que la IA "no hizo nada").
function PanelIA({ estado, segundos, tieneRecibo, onSubir, onLeer }) {
  if (estado.tipo === 'leyendo') {
    return (
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 flex items-center gap-3">
        <Loader2 size={20} className="animate-spin text-indigo-600 flex-shrink-0" />
        <div>
          <p className="text-base font-semibold text-indigo-900">Leyendo tu ticket… {segundos > 0 && <span className="font-normal">{segundos} s</span>}</p>
          <p className="text-base text-indigo-800">
            {segundos >= 10
              ? 'El servicio de IA va lento ahorita, seguimos intentando. Puedes ir llenando otros campos.'
              : 'Puedes ir llenando otros campos mientras tanto.'}
          </p>
        </div>
      </div>
    )
  }
  if (estado.tipo === 'ok') {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-start gap-3">
        <CheckCircle2 size={20} className="text-green-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-base font-semibold text-green-900">La IA llenó: {estado.campos.join(', ')}</p>
          <p className="text-base text-green-800">Revisa que sean correctos antes de enviar{estado.confianza === 'baja' ? ' — el ticket no se leía muy bien' : ''}.</p>
        </div>
      </div>
    )
  }
  if (estado.tipo === 'vacio' || estado.tipo === 'error') {
    const esError = estado.tipo === 'error'
    return (
      <div className={`${esError ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'} border-2 rounded-2xl p-4 flex items-start gap-3`}>
        <AlertCircle size={20} className={`${esError ? 'text-red-600' : 'text-yellow-700'} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className="text-base font-semibold text-gray-900">{esError ? 'No se pudo leer el ticket' : 'No encontramos datos en el ticket'}</p>
          <p className="text-base text-gray-700">{esError ? estado.mensaje : 'Puede estar borroso o cortado. Complétalo a mano o sube una foto más clara.'}</p>
        </div>
        {esError && (
          <button type="button" onClick={onLeer}
            className="min-h-11 py-2 flex items-center gap-1.5 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-800 font-semibold px-3 rounded-xl text-base flex-shrink-0">
            <RotateCw size={16} /> Reintentar
          </button>
        )}
      </div>
    )
  }
  return (
    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <Sparkles size={22} className="text-indigo-600 flex-shrink-0 hidden sm:block" />
      <div className="flex-1">
        <p className="text-base font-semibold text-indigo-900">¿Tienes el ticket? Deja que la IA llene el formulario</p>
        <p className="text-base text-indigo-800">Sube la foto y rellenamos monto, fecha, comercio y categoría por ti. Solo revisas y envías.</p>
      </div>
      {tieneRecibo ? (
        <button type="button" onClick={onLeer}
          className="min-h-11 py-2 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold px-4 rounded-xl text-base flex-shrink-0 transition-colors">
          <Sparkles size={18} /> Rellenar con IA
        </button>
      ) : (
        <label className="min-h-11 py-2 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold px-4 rounded-xl text-base flex-shrink-0 cursor-pointer transition-colors">
          <Upload size={18} /> Subir foto del ticket
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={onSubir} />
        </label>
      )}
    </div>
  )
}

export default function NuevoGasto() {
  const { user } = useAuth()
  const { viajes, categorias, gastos, agregarGasto, actualizarGasto } = useData()
  const { id } = useParams()
  const navigate = useNavigate()
  const editando = Boolean(id)
  const usuarioId = user?.id
  const viajesActivos = viajes.filter(v => v.usuario_id === usuarioId && v.estado === 'activo')
  const categoriasActivas = categorias.filter(c => c.activo)

  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [geoLoading, setGeoLoading] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [adjuntosExistentes, setAdjuntosExistentes] = useState({ recibo: false, facturaPdf: false, facturaXml: false })
  const [iaEstado, setIaEstado] = useState({ tipo: 'idle' })
  const [iaSegundos, setIaSegundos] = useState(0)
  const extrayendo = iaEstado.tipo === 'leyendo'
  // Cada lectura lleva un numero; si el usuario quita o cambia la foto
  // mientras la IA sigue leyendo, la respuesta vieja se ignora.
  const lecturaRef = useRef(0)
  const cargadoRef = useRef(false)

  // Modo edicion (viene de Borradores > Continuar editando): precarga el
  // formulario con el borrador ya guardado en la BD. Los archivos ya
  // subidos no se pueden convertir de vuelta a un File del navegador, asi
  // que solo se marca que ya existen (adjuntosExistentes) para no exigir
  // subirlos de nuevo; si el usuario sube uno nuevo, reemplaza al anterior.
  useEffect(() => {
    if (!editando || cargadoRef.current) return
    const gasto = gastos.find(g => String(g.id) === id)
    if (!gasto) return
    cargadoRef.current = true
    setForm(f => ({
      ...f,
      viaje_id: String(gasto.viaje_id ?? ''),
      monto: String(gasto.monto ?? ''),
      iva: gasto.iva ? String(gasto.iva) : '',
      moneda: gasto.moneda ?? 'MXN',
      categoria: gasto.categoria ?? '',
      descripcion: gasto.descripcion ?? '',
      fecha: gasto.fecha ?? '',
      ubicacion: gasto.ubicacion ?? '',
    }))
    setAdjuntosExistentes({
      recibo: Boolean(gasto.foto_url),
      facturaPdf: Boolean(gasto.factura_url),
      facturaXml: Boolean(gasto.factura_xml_url),
    })
  }, [editando, id, gastos])

  function handleFile(campo, previewCampo) {
    return (e) => {
      const file = e.target.files[0]
      if (!file) return
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      setForm(f => ({ ...f, [campo]: file, [previewCampo]: preview }))
      setErrors(er => ({ ...er, [campo]: '' }))
      // Subir el ticket ya es la señal: se lee solo, sin esperar a que el
      // usuario descubra el boton.
      if (campo === 'recibo') handleExtraerRecibo(file)
    }
  }

  function removeFile(campo, previewCampo) {
    return () => {
      if (form[previewCampo]) URL.revokeObjectURL(form[previewCampo])
      setForm(f => ({ ...f, [campo]: null, [previewCampo]: null }))
      if (campo === 'recibo') {
        lecturaRef.current++
        setIaEstado({ tipo: 'idle' })
      }
    }
  }

  useEffect(() => {
    if (!extrayendo) return
    setIaSegundos(0)
    const inicio = Date.now()
    const t = setInterval(() => setIaSegundos(Math.floor((Date.now() - inicio) / 1000)), 1000)
    return () => clearInterval(t)
  }, [extrayendo])

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  // Manda la foto del recibo a leer con IA y prellena el formulario. Nunca
  // pisa un campo que el usuario ya llenó a mano, y nunca bloquea ni obliga
  // a nada: si falla o no reconoce algo, el formulario sigue igual de
  // llenable que antes.
  async function handleExtraerRecibo(archivo = form.recibo) {
    if (!archivo) return
    const lectura = ++lecturaRef.current
    setIaEstado({ tipo: 'leyendo' })
    try {
      const datos = await gastosApi.extraerRecibo(await reducirImagen(archivo))
      if (lectura !== lecturaRef.current) return
      setForm(f => ({
        ...f,
        monto: f.monto || (datos.monto != null ? String(datos.monto) : f.monto),
        iva: f.iva || (datos.iva != null ? String(datos.iva) : f.iva),
        fecha: f.fecha || datos.fecha || f.fecha,
        descripcion: f.descripcion || datos.comercio || f.descripcion,
        ubicacion: f.ubicacion || datos.ubicacion || f.ubicacion,
        categoria: f.categoria || (categoriasActivas.some(c => c.nombre === datos.categoria_sugerida) ? datos.categoria_sugerida : f.categoria),
      }))
      setErrors({})
      const campos = Object.keys(NOMBRES_CAMPO).filter(k => datos[k] != null).map(k => NOMBRES_CAMPO[k])
      if (campos.length === 0) {
        setIaEstado({ tipo: 'vacio' })
        toast('No pudimos leer el ticket automáticamente, complétalo a mano', { icon: '🤔' })
      } else {
        setIaEstado({ tipo: 'ok', campos, confianza: datos.confianza })
        toast.success('Datos rellenados — revísalos antes de enviar')
      }
    } catch (err) {
      if (lectura !== lecturaRef.current) return
      const mensaje = err.message || 'No se pudo leer el ticket automáticamente'
      setIaEstado({ tipo: 'error', mensaje })
      toast.error(mensaje)
    }
  }

  function obtenerUbicacion() {
    if (!navigator.geolocation) { toast.error('Tu dispositivo no soporta geolocalización'); return }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        set('ubicacion', `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
        setGeoLoading(false)
        toast.success('Ubicación obtenida')
      },
      () => {
        toast.error('No se pudo obtener la ubicación. Verifica los permisos.')
        setGeoLoading(false)
      },
      { timeout: 10000 }
    )
  }

  function validate({ requireDocs } = { requireDocs: true }) {
    const e = {}
    if (!form.viaje_id) e.viaje_id = 'Selecciona el viaje'
    if (!form.monto || Number(form.monto) <= 0) e.monto = 'Ingresa un monto válido'
    if (form.iva && Number(form.iva) > Number(form.monto)) e.iva = 'El IVA no puede ser mayor al monto'
    if (!form.categoria) e.categoria = 'Selecciona una categoría'
    if (!form.fecha) e.fecha = 'Selecciona la fecha'
    const tieneAlgunDocumento = form.recibo || form.facturaPdf || form.facturaXml
      || adjuntosExistentes.recibo || adjuntosExistentes.facturaPdf || adjuntosExistentes.facturaXml
    if (requireDocs && !tieneAlgunDocumento) e.recibo = 'Sube al menos el recibo o la factura'
    return e
  }

  async function handleDraft() {
    // Un borrador no exige comprobante todavia (para eso existe el aviso
    // "Sin documentos adjuntos" en la pantalla de Borradores), pero si
    // exige los datos minimos que la tabla gastos requiere (viaje, monto,
    // categoria, fecha) porque ya se guarda como un gasto real en estado
    // 'borrador', no solo en memoria.
    const errs = validate({ requireDocs: false })
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Completa los campos requeridos'); return }
    setEnviando(true)
    try {
      const datos = {
        viaje_id: Number(form.viaje_id),
        categoria: form.categoria,
        descripcion: form.descripcion,
        monto: Number(form.monto),
        iva: form.iva,
        moneda: form.moneda,
        fecha: form.fecha,
        ubicacion: form.ubicacion,
        recibo: form.recibo,
        facturaPdf: form.facturaPdf,
        facturaXml: form.facturaXml,
        enviar: false,
      }
      if (editando) {
        await actualizarGasto(id, datos)
        toast('Cambios guardados', { icon: '📋' })
        navigate('/operador/borradores')
      } else {
        await agregarGasto(datos)
        toast('Borrador guardado', { icon: '📋' })
        setForm(empty)
        setIaEstado({ tipo: 'idle' })
        setErrors({})
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setEnviando(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate({ requireDocs: true })
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Completa los campos requeridos'); return }
    setEnviando(true)
    try {
      const datos = {
        viaje_id: Number(form.viaje_id),
        categoria: form.categoria,
        descripcion: form.descripcion,
        monto: Number(form.monto),
        iva: form.iva,
        moneda: form.moneda,
        fecha: form.fecha,
        ubicacion: form.ubicacion,
        recibo: form.recibo,
        facturaPdf: form.facturaPdf,
        facturaXml: form.facturaXml,
        enviar: true,
      }
      if (editando) {
        await actualizarGasto(id, datos)
        toast.success('Gasto enviado correctamente')
        navigate('/operador/borradores')
      } else {
        await agregarGasto(datos)
        toast.success('Gasto enviado correctamente')
        setForm(empty)
        setIaEstado({ tipo: 'idle' })
        setErrors({})
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (!editando && viajesActivos.length === 0) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
          <AlertCircle size={32} className="text-yellow-500" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 mb-1">Sin viajes activos</p>
          <p className="text-base text-gray-700 max-w-xs">Pide a tu administrador que te asigne un viaje antes de registrar gastos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">{editando ? 'Editar Borrador' : 'Nuevo Gasto'}</h1>
      <p className="text-base text-gray-700 mb-5">
        {editando
          ? 'Corrige los datos o documentos de tu borrador y envíalo cuando esté listo.'
          : 'Captura un gasto de tu viaje activo. Sube el recibo o la factura para que tu administrador pueda revisarlo, o guárdalo como borrador si aún te falta algo.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">

        <PanelIA estado={iaEstado} segundos={iaSegundos} tieneRecibo={Boolean(form.recibo)}
          onSubir={handleFile('recibo', 'reciboPreview')} onLeer={() => handleExtraerRecibo()} />

        {/* Viaje */}
        <div className="bg-white rounded-2xl border border-black shadow-sm p-4">
          <label className="flex items-center text-base font-semibold text-gray-800 mb-2">Viaje <span className="text-red-600 ml-1">*</span><FieldHint text="El viaje activo al que pertenece este gasto. No podrás cambiarlo después de guardarlo." /></label>
          <select value={form.viaje_id} onChange={e => set('viaje_id', e.target.value)} disabled={editando}
            className={`w-full border-2 rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 ${errors.viaje_id ? 'border-red-400' : 'border-gray-200'}`}>
            <option value="">Selecciona tu viaje</option>
            {viajesActivos.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
          </select>
          {editando && <p className="text-base text-gray-600 mt-1.5">El viaje no se puede cambiar despues de guardado</p>}
          {errors.viaje_id && <p className="text-base text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={16} />{errors.viaje_id}</p>}
        </div>

        {/* Monto + Moneda */}
        <div className="bg-white rounded-2xl border border-black shadow-sm p-4">
          <label className="flex items-center text-base font-semibold text-gray-800 mb-2">Monto <span className="text-red-600 ml-1">*</span><FieldHint text="El monto total que pagaste, incluyendo impuestos si los hay." /></label>
          <div className="flex gap-2">
            <select value={form.moneda} onChange={e => set('moneda', e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-3 text-base bg-white focus:outline-none focus:border-blue-500 w-28 flex-shrink-0">
              {monedas.map(m => <option key={m.val} value={m.val}>{m.val}</option>)}
            </select>
            <input type="number" placeholder="0.00" value={form.monto} onChange={e => set('monto', e.target.value)}
              className={`flex-1 min-w-0 border-2 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-blue-500 ${errors.monto ? 'border-red-400' : 'border-gray-200'}`} />
          </div>
          {errors.monto && <p className="text-base text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={16} />{errors.monto}</p>}

          <label className="flex items-center text-base font-semibold text-gray-800 mt-4 mb-2">IVA <span className="text-gray-600 font-normal ml-1">(opcional, incluido en el monto)</span><FieldHint text="Si tu recibo o factura desglosa el IVA, captúralo aquí. Va incluido dentro del monto total, no se suma aparte." /></label>
          <input type="number" placeholder="0.00" value={form.iva} onChange={e => set('iva', e.target.value)}
            className={`w-full border-2 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 ${errors.iva ? 'border-red-400' : 'border-gray-200'}`} />
          {errors.iva && <p className="text-base text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={16} />{errors.iva}</p>}
        </div>

        {/* Categoría + Fecha */}
        <div className="bg-white rounded-2xl border border-black shadow-sm p-4 space-y-4">
          <div>
            <label className="flex items-center text-base font-semibold text-gray-800 mb-2">Categoría <span className="text-red-600 ml-1">*</span><FieldHint text="El tipo de gasto que más se parece a lo que compraste: combustible, comida, hospedaje, etc." /></label>
            <select value={form.categoria} onChange={e => set('categoria', e.target.value)}
              className={`w-full border-2 rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:border-blue-500 ${errors.categoria ? 'border-red-400' : 'border-gray-200'}`}>
              <option value="">Selecciona una categoría</option>
              {categoriasActivas.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
            </select>
            {errors.categoria && <p className="text-base text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={16} />{errors.categoria}</p>}
          </div>
          <div>
            <label className="flex items-center text-base font-semibold text-gray-800 mb-2">Fecha del gasto <span className="text-red-600 ml-1">*</span><FieldHint text="La fecha en que realmente se hizo el gasto, no la fecha de hoy." /></label>
            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)}
              className={`w-full border-2 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 ${errors.fecha ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.fecha && <p className="text-base text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={16} />{errors.fecha}</p>}
          </div>
          <div>
            <label className="flex items-center text-base font-semibold text-gray-800 mb-2">Descripción<FieldHint text="Un breve detalle de en qué se gastó, para que tu administrador lo entienda rápido al revisarlo." /></label>
            <textarea placeholder="¿En qué se gastó?" value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              rows={2} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="flex items-center text-base font-semibold text-gray-800 mb-2">Ubicación <span className="text-gray-600 font-normal ml-1">(opcional)</span><FieldHint text="Ciudad o dirección donde ocurrió el gasto. Puedes escribirla o usar el botón para detectarla automáticamente." /></label>
            <div className="flex gap-2">
              <input type="text" placeholder="Ciudad o dirección" value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500" />
              <button type="button" onClick={obtenerUbicacion} disabled={geoLoading}
                className="min-h-11 py-2 flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border-2 border-blue-200 text-blue-700 font-semibold px-3 rounded-xl text-base transition-colors disabled:opacity-50 flex-shrink-0">
                {geoLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                <span className="hidden sm:inline">Mi ubicación</span>
              </button>
            </div>
          </div>
        </div>

        {/* Documentos */}
        <div className="bg-white rounded-2xl border border-black shadow-sm p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-bold text-gray-900">Documentos <span className="text-red-600">*</span></p>
              <p className="text-base text-gray-700 mt-0.5">Sube al menos el recibo o la factura</p>
            </div>
            {form.recibo && (
              <button type="button" onClick={() => handleExtraerRecibo()} disabled={extrayendo}
                className="min-h-11 py-2 flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border-2 border-indigo-200 text-indigo-700 font-semibold px-3 rounded-xl text-base transition-colors disabled:opacity-50 flex-shrink-0">
                {extrayendo ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {extrayendo ? 'Leyendo...' : iaEstado.tipo === 'idle' ? 'Rellenar con IA' : 'Volver a leer'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FileSlot label="Recibo / Ticket" sublabel="Foto o PDF del pago"
              hint="Foto o PDF del ticket o recibo que te dieron al pagar."
              file={form.recibo} preview={form.reciboPreview} esPDF={form.recibo?.type === 'application/pdf'}
              error={errors.recibo} accept=".jpg,.jpeg,.png,.pdf" yaExiste={adjuntosExistentes.recibo}
              onFile={handleFile('recibo', 'reciboPreview')} onRemove={removeFile('recibo', 'reciboPreview')} />
            <FileSlot label="Factura (PDF)" sublabel="Representación impresa"
              hint="La representación impresa de la factura fiscal (CFDI), en PDF."
              file={form.facturaPdf} preview={form.facturaPdfPreview} esPDF
              error={errors.facturaPdf} accept=".pdf" yaExiste={adjuntosExistentes.facturaPdf}
              onFile={handleFile('facturaPdf', 'facturaPdfPreview')} onRemove={removeFile('facturaPdf', 'facturaPdfPreview')} />
            <FileSlot label="Factura (XML)" sublabel="Archivo del CFDI"
              hint="El archivo XML de la factura fiscal (CFDI). Es el documento con validez fiscal, distinto del PDF."
              file={form.facturaXml} preview={form.facturaXmlPreview} esPDF={false}
              error={errors.facturaXml} accept=".xml" yaExiste={adjuntosExistentes.facturaXml}
              onFile={handleFile('facturaXml', 'facturaXmlPreview')} onRemove={removeFile('facturaXml', 'facturaXmlPreview')} />
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3 pb-4">
          <button type="submit" disabled={enviando} className="min-h-12 py-2 inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl text-base shadow-md shadow-blue-200 transition-colors">
            {enviando ? 'Enviando...' : 'Enviar gasto'}
          </button>
          <button type="button" onClick={handleDraft} disabled={enviando}
            className="min-h-12 py-2 inline-flex items-center justify-center w-full bg-white hover:bg-gray-50 active:bg-gray-100 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl text-base disabled:opacity-50 transition-colors">
            Guardar como borrador
          </button>
        </div>
      </form>
    </div>
  )
}
