import { BottomNav } from './BottomNav'
import { ToastContainer } from './Toast'

interface AppShellProps {
  children: React.ReactNode
  hideNav?: boolean
}

export function AppShell({ children, hideNav = false }: AppShellProps) {
  return (
    <div className="min-h-screen bg-warm">
      <ToastContainer />
      <main className={`max-w-md mx-auto ${hideNav ? 'pb-4' : 'pb-20'}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
