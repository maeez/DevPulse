import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { fetchAuthenticatedUser } from '../api/github'
import { setAuthToken } from '../services/axios'
import { Zap, Key, ExternalLink } from 'lucide-react'

const GITHUB_TOKEN_URL = 'https://github.com/settings/tokens/new'

const DEMO_TOKEN = import.meta.env.VITE_DEMO_TOKEN ?? ''

export default function LoginPage() {
  const [token, setToken] = useState(DEMO_TOKEN)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setToken: saveToken, setUser } = useAuthStore()

  const handleSubmit = async () => {
    if (!token.trim()) return
    setLoading(true)
    setError('')
    try {
      setAuthToken(token)
      const user = await fetchAuthenticatedUser()
      saveToken(token)
      setUser(user)
    } catch {
      setError('Invalid token. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500 mb-5">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">DevPulse</h1>
          <p className="text-zinc-400 mt-2 text-sm">GitHub productivity, at a glance</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
          <div className="flex items-center gap-2 mb-5">
            <Key size={15} className="text-zinc-400" />
            <h2 className="text-white text-sm font-semibold">Personal Access Token</h2>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-emerald-500 transition-colors"
            />

            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !token.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Verifying...' : 'Connect to GitHub'}
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-zinc-800">
            <p className="text-zinc-500 text-xs mb-3">
              Required token scopes:
            </p>
            <div className="flex gap-2 mb-4">
              {['repo', 'read:user', 'read:org'].map((scope) => (
                <span
                  key={scope}
                  className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-md border border-zinc-700 font-mono"
                >
                  {scope}
                </span>
              ))}
            </div>
            <a
              href={GITHUB_TOKEN_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <ExternalLink size={11} />
              Generate token on GitHub
            </a>
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          Your token is stored locally and never sent to any server.
        </p>
      </div>
    </div>
  )
}
