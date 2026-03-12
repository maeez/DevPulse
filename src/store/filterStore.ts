import { create } from 'zustand'

export type SortOption = 'updated' | 'stars' | 'forks' | 'name'
export type LanguageFilter = string | 'all'
export type TimeRange = '7d' | '30d' | '90d' | '1y'

interface FilterState {
  search: string
  language: LanguageFilter
  sort: SortOption
  timeRange: TimeRange
  showArchived: boolean
  setSearch: (search: string) => void
  setLanguage: (language: LanguageFilter) => void
  setSort: (sort: SortOption) => void
  setTimeRange: (timeRange: TimeRange) => void
  setShowArchived: (show: boolean) => void
  syncFromURL: () => void
  syncToURL: () => void
}

const getURLParams = () => {
  const p = new URLSearchParams(window.location.search)
  return {
    search: p.get('search') || '',
    language: (p.get('lang') || 'all') as LanguageFilter,
    sort: (p.get('sort') || 'updated') as SortOption,
    timeRange: (p.get('range') || '30d') as TimeRange,
    showArchived: p.get('archived') === 'true',
  }
}

const pushToURL = (state: Partial<FilterState>) => {
  const p = new URLSearchParams(window.location.search)
  if (state.search !== undefined) state.search ? p.set('search', state.search) : p.delete('search')
  if (state.language !== undefined) state.language !== 'all' ? p.set('lang', state.language) : p.delete('lang')
  if (state.sort !== undefined) state.sort !== 'updated' ? p.set('sort', state.sort) : p.delete('sort')
  if (state.timeRange !== undefined) state.timeRange !== '30d' ? p.set('range', state.timeRange) : p.delete('range')
  if (state.showArchived !== undefined) state.showArchived ? p.set('archived', 'true') : p.delete('archived')
  const newURL = `${window.location.pathname}${p.toString() ? '?' + p.toString() : ''}`
  window.history.replaceState({}, '', newURL)
}

export const useFilterStore = create<FilterState>()((set, get) => ({
  search: '',
  language: 'all',
  sort: 'updated',
  timeRange: '30d',
  showArchived: false,

  setSearch: (search) => {
    set({ search })
    pushToURL({ search })
  },
  setLanguage: (language) => {
    set({ language })
    pushToURL({ language })
  },
  setSort: (sort) => {
    set({ sort })
    pushToURL({ sort })
  },
  setTimeRange: (timeRange) => {
    set({ timeRange })
    pushToURL({ timeRange })
  },
  setShowArchived: (showArchived) => {
    set({ showArchived })
    pushToURL({ showArchived })
  },
  syncFromURL: () => {
    const params = getURLParams()
    set(params)
  },
  syncToURL: () => {
    const state = get()
    pushToURL(state)
  },
}))
