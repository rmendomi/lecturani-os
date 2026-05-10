import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Users, TrendingUp, Settings } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/biblioteca', icon: BookOpen, label: 'Biblioteca' },
  { to: '/ninos', icon: Users, label: 'Niños' },
  { to: '/progreso', icon: TrendingUp, label: 'Progreso' },
  { to: '/ajustes', icon: Settings, label: 'Ajustes' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 safe-area-pb z-40">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                active
                  ? 'text-primary'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className={`text-[10px] font-${active ? 'bold' : 'medium'}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
