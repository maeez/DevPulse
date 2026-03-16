import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500 mb-6">
          <Zap size={22} className="text-white" />
        </div>
        <p className="text-emerald-500 text-sm font-semibold mb-2">404</p>
        <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-zinc-400 text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  )
}