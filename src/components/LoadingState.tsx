interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingState({ message = 'Cargando...', size = 'md' }: LoadingStateProps) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className={`${sizes[size]} rounded-full border-accent border-t-primary animate-spin`} />
      <p className="text-neutral-500 text-sm font-medium">{message}</p>
    </div>
  )
}

export function FullPageLoading({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-warm flex items-center justify-center">
      <LoadingState size="lg" message={message} />
    </div>
  )
}
