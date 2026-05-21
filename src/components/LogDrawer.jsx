import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'

function logLineClass(text) {
  if (text.startsWith('✗') || text.startsWith('Error') || text.toLowerCase().includes('error')) {
    return 'text-red-400'
  }
  if (text.startsWith('✓') || text.startsWith('Done') || text.toLowerCase().includes('success')) {
    return 'text-green-400'
  }
  if (text.startsWith('▶') || text.startsWith('⚠')) {
    return 'text-yellow-400'
  }
  return 'text-slate-300'
}

export default function LogDrawer() {
  const { logs, logDrawerOpen, clearLogs, toggleLogDrawer } = useAppStore()
  const bottomRef = useRef(null)

  useEffect(() => {
    if (logDrawerOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, logDrawerOpen])

  if (!logDrawerOpen) return null

  return (
    <div className="fixed bottom-0 left-16 right-0 h-60 bg-slate-950 border-t border-slate-700 flex flex-col z-50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Logs</span>
          <span className="text-xs text-slate-500">{logs.length} entries</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearLogs}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={toggleLogDrawer}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs">
        {logs.length === 0 ? (
          <p className="text-slate-600 italic">No log entries yet.</p>
        ) : (
          logs.map((entry) => (
            <div key={entry.id} className={`leading-5 ${logLineClass(entry.text)}`}>
              <span className="text-slate-600 mr-2 select-none">
                {new Date(entry.ts).toLocaleTimeString()}
              </span>
              {entry.text}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
