import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative gradient glowing backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="max-w-4xl mx-auto text-center z-10 flex flex-col items-center">
        {/* Logo/Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          DevAtlas Platform v1.1.0 MVP
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-slate-100 via-slate-100 to-purple-400 bg-clip-text text-transparent">
          DevAtlas
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-8 leading-relaxed">
          The ultimate single-point-of-reference developer platform. Your unified knowledge graph connecting tutorials, code snippets, errors, and system architectures.
        </p>

        {/* Main Action Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full mb-12">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:border-purple-500/30 transition-all group">
            <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-purple-400 transition-colors">Client App</h3>
            <p className="text-sm text-slate-400">Vite + React 19 single-page application bootstrapped with Tailwind CSS v4.</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:border-purple-500/30 transition-all group">
            <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-purple-400 transition-colors">Server App</h3>
            <p className="text-sm text-slate-400">Express.js API server configured with Layer-First repository pattern routing.</p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:border-purple-500/30 transition-all group">
            <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-purple-400 transition-colors">Shared Workspaces</h3>
            <p className="text-sm text-slate-400">Monorepo orchestration using npm workspaces for seamless development workflows.</p>
          </div>
        </div>

        {/* Dynamic Interactive Element */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setCount((c) => c + 1)}
            className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950/40 hover:shadow-purple-900/40 active:scale-98 transition-all cursor-pointer"
          >
            Client Counter: {count}
          </button>
          <span className="text-xs text-slate-500">Click to verify that React state and interactive features are active.</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 text-slate-600 text-xs z-10 border-t border-slate-900 pt-8 w-full max-w-4xl text-center">
        © {new Date().getFullYear()} DevAtlas. All rights reserved. Managed by Senior MERN Engineers.
      </footer>
    </div>
  )
}

export default App
