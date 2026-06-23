import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className, id, style, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn('w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-200 focus:outline-none', className)}
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: error ? '1px solid rgba(244,63,94,0.6)' : '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.9)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = '1px solid rgba(99,102,241,0.7)'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2), inset 0 1px 3px rgba(0,0,0,0.2)'
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = error ? '1px solid rgba(244,63,94,0.6)' : '1px solid rgba(255,255,255,0.1)'
          e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.2)'
          props.onBlur?.(e)
        }}
        {...props}
      />
      {error && <p style={{ fontSize: 12, color: '#fca5a5' }}>{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
