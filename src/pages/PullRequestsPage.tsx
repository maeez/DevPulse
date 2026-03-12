import { useMemo } from 'react'
import { usePullRequests } from '../hooks/useGitHub'
import { RepoCardSkeleton } from '../components/ui/Skeleton'
import { formatRelativeTime, formatDate, getPRCycleTime } from '../services/utils'
import { GitPullRequest, GitMerge, XCircle, Clock, ExternalLink } from 'lucide-react'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function PullRequestsPage() {
  const { data: prs, isLoading } = usePullRequests()

  const stats = useMemo(() => {
    if (!prs) return null
    const merged = prs.filter((p) => p.merged_at)
    const closed = prs.filter((p) => p.closed_at && !p.merged_at)
    const open = prs.filter((p) => !p.closed_at)
    const cycleTimes = merged.map(getPRCycleTime).filter((t): t is number => t !== null)
    const avgCycleTime = cycleTimes.length
      ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length)
      : 0
    return { merged: merged.length, closed: closed.length, open: open.length, avgCycleTime }
  }, [prs])

  const scatterData = useMemo(() => {
    if (!prs) return []
    return prs
      .filter((p) => p.merged_at || p.closed_at)
      .slice(0, 30)
      .map((pr, i) => ({
        x: i + 1,
        y: getPRCycleTime(pr) ?? 0,
        title: pr.title,
        merged: !!pr.merged_at,
      }))
  }, [prs])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Pull Requests</h1>
        <p className="text-zinc-500 text-sm mt-1">Your last 50 pull requests across all repositories</p>
      </div>

      {!isLoading && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Merged', value: stats.merged, icon: GitMerge, color: 'text-emerald-500' },
            { label: 'Closed', value: stats.closed, icon: XCircle, color: 'text-red-500' },
            { label: 'Open', value: stats.open, icon: GitPullRequest, color: 'text-blue-500' },
            { label: 'Avg Cycle Time', value: `${stats.avgCycleTime}h`, icon: Clock, color: 'text-violet-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">{label}</span>
                <Icon size={13} className={color} />
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      )}

      {!isLoading && scatterData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Cycle Time Distribution</h2>
          <p className="text-xs text-zinc-400 mb-4">Hours from open to close/merge — last 30 PRs</p>
          <ResponsiveContainer width="100%" height={180}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} label={{ value: 'PR #', position: 'insideBottom', fill: '#71717a', fontSize: 11 }} />
              <YAxis dataKey="y" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} label={{ value: 'Hours', angle: -90, fill: '#71717a', fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs max-w-48">
                      <p className="text-white font-medium truncate">{d.title}</p>
                      <p className="text-zinc-400 mt-1">{d.y}h · {d.merged ? 'Merged' : 'Closed'}</p>
                    </div>
                  )
                }}
              />
              <Scatter
                data={scatterData}
                fill="#10b981"
                opacity={0.8}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl divide-y divide-zinc-100 dark:divide-zinc-800">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4">
                <RepoCardSkeleton />
              </div>
            ))
          : prs?.map((pr) => {
              const cycleTime = getPRCycleTime(pr)
              const isMerged = !!pr.merged_at
              const isOpen = !pr.closed_at

              return (
                <div key={pr.id} className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <div className={`mt-0.5 p-1.5 rounded-full ${isMerged ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : isOpen ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                    {isMerged ? <GitMerge size={13} /> : <GitPullRequest size={13} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <a
                      href={pr.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-zinc-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 group"
                    >
                      <span className="truncate">{pr.title}</span>
                      <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                    </a>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-zinc-400 font-mono">{pr.base.repo.name}</span>
                      <span className="text-xs text-zinc-400">#{pr.number}</span>
                      <span className="text-xs text-zinc-400">{formatDate(pr.created_at)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {cycleTime !== null && (
                      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{cycleTime}h</p>
                    )}
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {isOpen ? 'Open' : isMerged ? `Merged ${formatRelativeTime(pr.merged_at!)}` : `Closed ${formatRelativeTime(pr.closed_at!)}`}
                    </p>
                  </div>
                </div>
              )
            })}
      </div>
    </div>
  )
}
