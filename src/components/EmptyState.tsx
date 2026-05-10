import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
      {icon && (
        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center text-4xl">
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-neutral-700">{title}</h3>
        {description && (
          <p className="text-sm text-neutral-400 max-w-xs">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
