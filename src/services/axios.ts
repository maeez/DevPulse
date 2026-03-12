import axios from 'axios'

export const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
  },
})

export const setAuthToken = (token: string) => {
  githubApi.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export const clearAuthToken = () => {
  delete githubApi.defaults.headers.common['Authorization']
}
