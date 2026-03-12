import { useEffect, useMemo, useCallback } from 'react'
import { useRepos } from '../hooks/useGitHub'
import { useFilterStore } from '../store/filterStore'
import { RepoCardSkeleton } from '../components/ui/Skeleton'
import { formatRelativeTime, getLanguageColor, isStale } from '../services/utils'
import { Star, GitFork, AlertCircle, ExternalLink, Search, AlertTriangle } from 'lucide-react'
import type { Repo } from '../types/github'

export default function ReposPage() {
  const { data: repos, isLoading } = useRepos()
  const { search, language, sort, showArchived, setSearch, setLanguage, setSort, setShowArchived, syncFromURL } =
    useFilterStore()

  useEffect(() => {
    syncFromURL()
  }, [syncFromURL])

  const languages = useMemo(() => {
    if (!repos) return []
    const langs = repos.map((r) => r.language).filter(Boolean) as string[]
    return ['all', ...Array.from(new Set(langs)).sort()]
  }, [repos])

  const filtered = useMemo(() => {
    if (!repos) return []
    let result = [...repos]
    if (!showArchived) result = result.filter((r) => !r.private)
    if (language !== 'all') result = result.filter((r) => r.language === language)
    if (search) result = result.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()))
    result.sort((a, b) => {
      if (sort === 'stars') return b.stargazers_count - a.stargazers_count
      if (sort === 'forks') return b.forks_count - a.forks_count
      if (sort === 'name') return a.name.localeCompare(b.name)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
    return result
  }, [repos, language, search, sort, showArchived])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }, [setSearch])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Repositories</h1>
        <p className="text-zinc-500 text-sm mt-1">{repos?.length ?? 0} public repositories</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang === 'all' ? 'All languages' : lang}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
        >
          <option value="updated">Recently updated</option>
          <option value="stars">Most stars</option>
          <option value="forks">Most forks</option>
          <option value="name">Name (A–Z)</option>
        </select>

        <label className="flex items-center gap-2 px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 cursor-pointer hover:border-emerald-500 transition-colors select-none">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="accent-emerald-500"
          />
          Show private
        </label>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <RepoCardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <p className="text-xs text-zinc-400">{filtered.length} results</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-zinc-400 text-sm">
              No repositories match your filters.
            </div>
          )}
        </>
      )}
    </div>
  )
}

function RepoCard({ repo }: { repo: Repo }) {
  const stale = isStale(repo.pushed_at)

  return (
    <div className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-zinc-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 min-w-0"
        >
          <span className="truncate">{repo.name}</span>
          <ExternalLink size={11} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
              {stale && (
                    <span title="Stale repo">
                      <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                    </span>
              )}
      </div>

      {repo.description && (
        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{repo.description}</p>
      )}

      {repo.topics?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {repo.topics.slice(0, 3).map((topic) => (
            <span key={topic} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-500/20">
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-auto pt-1">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getLanguageColor(repo.language) }} />
            <span className="text-xs text-zinc-500">{repo.language}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <Star size={11} />
          {repo.stargazers_count}
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <GitFork size={11} />
          {repo.forks_count}
        </div>
        {repo.open_issues_count > 0 && (
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <AlertCircle size={11} />
            {repo.open_issues_count}
          </div>
        )}
        <span className="text-xs text-zinc-400 ml-auto">{formatRelativeTime(repo.updated_at)}</span>
      </div>
    </div>
  )
}
