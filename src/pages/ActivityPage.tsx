import { useEvents } from '../hooks/useGitHub'
import { EventSkeleton } from '../components/ui/Skeleton'
import { formatRelativeTime } from '../services/utils'
import type { Event } from '../types/github'
import { GitCommit, GitPullRequest, Star, GitFork, AlertCircle, Tag, FileCode, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'

const EVENT_ICONS: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  PushEvent: { icon: GitCommit, color: 'text-blue-500', label: 'Pushed to' },
  PullRequestEvent: { icon: GitPullRequest, color: 'text-violet-500', label: 'Pull request on' },
  WatchEvent: { icon: Star, color: 'text-yellow-500', label: 'Starred' },
  ForkEvent: { icon: GitFork, color: 'text-emerald-500', label: 'Forked' },
  IssuesEvent: { icon: AlertCircle, color: 'text-red-500', label: 'Issue on' },
  CreateEvent: { icon: Tag, color: 'text-emerald-500', label: 'Created' },
  DeleteEvent: { icon: FileCode, color: 'text-red-400', label: 'Deleted on' },
}

const getEventDescription = (event: Event): string => {
  const repoName = event.repo.name.split('/')[1]
  switch (event.type) {
    case 'PushEvent':
      return `Pushed ${event.payload.commits?.length ?? 1} commit(s) to ${repoName}`
    case 'PullRequestEvent':
      return `${event.payload.action} PR: ${event.payload.pull_request?.title ?? ''} on ${repoName}`
    case 'WatchEvent':
      return `Starred ${repoName}`
    case 'ForkEvent':
      return `Forked ${repoName}`
    case 'CreateEvent':
      return `Created ${event.payload.ref_type} ${event.payload.ref ? `"${event.payload.ref}"` : ''} in ${repoName}`
    case 'IssuesEvent':
      return `${event.payload.action} issue on ${repoName}`
    default:
      return `${event.type.replace('Event', '')} on ${repoName}`
  }
}

export default function ActivityPage() {
  const { data: events, isLoading, isFetching, dataUpdatedAt } = useEvents()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['events', user?.login] })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Activity Feed</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Live feed — auto refreshes every 2 minutes
            {dataUpdatedAt ? ` · Last updated ${formatRelativeTime(new Date(dataUpdatedAt).toISOString())}` : ''}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 disabled:opacity-50 transition-all"
        >
          <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl divide-y divide-zinc-100 dark:divide-zinc-800">
        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="px-5">
                <EventSkeleton />
              </div>
            ))
          : events?.map((event) => {
              const meta = EVENT_ICONS[event.type] ?? { icon: FileCode, color: 'text-zinc-400', label: 'Activity on' }
              const Icon = meta.icon
              return (
                <div key={event.id} className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <div className={`mt-0.5 p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${meta.color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-800 dark:text-zinc-200">
                      {getEventDescription(event)}
                    </p>
                    {event.type === 'PushEvent' && event.payload.commits?.[0] && (
                      <p className="text-xs text-zinc-400 mt-0.5 truncate font-mono">
                        {event.payload.commits[0].message}
                      </p>
                    )}
                    <p className="text-xs text-zinc-400 mt-1">{formatRelativeTime(event.created_at)}</p>
                  </div>
                  <a
                    href={`https://github.com/${event.repo.name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-400 hover:text-emerald-500 transition-colors shrink-0 font-mono"
                  >
                    {event.repo.name.split('/')[1]}
                  </a>
                </div>
              )
            })}
      </div>
    </div>
  )
}
