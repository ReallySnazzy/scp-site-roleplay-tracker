import Link from 'next/link'

export default function Header() {
    return (
        <header className="p-6 bg-slate-950 border-b-4 border-slate-700 shadow-2xl">
            <div className="max-w-7xl mx-auto flex items-center justify-center">
                <h1 className="text-3xl md:text-4xl font-black tracking-widest text-slate-200 uppercase" style={{ fontFamily: 'monospace' }}>
                    <Link href="/">
                        SCP Site Roleplay Tracker
                    </Link>
                </h1>
            </div>
        </header>
    )
}
