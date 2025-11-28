import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Users, WifiOff } from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState('')

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const startHost = () => {
    const code = generateCode()
    navigate({ to: '/tracker', search: { mode: 'host', code } })
  }

  const joinSession = () => {
    if (joinCode.length === 6) {
      navigate({ to: '/tracker', search: { mode: 'client', code: joinCode } })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border-2 border-slate-700 p-8 rounded-xl max-w-md w-full shadow-2xl">
        <h1 className="text-3xl font-bold text-slate-200 mb-8 text-center uppercase tracking-widest">
          Select Mode
        </h1>

        <div className="space-y-4">
          <button
            onClick={() => navigate({ to: '/tracker', search: { mode: 'offline' } })}
            className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center gap-4 transition-all group"
          >
            <div className="p-3 bg-slate-700 rounded-full group-hover:bg-slate-600">
              <WifiOff className="w-6 h-6 text-slate-400" />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-200">OFFLINE OPS</div>
              <div className="text-sm text-slate-500">Local device only</div>
            </div>
          </button>

          <button
            onClick={startHost}
            className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg flex items-center gap-4 transition-all group"
          >
            <div className="p-3 bg-cyan-900/30 rounded-full group-hover:bg-cyan-900/50">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-left">
              <div className="font-bold text-cyan-400">HOST SESSION</div>
              <div className="text-sm text-slate-500">Create a shared room</div>
            </div>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-slate-500">OR JOIN</span>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ENTER CODE"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-center text-xl tracking-widest uppercase focus:outline-none focus:border-cyan-500 transition-colors text-white"
            />
            <button
              onClick={joinSession}
              disabled={joinCode.length !== 6}
              className="px-6 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              JOIN
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
