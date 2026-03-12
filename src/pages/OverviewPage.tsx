import { useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import { useRepos, useEvents, usePullRequests, useContributions } from '../hooks/useGitHub'
import { StatCardSkeleton, HeatmapSkeleton, EventSkeleton } from '../components/ui/Skeleton'
import { formatRelativeTime, isStale, getLanguageColor, getPRCycleTime } from '../services/utils'
import { GitPullRequest, Star, BookMarked, AlertTriangle, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CONTRIBUTION_LEVELS = [
  'bg-zinc-100 dark:bg-zinc-800',
  'bg-emerald-200 dark:bg-emerald-900',
  'bg-emerald-300 dark:bg-emerald-700',
  'bg-emerald-400 dark:bg-emerald-500',
  'bg-emerald-500 dark:bg-emerald-400',
]

export default function OverviewPage() {
  const { user } = useAuthStore()
  const { data: repos, isLoading: reposLoading } = useRepos()
  const { data: events, isLoading: eventsLoading } = useEvents()
  const { data: prs, isLoading: prsLoading } = usePullRequests()
  const { data: contributions, isLoading: contribLoading } = useContributions()

  const stats = useMemo(() => {
    if (!repos || !prs) return null
    const totalStars = repos.reduce((a, r) => a + r.stargazers_count, 0)
    const staleRepos = repos.filter((r) => isStale(r.pushed_at)).length
    const mergedPRs = prs.filter((p) => p.merged_at).length
    const cycleTimes = prs
      .map(getPRCycleTime)
      .filter((t): t is number => t !== null)
    const avgCycleTime = cycleTimes.length
      ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length)
      : 0
    return { totalStars, staleRepos, mergedPRs, avgCycleTime }
  }, [repos, prs])

  const prChartData = useMemo(() => {
    if (!prs) return []
    const last8Weeks: Record<string, { merged: number; closed: number }> = {}
    const now = new Date()
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      const key = `W${8 - i}`
      last8Weeks[key] = { merged: 0, closed: 0 }
    }
    prs.forEach((pr) => {
      const end = pr.merged_at || pr.closed_at
      if (!end) return
      const endDate = new Date(end)
      const diffWeeks = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
      if (diffWeeks >= 0 && diffWeeks < 8) {
        const key = `W${8 - diffWeeks}`
        if (last8Weeks[key]) {
          if (pr.merged_at) last8Weeks[key].merged++
          else last8Weeks[key].closed++
        }
      }
    })
    return Object.entries(last8Weeks).map(([week, val]) => ({ week, ...val }))
  }, [prs])

  const getContribLevel = (count: number): number => {
    if (count === 0) return 0
    if (count <= 2) return 1
    if (count <= 5) return 2
    if (count <= 9) return 3
    return 4
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0] || user?.login}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Here's what's happening with your GitHub activity.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reposLoading || prsLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : [
              {
                label: 'Total Stars',
                value: stats?.totalStars ?? 0,
                icon: Star,
                color: 'text-yellow-500',
                sub: `across ${repos?.length ?? 0} repos`,
              },
              {
                label: 'Public Repos',
                value: user?.public_repos ?? 0,
                icon: BookMarked,
                color: 'text-blue-500',
                sub: `${stats?.staleRepos ?? 0} stale repos`,
              },
              {
                label: 'PRs Merged',
                value: stats?.mergedPRs ?? 0,
                icon: GitPullRequest,
                color: 'text-emerald-500',
                sub: 'last 50 PRs',
              },
              {
                label: 'Avg Cycle Time',
                value: stats?.avgCycleTime ? `${stats.avgCycleTime}h` : '—',
                icon: TrendingUp,
                color: 'text-violet-500',
                sub: 'PR open → close',
              },
            ].map(({ label, value, icon: Icon, color, sub }) => (
              <div
                key={label}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-zinc-500">{label}</span>
                  <Icon size={14} className={color} />
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
                <p className="text-xs text-zinc-400 mt-1">{sub}</p>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">PR Activity (last 8 weeks)</h2>
          {prsLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-pulse text-zinc-400 text-sm">Loading chart...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={prChartData} barGap={2}>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} width={20} />
                <Tooltip
                  contentStyle={{
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="merged" fill="#10b981" radius={[3, 3, 0, 0]} name="Merged" />
                <Bar dataKey="closed" fill="#3f3f46" radius={[3, 3, 0, 0]} name="Closed" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-0 overflow-y-auto max-h-48">
            {eventsLoading
              ? Array.from({ length: 4 }).map((_, i) => <EventSkeleton key={i} />)
              : events?.slice(0, 8).map((event) => (
                  <div
                    key={event.id}
                    className="flex gap-2.5 py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
                        {event.type.replace('Event', '')} on{' '}
                        <span className="font-medium">{event.repo.name.split('/')[1]}</span>
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">{formatRelativeTime(event.created_at)}</p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {contribLoading ? (
        <HeatmapSkeleton />
      ) : contributions ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Contribution Activity</h2>
            <span className="text-xs text-zinc-500">{contributions.total} contributions this year</span>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {contributions.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.contributionDays.map((day, di) => (
                    <div
                      key={di}
                      title={`${day.date}: ${day.contributionCount} contributions`}
                      className={`w-3 h-3 rounded-sm ${CONTRIBUTION_LEVELS[getContribLevel(day.contributionCount)]} cursor-pointer hover:ring-1 hover:ring-emerald-400 transition-all`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-xs text-zinc-400">Less</span>
            {CONTRIBUTION_LEVELS.map((cls, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
            ))}
            <span className="text-xs text-zinc-400">More</span>
          </div>
        </div>
      ) : null}

      {repos && repos.some((r) => isStale(r.pushed_at)) && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Stale Repositories</h2>
            <span className="text-xs text-zinc-500">— not pushed to in 3+ months</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {repos
              .filter((r) => isStale(r.pushed_at))
              .slice(0, 6)
              .map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 hover:border-amber-400 dark:hover:border-amber-500/40 transition-colors"
                >
                  {repo.language && (
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: getLanguageColor(repo.language) }}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 truncate">{repo.name}</p>
                    <p className="text-xs text-zinc-400">{formatRelativeTime(repo.pushed_at)}</p>
                  </div>
                </a>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
