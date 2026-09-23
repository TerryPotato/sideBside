import { useState, useRef, useEffect } from 'react'
import { HelpCircle } from 'lucide-react'

// Icono "?" junto a una etiqueta de campo que despliega una burbuja con la
// descripcion de que va en ese campo. Es clic-para-abrir (no solo hover) a
// proposito: en celular no hay hover, y el clic funciona igual en desktop.
export default function FieldHint({ text }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <span className="relative inline-flex align-middle ml-1.5" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Ayuda sobre este campo"
        aria-expanded={open}
        className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${
          open ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
      >
        <HelpCircle size={16} strokeWidth={2.5} />
      </button>
      {open && (
        <div className="absolute z-30 top-full left-0 mt-2 w-60 max-w-[80vw] bg-gray-900 text-white text-base font-normal leading-snug rounded-lg px-3 py-2 shadow-xl">
          {text}
        </div>
      )}
    </span>
  )
}
