import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useRateLimit } from '../../hooks/useGitHub'

export default function AppLayout() {
  const { data: rateLimit } = useRateLimit()

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {rateLimit && rateLimit.remaining < 20 && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 px-6 py-2 text-xs text-amber-700 dark:text-amber-400">
            GitHub API rate limit low: {rateLimit.remaining} / {rateLimit.limit} requests remaining
          </div>
        )}
        <main className="flex-1 px-8 py-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
