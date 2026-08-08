import { FileX } from 'lucide-react'

export default function EmptyState({ message = 'No hay datos para mostrar' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-600">
      <FileX size={40} className="mb-3 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
