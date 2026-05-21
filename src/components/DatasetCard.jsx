import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function DatasetCard({ dataset }) {
  const { settings, appendLog } = useAppStore()
  const [downloading, setDownloading] = useState(false)
  const [done, setDone] = useState(false)

  const slug = dataset.ref || dataset.title
  const workspace = settings.workspaceDir || `${window.process?.env?.HOME || '~'}/.kaggle-manager`
  const destPath = `${workspace}/datasets/${slug.replace('/', '_')}`

  async function handleDownload() {
    if (!window.api) return
    setDownloading(true)
    appendLog(`Downloading dataset ${slug}...`)
    const result = await window.api.kaggle.downloadDataset(slug, destPath)
    if (result.error) {
      appendLog(`✗ ${result.error}`)
    } else {
      setDone(true)
      appendLog(`✓ Dataset downloaded to ${destPath}`)
    }
    setDownloading(false)
  }

  async function handleOpenFolder() {
    if (!window.api) return
    await window.api.shell.openPath(destPath)
  }

  const size = dataset.size || dataset.totalBytes || '—'
  const lastUpdated = dataset.lastUpdated || dataset.updated || '—'
  const downloadCount = dataset.downloadCount || dataset.downloads || '—'
  const voteCount = dataset.voteCount || dataset.votes || '—'
  const title = dataset.title || slug

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-500 transition-colors">
      <div>
        <h3 className="font-semibold text-slate-100 truncate" title={title}>{title}</h3>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{slug}</p>
        {dataset.subtitle && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dataset.subtitle}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
        <span>📦 {size}</span>
        <span>⬇ {downloadCount}</span>
        <span>▲ {voteCount}</span>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
            done
              ? 'bg-green-700 text-green-100'
              : 'bg-[#20BEFF] hover:bg-sky-400 text-slate-900'
          }`}
        >
          {downloading ? (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : done ? '✓ Downloaded' : '⬇ Download'}
        </button>

        {done && (
          <button
            onClick={handleOpenFolder}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs transition-colors"
          >
            📁
          </button>
        )}
      </div>
    </div>
  )
}
