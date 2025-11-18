import { forwardRef } from 'react'

const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  loading = false,
  icon = null,
  ...props
}, ref) => {

  // Base styles
  const baseStyles = 'inline-flex items-center justify-center font-light transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'

  // Size variants
  const sizes = {
    sm: 'px-2.5 py-1.5 text-lg rounded',
    md: 'px-3 py-2 text-lg rounded',
    lg: 'px-4 py-2.5 text-lg rounded'
  }

  // Color variants
  const variants = {
    primary: 'bg-black text-white hover:bg-gray-800 focus:ring-gray-300 border-0',
    secondary: 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 focus:ring-gray-300',
    success: 'bg-black text-white hover:bg-gray-800 focus:ring-gray-300 border-0',
    danger: 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-300',
    warning: 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 focus:ring-gray-300',
    info: 'bg-black text-white hover:bg-gray-800 focus:ring-gray-300 border-0',
    ghost: 'text-gray-600 hover:bg-gray-50 focus:ring-gray-300 border-0',
    link: 'text-gray-600 hover:text-black underline focus:ring-gray-300 border-0'
  }

  // Combine classes
  const buttonClasses = [
    baseStyles,
    sizes[size],
    variants[variant],
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 stroke-1" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      )}
      {icon && !loading && (
        <span className={children ? 'mr-1.5' : ''}>{icon}</span>
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button