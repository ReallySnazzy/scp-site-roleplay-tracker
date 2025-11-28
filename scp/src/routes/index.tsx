import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, ShieldAlert, Skull } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const Route = createFileRoute('/')({ component: App })

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type LogItem = {
  id: string
  type: 'breach' | 'event'
  content: string
  timestamp: Date
}

function App() {
  const [inputBuffer, setInputBuffer] = useState<string>('')
  const [logs, setLogs] = useState<LogItem[]>([])

  const handleNumberClick = (num: number) => {
    const newBuffer = inputBuffer + num.toString()
    if (newBuffer.length === 3) {
      addLog('breach', `SCP-${newBuffer} BREACH`)
      setInputBuffer('')
    } else {
      setInputBuffer(newBuffer)
    }
  }

  const addLog = (type: 'breach' | 'event', content: string) => {
    const newLog: LogItem = {
      id: Math.random().toString(36).substring(7),
      type,
      content,
      timestamp: new Date(),
    }
    setLogs((prev) => [newLog, ...prev])
  }

  const removeLog = (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* SCP Breach Section */}
          <section className="bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden shadow-lg relative">
            <div className="bg-slate-800 p-4 border-b-2 border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                SCP Breach
              </h2>
              <div className="h-10 w-24 bg-black border border-slate-600 rounded flex items-center justify-center text-xl text-red-500 font-digital tracking-widest shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                {inputBuffer.padEnd(3, '_')}
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    className="h-16 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 rounded-lg text-2xl font-bold transition-all shadow-[0_4px_0_0_rgba(30,41,59,1)] active:shadow-none active:translate-y-1"
                  >
                    {num}
                  </button>
                ))}
                <div className="col-start-2">
                  <button
                    onClick={() => handleNumberClick(0)}
                    className="w-full h-16 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 rounded-lg text-2xl font-bold transition-all shadow-[0_4px_0_0_rgba(30,41,59,1)] active:shadow-none active:translate-y-1"
                  >
                    0
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Events Section */}
          <section className="bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-800 p-4 border-b-2 border-slate-700">
              <h2 className="text-2xl font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-6 h-6" />
                Site Events
              </h2>
            </div>
            <div className="p-6 grid gap-4">
              <button
                onClick={() => addLog('event', 'CLASS D RIOT IN PROGRESS')}
                className="group relative overflow-hidden p-4 bg-orange-900/30 hover:bg-orange-900/50 border border-orange-700/50 rounded-lg transition-all text-left"
              >
                <div className="absolute inset-0 bg-orange-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-500/20 rounded-full text-orange-500">
                    <Skull className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-bold text-orange-200">Class D Riot</span>
                </div>
              </button>

              <button
                onClick={() => addLog('event', 'CLASS D ESCAPE ATTEMPT')}
                className="group relative overflow-hidden p-4 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 rounded-lg transition-all text-left"
              >
                <div className="absolute inset-0 bg-red-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-500/20 rounded-full text-red-500">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-bold text-red-200">Class D Escape</span>
                </div>
              </button>

              <button
                onClick={() => addLog('event', 'CHAOS INSURGENCY DETECTED')}
                className="group relative overflow-hidden p-4 bg-green-900/30 hover:bg-green-900/50 border border-green-700/50 rounded-lg transition-all text-left"
              >
                <div className="absolute inset-0 bg-green-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-500/20 rounded-full text-green-500">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-bold text-green-200">Chaos Insurgency</span>
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* Right Column - Tracker Log */}
        <div className="bg-slate-900 border-2 border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col min-h-[400px] sticky top-4">
          <div className="bg-slate-800 p-4 border-b-2 border-slate-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-cyan-500 uppercase tracking-wider">
              Active Alerts
            </h2>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-slate-400">LIVE FEED</span>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-3">
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 50, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={cn(
                    "relative p-4 rounded border-l-4 shadow-md flex justify-between items-center group",
                    log.type === 'breach'
                      ? "bg-red-950/40 border-red-500 text-red-100"
                      : "bg-slate-800/60 border-amber-500 text-amber-100"
                  )}
                >
                  <div>
                    <div className="font-bold text-lg tracking-wide">{log.content}</div>
                    <div className="text-xs opacity-60 font-mono mt-1">
                      {log.timestamp.toLocaleTimeString()} :: ID-{log.id}
                    </div>
                  </div>
                  <button
                    onClick={() => removeLog(log.id)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {logs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                <ShieldAlert className="w-16 h-16 mb-4" />
                <p className="text-xl uppercase tracking-widest">No Active Threats</p>
                <p className="text-sm">Site Status: Normal</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
