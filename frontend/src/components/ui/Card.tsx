import { cn } from '../../lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn('rounded-2xl transition-all duration-300', className)}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: CardProps) {
  return (
    <div
      className={cn('px-6 py-4', className)}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      {children}
    </div>
  )
}

export function CardBody({ className, children }: CardProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

export function CardTitle({ className, children }: CardProps) {
  return (
    <h3
      className={cn('text-lg font-semibold', className)}
      style={{ color: 'rgba(255,255,255,0.9)' }}
    >
      {children}
    </h3>
  )
}
