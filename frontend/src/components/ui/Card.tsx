import { cn } from '../../lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('bg-slate-800 border border-slate-700 rounded-xl', className)}>{children}</div>
  )
}

export function CardHeader({ className, children }: CardProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-slate-700', className)}>{children}</div>
  )
}

export function CardBody({ className, children }: CardProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

export function CardTitle({ className, children }: CardProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-slate-100', className)}>{children}</h3>
  )
}
