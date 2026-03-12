import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, GitPullRequest, BookMarked, Activity, LogOut, Sun, Moon, Zap, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { cn } from '../../services/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/repos', icon: BookMarked, label: 'Repositories' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/pull-requests', icon: GitPullRequest, label: 'Pull Requests' },
]

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="w-60 h-screen flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
      <div className="px-5 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-zinc-900 dark:text-white tracking-tight text-lg">DevPulse</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="px-3 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-2">
          <img
            src={user?.avatar_url}
            alt={user?.login}
            className="w-8 h-8 rounded-full ring-2 ring-emerald-500/30"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
              {user?.name || user?.login}
            </p>
            <p className="text-xs text-zinc-500 truncate">@{user?.login}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-200 dark:border-zinc-800 space-y-0.5">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white transition-all"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <LogOut size={16} />
          Disconnect
        </button>
      </div>
    </aside>
  )
}