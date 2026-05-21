import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import NotebookCard from './NotebookCard'

export default function NotebookList() {
  const { notebooks, notebooksLoading, loadNotebooks, settings } = useAppStore()
  const [showMine, setShowMine] = useState(true)

  useEffect(() => {
    loadNotebooks()
  }, [])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Notebooks</h1>
          <p className="text-sm text-slate-400 mt-1">
            Workspace: <span className="text-slate-300">{settings.workspaceDir || '~/.kaggle-manager'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadNotebooks}
            disabled={notebooksLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${notebooksLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {notebooksLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {!settings.workspaceDir && (
        <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
          ⚠ No workspace directory set. Go to Settings to configure it.
        </div>
      )}

      {notebooks.length === 0 && !notebooksLoading && (
        <div className="text-center py-20 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No notebooks found.</p>
          <p className="text-xs mt-1">Make sure the Kaggle CLI is installed and you are authenticated.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {notebooks.map((nb, i) => (
          <NotebookCard key={nb.ref || i} notebook={nb} />
        ))}
      </div>
    </div>
  )
}
