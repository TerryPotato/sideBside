const variants = {
  ghost: 'bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-600 border border-gray-200',
  ghostOnDark: 'text-blue-200 hover:text-white hover:bg-white/10 active:bg-white/20',
  onImage: 'bg-white/20 hover:bg-white/30 active:bg-white/40 text-white',
  danger: 'bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 border border-red-100',
  success: 'bg-green-100 hover:bg-green-200 active:bg-green-300 text-green-700',
}

const sizes = {
  md: 'w-11 h-11',
  sm: 'w-11 h-11',
}

export default function IconButton({
  icon: Icon, label, onClick, iconSize = 18, variant = 'ghost', size = 'md', rounded = 'rounded-xl',
  disabled = false, type = 'button', className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`${sizes[size]} flex items-center justify-center ${rounded} flex-shrink-0 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${variants[variant] ?? variants.ghost} ${className}`}
    >
      <Icon size={iconSize} />
    </button>
  )
}
