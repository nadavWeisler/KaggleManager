import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { api } from '../api'

export default function NotebookCard({ notebook }) {
  const { settings, appendLog } = useAppStore()
  const [pulling, setPulling] = useState(false)
  const [pushing, setPushing] = useState(false)

  const slug = notebook.ref || notebook.title
  const workspace = settings.workspaceDir || `${window.process?.env?.HOME || '~'}/.kaggle-manager`
  const notebookDir = `${workspace}/notebooks/${slug.replace('/', '_')}`

  async function handlePull() {
    setPulling(true)
    appendLog(`Pulling ${slug}...`)
    const result = await api.kaggle.pull(slug, notebookDir, appendLog)
    if (result.error) appendLog(`✗ ${result.error}`)
    setPulling(false)
  }

  async function handlePush() {
    setPushing(true)
    appendLog(`Pushing ${slug}...`)
    const result = await api.kaggle.push(notebookDir, appendLog)
    if (result.error) appendLog(`✗ ${result.error}`)
    setPushing(false)
  }

  async function handleJupyter() {
    appendLog(`Launching Jupyter for ${slug}...`)
    await api.jupyter.launch(notebookDir)
  }

  async function handleVSCode() {
    await api.vscode.open(notebookDir)
  }

  async function handleOpenFolder() {
    await api.shell.openPath(notebookDir)
  }

  const title = notebook.title || slug
  const totalVotes = notebook.totalVotes || notebook.votes || '—'
  const language = notebook.language || '—'
  const isScript = notebook.isScript === 'True' || notebook.type === 'script'

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-500 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 truncate" title={title}>{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{slug}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${isScript ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'}`}>
          {isScript ? 'Script' : 'Notebook'}
        </span>
      </div>

      <div className="flex gap-4 text-xs text-slate-400">
        <span>🗣 {language}</span>
        <span>▲ {totalVotes}</span>
        {notebook.totalRunningTime && <span>⏱ {notebook.totalRunningTime}</span>}
      </div>

      <div className="flex gap-2 flex-wrap mt-auto">
        <button
          onClick={handlePull}
          disabled={pulling}
          title={`Pull to ${notebookDir}`}
          className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#20BEFF] hover:bg-sky-400 text-slate-900 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {pulling ? (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          ) : '↓'} Pull
        </button>

        <button
          onClick={handlePush}
          disabled={pushing}
          title="Push to Kaggle"
          className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {pushing ? (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          ) : '↑'} Push
        </button>

        <button
          onClick={handleJupyter}
          title="Open in Jupyter"
          className="px-3 py-1.5 bg-orange-700 hover:bg-orange-600 rounded-lg text-xs font-semibold transition-colors"
        >
          Jupyter
        </button>

        <button
          onClick={handleVSCode}
          title="Open in VS Code"
          className="px-3 py-1.5 bg-blue-800 hover:bg-blue-700 rounded-lg text-xs font-semibold transition-colors"
        >
          Code
        </button>

        <button
          onClick={handleOpenFolder}
          title="Open folder"
          className="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs transition-colors"
        >
          📁
        </button>
      </div>
    </div>
  )
}
