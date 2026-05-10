import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToast, type Toast as ToastType } from '@/contexts/ToastContext'

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useToast()

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  }

  const styles = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
  }

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-card animate-slide-up ${styles[toast.type]}`}>
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium text-neutral-700">{toast.message}</p>
      <button onClick={() => removeToast(toast.id)} className="text-neutral-400 hover:text-neutral-600 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 max-w-sm mx-auto">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
