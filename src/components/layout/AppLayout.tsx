// import { Outlet } from 'react-router-dom'
// import Sidebar from './Sidebar'
// import { useRateLimit } from '../../hooks/useGitHub'

// export default function AppLayout() {
//   const { data: rateLimit } = useRateLimit()

//   return (
//     <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
//       <Sidebar />
//       <div className="flex-1 flex flex-col min-w-0">
//         {rateLimit && rateLimit.remaining < 20 && (
//           <div className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 px-6 py-2 text-xs text-amber-700 dark:text-amber-400">
//             GitHub API rate limit low: {rateLimit.remaining} / {rateLimit.limit} requests remaining
//           </div>
//         )}
//         <main className="flex-1 px-8 py-8 max-w-6xl w-full mx-auto">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   )
// }


import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useRateLimit } from '../../hooks/useGitHub'

export default function AppLayout() {
  const { data: rateLimit } = useRateLimit()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-30 lg:static lg:block transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="font-bold text-zinc-900 dark:text-white">DevPulse</span>
        </div>

        {rateLimit && rateLimit.remaining < 20 && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 px-6 py-2 text-xs text-amber-700 dark:text-amber-400">
            GitHub API rate limit low: {rateLimit.remaining} / {rateLimit.limit} requests remaining
          </div>
        )}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}