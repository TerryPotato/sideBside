export default function ConfirmModal({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel, cancelLabel = 'Cancelar' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6 z-10">
        <h3 className="text-base font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-base text-gray-700 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="min-h-11 py-2 flex-1 border border-gray-300 text-gray-700 font-medium rounded-xl text-base hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-white font-medium py-2 rounded-lg text-base transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
