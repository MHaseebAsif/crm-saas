import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    border: '1px solid rgba(99,102,241,0.5)',
    color: '#fff',
    boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
  },
  secondary: {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.8)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  danger: {
    background: 'linear-gradient(135deg, #be123c, #f43f5e)',
    border: '1px solid rgba(244,63,94,0.5)',
    color: '#fff',
    boxShadow: '0 4px 16px rgba(244,63,94,0.3)',
  },
  ghost: {
    background: 'transparent',
    border: '1px solid transparent',
    color: 'rgba(255,255,255,0.6)',
  },
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-sm gap-2',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, style, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none'

    return (
      <button
        ref={ref}
        className={cn(base, sizeClasses[size], className)}
        disabled={disabled || loading}
        style={{
          ...variantStyles[variant],
          ...style,
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget
          if (variant === 'primary') el.style.boxShadow = '0 6px 24px rgba(99,102,241,0.55)'
          if (variant === 'danger')  el.style.boxShadow = '0 6px 24px rgba(244,63,94,0.55)'
          if (variant === 'secondary') el.style.background = 'rgba(255,255,255,0.12)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget
          if (variant === 'primary') el.style.boxShadow = '0 4px 16px rgba(99,102,241,0.3)'
          if (variant === 'danger')  el.style.boxShadow = '0 4px 16px rgba(244,63,94,0.3)'
          if (variant === 'secondary') el.style.background = 'rgba(255,255,255,0.07)'
        }}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
export default Button
