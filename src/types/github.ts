export interface GitHubUser {
  login: string
  name: string
  avatar_url: string
  public_repos: number
  followers: number
  following: number
  bio: string
  location: string
  html_url: string
  created_at: string
}

export interface Repo {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  updated_at: string
  pushed_at: string
  html_url: string
  private: boolean
  topics: string[]
  default_branch: string
}

export interface PullRequest {
  id: number
  number: number
  title: string
  state: string
  created_at: string
  closed_at: string | null
  merged_at: string | null
  html_url: string
  user: {
    login: string
    avatar_url: string
  }
  base: {
    repo: {
      name: string
      full_name: string
    }
  }
}

export interface Event {
  id: string
  type: string
  created_at: string
  repo: {
    name: string
    url: string
  }
  payload: {
    action?: string
    commits?: { message: string }[]
    pull_request?: {
      title: string
      merged: boolean
    }
    ref?: string
    ref_type?: string
    description?: string
  }
}

export interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface ContributionWeek {
  days: ContributionDay[]
}
