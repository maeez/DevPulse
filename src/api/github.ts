import { githubApi } from '../services/axios'
import type { GitHubUser } from '../types/github'
import type {Repo} from '../types/github'
import type {PullRequest} from '../types/github'
import type {Event} from '../types/github'


export const fetchAuthenticatedUser = async (): Promise<GitHubUser> => {
  const { data } = await githubApi.get('/user')
  return data
}

export const fetchUserRepos = async (): Promise<Repo[]> => {
  const { data } = await githubApi.get('/user/repos', {
    params: { per_page: 100, sort: 'updated', visibility: 'all', affiliation: 'owner' },
  })
  return data
}

export const fetchUserEvents = async (username: string): Promise<Event[]> => {
  const { data } = await githubApi.get(`/users/${username}/events`, {
    params: { per_page: 30 },
  })
  return data
}

export const fetchUserPullRequests = async (username: string): Promise<PullRequest[]> => {
  const { data } = await githubApi.get('/search/issues', {
    params: {
      q: `author:${username} type:pr`,
      sort: 'created',
      order: 'desc',
      per_page: 50,
    },
  })
  return data.items
}

export const fetchContributions = async (username: string): Promise<{ total: number; weeks: { contributionDays: { contributionCount: number; date: string }[] }[] }> => {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `
  const { data } = await githubApi.post(
    '/graphql',
    { query, variables: { username } },
    { headers: { 'Content-Type': 'application/json' } }
  )
  const cal = data?.data?.user?.contributionsCollection?.contributionCalendar
  return {
    total: cal?.totalContributions ?? 0,
    weeks: cal?.weeks ?? [],
  }
}

export const fetchRateLimit = async () => {
  const { data } = await githubApi.get('/rate_limit')
  return data.rate
}
