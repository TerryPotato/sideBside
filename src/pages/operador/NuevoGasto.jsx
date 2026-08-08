import { useState } from 'react'
import { Upload, X, AlertCircle, MapPin, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useData } from '../../context/DataContext'
import { useAuth } from '../../context/AuthContext'

const categorias = ['Comida', 'Combustible', 'Peaje', 'Mantenimiento', 'Hospedaje', 'Transporte', 'Otros']
const monedas = [{ val: 'MXN', label: 'MXN — Peso mexicano' }, { val: 'USD', label: 'USD — Dólar' }, { val: 'EUR', label: 'EUR — Euro' }]

const empty = {
  viaje_id: '', monto: '', moneda: 'MXN', categoria: '', descripcion: '', fecha: '', ubicacion: '',
  recibo: null, reciboPreview: null,
  factura: null, facturaPreview: null,
}

function FileSlot({ label, sublabel, file, preview, esPDF, error, onFile, onRemove, accept }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-0.5">{label}</p>
      {sublabel && <p className="text-sm text-gray-500 mb-2">{sublabel}</p>}
      {file ? (
        <div className="border-2 border-blue-200 bg-blue-50 rounded-xl p-3 flex items-center gap-3">
          {preview
            ? <img src={preview} alt="vista previa" className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-gray-200" />
            : <div className="w-14 h-14 bg-white rounded-lg flex flex-col items-center justify-center flex-shrink-0 border border-gray-200">
                <span className="text-xs font-bold text-gray-500">{esPDF ? 'PDF' : 'XML'}</span>
              </div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(0)} KB · Listo para enviar</p>
          </div>
          <button type="button" onClick={onRemove} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 hover:text-red-500 hover:bg-red-50 active:bg-red-100 border border-gray-200 flex-shrink-0 transition-colors">
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 cursor-pointer active:bg-gray-50 transition-colors ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
          <Upload size={22} className={`mb-2 ${error ? 'text-red-400' : 'text-gray-600'}`} />
          <p className="text-sm font-medium text-gray-700 text-center">Toca para subir</p>
          <p className="text-sm text-gray-600 mt-0.5">{accept.replace(/\./g, '').replace(/,/g, ', ').toUpperCase()}</p>
          <input type="file" accept={accept} className="hidden" onChange={onFile} />
        </label>
      )}
      {error && <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
    </div>
  )
}

export default function NuevoGasto() {
  const { user } = useAuth()
  const { viajes, agregarGasto, saveDraft } = useData()
  const usuarioId = 1
  const viajesActivos = viajes.filter(v => v.usuario_id === usuarioId && v.estado === 'activo')

  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [geoLoading, setGeoLoading] = useState(false)

  function handleFile(campo, previewCampo) {
    return (e) => {
      const file = e.target.files[0]
      if (!file) return
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      setForm(f => ({ ...f, [campo]: file, [previewCampo]: preview }))
      setErrors(er => ({ ...er, [campo]: '' }))
    }
  }

  function removeFile(campo, previewCampo) {
    return () => {
      if (form[previewCampo]) URL.revokeObjectURL(form[previewCampo])
      setForm(f => ({ ...f, [campo]: null, [previewCampo]: null }))
    }
  }

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(er => ({ ...er, [field]: '' }))
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

  function validate() {
    const e = {}
    if (!form.viaje_id) e.viaje_id = 'Selecciona el viaje'
    if (!form.monto || Number(form.monto) <= 0) e.monto = 'Ingresa un monto válido'
    if (!form.categoria) e.categoria = 'Selecciona una categoría'
    if (!form.fecha) e.fecha = 'Selecciona la fecha'
    if (!form.recibo && !form.factura) e.recibo = 'Sube al menos el recibo o la factura'
    return e
  }

  function handleDraft() {
    saveDraft({ ...form, empleado: user?.nombre ?? 'Carlos López', usuario_id: usuarioId, guardado_en: new Date().toISOString() })
    toast('Borrador guardado', { icon: '📋' })
    setForm(empty)
    setErrors({})
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); toast.error('Completa los campos requeridos'); return }
    agregarGasto({
      viaje_id: Number(form.viaje_id),
      usuario_id: usuarioId,
      empleado: user?.nombre ?? 'Carlos López',
      categoria: form.categoria,
      descripcion: form.descripcion,
      monto: Number(form.monto),
      moneda: form.moneda,
      fecha: form.fecha,
      ubicacion: form.ubicacion,
      estado: 'Pendiente',
      preview: form.reciboPreview ?? form.facturaPreview,
    })
    toast.success('Gasto enviado correctamente')
    setForm(empty)
    setErrors({})
  }

  if (viajesActivos.length === 0) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
          <AlertCircle size={32} className="text-yellow-500" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 mb-1">Sin viajes activos</p>
          <p className="text-sm text-gray-500 max-w-xs">Pide a tu administrador que te asigne un viaje antes de registrar gastos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Nuevo Gasto</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Viaje */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <label className="block text-sm font-semibold text-gray-800 mb-2">Viaje <span className="text-red-500">*</span></label>
          <select value={form.viaje_id} onChange={e => set('viaje_id', e.target.value)}
            className={`w-full border-2 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-blue-500 ${errors.viaje_id ? 'border-red-400' : 'border-gray-200'}`}>
            <option value="">Selecciona tu viaje</option>
            {viajesActivos.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
          </select>
          {errors.viaje_id && <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{errors.viaje_id}</p>}
        </div>

        {/* Monto + Moneda */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <label className="block text-sm font-semibold text-gray-800 mb-2">Monto <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <select value={form.moneda} onChange={e => set('moneda', e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:border-blue-500 w-28 flex-shrink-0">
              {monedas.map(m => <option key={m.val} value={m.val}>{m.val}</option>)}
            </select>
            <input type="number" placeholder="0.00" value={form.monto} onChange={e => set('monto', e.target.value)}
              className={`flex-1 min-w-0 border-2 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-blue-500 ${errors.monto ? 'border-red-400' : 'border-gray-200'}`} />
          </div>
          {errors.monto && <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{errors.monto}</p>}
        </div>

        {/* Categoría + Fecha */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Categoría <span className="text-red-500">*</span></label>
            <select value={form.categoria} onChange={e => set('categoria', e.target.value)}
              className={`w-full border-2 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-blue-500 ${errors.categoria ? 'border-red-400' : 'border-gray-200'}`}>
              <option value="">Selecciona una categoría</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.categoria && <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{errors.categoria}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Fecha del gasto <span className="text-red-500">*</span></label>
            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)}
              className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 ${errors.fecha ? 'border-red-400' : 'border-gray-200'}`} />
            {errors.fecha && <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={12} />{errors.fecha}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Descripción</label>
            <textarea placeholder="¿En qué se gastó?" value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              rows={2} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Ubicación <span className="text-gray-600 font-normal">(opcional)</span></label>
            <div className="flex gap-2">
              <input type="text" placeholder="Ciudad o dirección" value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)}
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
              <button type="button" onClick={obtenerUbicacion} disabled={geoLoading}
                className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border-2 border-blue-200 text-blue-700 font-semibold px-3 py-3 rounded-xl text-sm transition-colors disabled:opacity-50 flex-shrink-0">
                {geoLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                <span className="hidden sm:inline">Mi ubicación</span>
              </button>
            </div>
          </div>
        </div>

        {/* Documentos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
          <div>
            <p className="text-sm font-bold text-gray-900">Documentos <span className="text-red-500">*</span></p>
            <p className="text-sm text-gray-500 mt-0.5">Sube al menos el recibo o la factura</p>
          </div>
          <FileSlot label="Recibo / Ticket" sublabel="Foto o PDF del comprobante de pago"
            file={form.recibo} preview={form.reciboPreview} esPDF={form.recibo?.type === 'application/pdf'}
            error={errors.recibo} accept=".jpg,.jpeg,.png,.pdf"
            onFile={handleFile('recibo', 'reciboPreview')} onRemove={removeFile('recibo', 'reciboPreview')} />
          <FileSlot label="Factura" sublabel="PDF o XML de la factura fiscal"
            file={form.factura} preview={form.facturaPreview} esPDF={!form.facturaPreview}
            error={errors.factura} accept=".jpg,.jpeg,.png,.pdf,.xml"
            onFile={handleFile('factura', 'facturaPreview')} onRemove={removeFile('factura', 'facturaPreview')} />
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3 pb-4">
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 rounded-2xl text-base shadow-md shadow-blue-200 transition-colors">
            Enviar gasto
          </button>
          <button type="button" onClick={handleDraft}
            className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 border-2 border-gray-300 text-gray-700 font-semibold py-4 rounded-2xl text-base transition-colors">
            Guardar como borrador
          </button>
        </div>
      </form>
    </div>
  )
}
