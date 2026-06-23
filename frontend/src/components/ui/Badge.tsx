import { cn } from '../../lib/utils'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  default: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.6)',
  },
  success: {
    background: 'rgba(16,185,129,0.15)',
    border: '1px solid rgba(16,185,129,0.35)',
    color: '#6ee7b7',
    boxShadow: '0 0 10px rgba(16,185,129,0.2)',
  },
  warning: {
    background: 'rgba(245,158,11,0.15)',
    border: '1px solid rgba(245,158,11,0.35)',
    color: '#fcd34d',
    boxShadow: '0 0 10px rgba(245,158,11,0.2)',
  },
  danger: {
    background: 'rgba(244,63,94,0.15)',
    border: '1px solid rgba(244,63,94,0.35)',
    color: '#fca5a5',
    boxShadow: '0 0 10px rgba(244,63,94,0.2)',
  },
  info: {
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.35)',
    color: '#a5b4fc',
    boxShadow: '0 0 10px rgba(99,102,241,0.2)',
  },
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', className)}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  )
}
