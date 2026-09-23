import { useEffect, useState } from 'react'
import { ImageOff, Loader2 } from 'lucide-react'
import { getComprobanteBlobUrl } from '../api/client'

// GET /api/gastos/:id/comprobante exige Authorization, asi que un <img
// src="..."> plano no funciona: hay que traer la imagen como blob.
export default function ComprobanteImage({ gastoId, className, emptyLabel = 'Sin comprobante' }) {
  const [url, setUrl] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let blobUrl
    let cancelado = false
    setError(false)
    setUrl(null)

    getComprobanteBlobUrl(gastoId)
      .then(u => {
        if (cancelado) { URL.revokeObjectURL(u); return }
        blobUrl = u
        setUrl(u)
      })
      .catch(() => !cancelado && setError(true))

    return () => {
      cancelado = true
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [gastoId])

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 text-gray-700">
        <ImageOff size={32} className="opacity-40" />
        <p className="text-sm opacity-50">{emptyLabel}</p>
      </div>
    )
  }

  if (!url) {
    return <Loader2 size={28} className="text-gray-400 animate-spin" />
  }

  return <img src={url} alt="comprobante" className={className ?? 'max-h-full max-w-full object-contain'} />
}
