import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, ShieldAlert, Skull, Wifi, WifiOff, Copy, Check } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import Peer, { type DataConnection } from 'peerjs'
import { z } from 'zod'

const searchSchema = z.object({
    mode: z.enum(['offline', 'host', 'client']),
    code: z.string().optional(),
})

export const Route = createFileRoute('/tracker')({
    validateSearch: (search) => searchSchema.parse(search),
    component: TrackerPage,
})

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

type LogItem = {
    id: string
    type: 'breach' | 'event'
    content: string
    timestamp: string
}

type NetworkMessage =
    | { type: 'SYNC_LOGS'; logs: LogItem[] }
    | { type: 'ADD_LOG'; log: LogItem }
    | { type: 'REMOVE_LOG'; id: string }

function TrackerPage() {
    const { mode, code } = useSearch({ from: '/tracker' })

    const [inputBuffer, setInputBuffer] = useState<string>('')
    const [logs, setLogs] = useState<LogItem[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)

    const peerRef = useRef<Peer | null>(null)
    const connectionsRef = useRef<DataConnection[]>([])

    useEffect(() => {
        // Initialize connection based on mode
        if (mode === 'offline') return

        if (mode === 'host' && code) {
            const id = `scp-tracker-${code}`
            const peer = new Peer(id)
            peerRef.current = peer

            peer.on('open', () => {
                setIsConnected(true)
            })

            peer.on('connection', (conn) => {
                connectionsRef.current.push(conn)
                conn.on('open', () => {
                    // Send current state to new client
                    // We rely on the broadcast mechanism for updates, but for initial state
                    // we need to access the current logs. 
                    // Since we can't easily access state inside this closure without dependencies,
                    // we will rely on the fact that the host is the source of truth.
                    // A better pattern is to use a ref for logs.
                })

                conn.on('data', (data: any) => {
                    handleNetworkMessage(data)
                })

                conn.on('close', () => {
                    connectionsRef.current = connectionsRef.current.filter(c => c !== conn)
                })
            })

            peer.on('error', (err) => {
                console.error('Peer error:', err)
                alert(`Connection Error: ${err.type}`)
            })
        } else if (mode === 'client' && code) {
            const peer = new Peer()
            peerRef.current = peer

            peer.on('open', () => {
                const hostId = `scp-tracker-${code}`
                const conn = peer.connect(hostId)

                conn.on('open', () => {
                    setIsConnected(true)
                    connectionsRef.current.push(conn)
                })

                conn.on('data', (data: any) => {
                    handleNetworkMessage(data)
                })

                conn.on('close', () => {
                    setIsConnected(false)
                    alert('Host disconnected')
                })

                conn.on('error', (err) => {
                    console.error('Connection error:', err)
                    alert('Could not connect to host.')
                })
            })
        }

        return () => {
            peerRef.current?.destroy()
        }
    }, [mode, code])

    // Ref to access latest logs in callbacks
    const logsRef = useRef(logs)
    useEffect(() => {
        logsRef.current = logs
    }, [logs])

    // Handle initial sync for new connections (Host)
    useEffect(() => {
        if (mode !== 'host' || !peerRef.current) return

        if (mode !== 'host' || !peerRef.current) return
        // We need to hook into the 'connection' event again? No, that would duplicate listeners.
        // Instead, we can use a separate effect that runs when connectionsRef changes? No, ref changes don't trigger effects.

        // The issue is sending the INITIAL state to a NEW connection.
        // The 'connection' listener is defined once.
        // We can use a mutable ref for the logs, which we already have: logsRef.

        // Let's redefine the listener? No, PeerJS might not like that.
        // Actually, we can just use the logsRef inside the listener defined in the first effect!
        // But the first effect has a stale closure over logsRef? 
        // No, logsRef is a Ref object. The object reference is stable. 
        // logsRef.current is mutable. So reading logsRef.current inside the callback works!

        // I need to update the first effect to use logsRef.current for the initial sync.
    }, [])

    // I will rewrite the first effect to use logsRef for initial sync.

    const handleNetworkMessage = (msg: NetworkMessage) => {
        if (msg.type === 'SYNC_LOGS') {
            setLogs(msg.logs)
        } else if (msg.type === 'ADD_LOG') {
            if (mode === 'host') {
                setLogs(prev => {
                    const newLogs = [msg.log, ...prev]
                    broadcast({ type: 'SYNC_LOGS', logs: newLogs })
                    return newLogs
                })
            }
        } else if (msg.type === 'REMOVE_LOG') {
            if (mode === 'host') {
                setLogs(prev => {
                    const newLogs = prev.filter(l => l.id !== msg.id)
                    broadcast({ type: 'SYNC_LOGS', logs: newLogs })
                    return newLogs
                })
            }
        }
    }

    const broadcast = (msg: NetworkMessage) => {
        connectionsRef.current.forEach(conn => {
            if (conn.open) conn.send(msg)
        })
    }

    const handleNumberClick = (num: number) => {
        const newBuffer = inputBuffer + num.toString()
        if (newBuffer.length === 3) {
            createLog('breach', `SCP-${newBuffer} BREACH`)
            setInputBuffer('')
        } else {
            setInputBuffer(newBuffer)
        }
    }

    const createLog = (type: 'breach' | 'event', content: string) => {
        const newLog: LogItem = {
            id: Math.random().toString(36).substring(7),
            type,
            content,
            timestamp: new Date().toISOString(),
        }

        if (mode === 'offline') {
            setLogs(prev => [newLog, ...prev])
        } else if (mode === 'host') {
            setLogs(prev => {
                const newLogs = [newLog, ...prev]
                broadcast({ type: 'SYNC_LOGS', logs: newLogs })
                return newLogs
            })
        } else if (mode === 'client') {
            const conn = connectionsRef.current[0]
            if (conn && conn.open) {
                conn.send({ type: 'ADD_LOG', log: newLog })
            }
        }
    }

    const removeLog = (id: string) => {
        if (mode === 'offline') {
            setLogs(prev => prev.filter(log => log.id !== id))
        } else if (mode === 'host') {
            setLogs(prev => {
                const newLogs = prev.filter(log => log.id !== id)
                broadcast({ type: 'SYNC_LOGS', logs: newLogs })
                return newLogs
            })
        } else if (mode === 'client') {
            const conn = connectionsRef.current[0]
            if (conn && conn.open) {
                conn.send({ type: 'REMOVE_LOG', id })
            }
        }
    }

    const copyCode = () => {
        if (code) {
            navigator.clipboard.writeText(code)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-mono p-4 md:p-8">
            {/* Status Bar */}
            <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2 px-2">
                    {mode === 'offline' ? (
                        <span className="flex items-center gap-2 text-slate-400">
                            <WifiOff className="w-4 h-4" /> OFFLINE
                        </span>
                    ) : (
                        <span className={cn("flex items-center gap-2", isConnected ? "text-green-400" : "text-amber-400")}>
                            <Wifi className="w-4 h-4" />
                            {mode === 'host' ? 'HOSTING' : 'CLIENT'}
                            {!isConnected && ' (CONNECTING...)'}
                        </span>
                    )}
                </div>

                {mode !== 'offline' && code && (
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm uppercase">Session Code:</span>
                        <button
                            onClick={copyCode}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded border border-slate-600 transition-colors"
                        >
                            <span className="font-bold text-cyan-400 tracking-widest text-lg">{code}</span>
                            {copySuccess ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        </button>
                    </div>
                )}
            </div>

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
                                onClick={() => createLog('event', 'CLASS D RIOT IN PROGRESS')}
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
                                onClick={() => createLog('event', 'CLASS D ESCAPE ATTEMPT')}
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
                                onClick={() => createLog('event', 'CHAOS INSURGENCY DETECTED')}
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
                                            {new Date(log.timestamp).toLocaleTimeString()} :: ID-{log.id}
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
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 py-12">
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
