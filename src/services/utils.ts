import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`
  return `${Math.floor(diff / 31536000)}y ago`
}

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const isStale = (dateStr: string, months = 3): boolean => {
  const date = new Date(dateStr)
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)
  return date < cutoff
}

export const getLanguageColor = (language: string | null): string => {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Rust: '#dea584',
    Go: '#00ADD8',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    CSS: '#563d7c',
    HTML: '#e34c26',
    Ruby: '#701516',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Shell: '#89e051',
    Vue: '#41b883',
    Svelte: '#ff3e00',
  }
  return colors[language ?? ''] ?? '#8b8b8b'
}

export const getPRCycleTime = (pr: { created_at: string; merged_at: string | null; closed_at: string | null }): number | null => {
  const end = pr.merged_at || pr.closed_at
  if (!end) return null
  const diff = new Date(end).getTime() - new Date(pr.created_at).getTime()
  return Math.round(diff / (1000 * 60 * 60))
}
