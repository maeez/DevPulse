import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import {
  fetchUserRepos,
  fetchUserEvents,
  fetchUserPullRequests,
  fetchContributions,
  fetchRateLimit,
} from '../api/github'

export const useRepos = () => {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['repos', user?.login],
    queryFn: () => fetchUserRepos(),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}
export const useEvents = () => {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['events', user?.login],
    queryFn: () => fetchUserEvents(user!.login),
    enabled: !!user,
    refetchInterval: 1000 * 60 * 2,
    staleTime: 1000 * 60 * 1,
  })
}

export const usePullRequests = () => {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['prs', user?.login],
    queryFn: () => fetchUserPullRequests(user!.login),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
}

export const useContributions = () => {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['contributions', user?.login],
    queryFn: () => fetchContributions(user!.login),
    enabled: !!user,
    staleTime: 1000 * 60 * 30,
  })
}

export const useRateLimit = () => {
  return useQuery({
    queryKey: ['rateLimit'],
    queryFn: fetchRateLimit,
    refetchInterval: 1000 * 60,
    staleTime: 1000 * 30,
  })
}
