import { useEffect, useState, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import NotebookCard from './NotebookCard'

function SetupStep({ index, title, detail, ok }) {
  return (
    <div className="flex gap-3 text-left">
      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        ok ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-300'
      }`}>
        {ok ? '✓' : index}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-200">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-slate-400">{detail}</p>
      </div>
    </div>
  )
}

function KaggleSetupPanel({ error, settings, onOpenSettings, onRetry, loading }) {
  const hasCredentials = !!(settings.kaggleUsername && settings.kaggleKey)
  const hasWorkspace = !!settings.workspaceDir
  const cliMissing = /cli.*not found|not recognized|enoent/i.test(error || '')

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-slate-700 bg-slate-800/70 p-6 text-left shadow-xl shadow-slate-950/20">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#20BEFF]/15 text-[#20BEFF]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 11c0-1.657 1.79-3 4-3s4 1.343 4 3-1.79 3-4 3-4-1.343-4-3Zm0 0v6m0-6c0-1.657-1.79-3-4-3s-4 1.343-4 3 1.79 3 4 3 4-1.343 4-3Zm-8 0v6c0 1.657 1.79 3 4 3s4-1.343 4-3m8-6v6c0 1.657-1.79 3-4 3s-4-1.343-4-3" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-100">Connect Kaggle to load your notebooks</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            KaggleManager needs the Kaggle CLI plus your API token. Once those are connected, this page will refresh into your notebook list.
          </p>
          {error && (
            <div className="mt-4 rounded-lg border border-red-800/70 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <SetupStep
          index="1"
          ok={!cliMissing}
          title="Install the Kaggle CLI"
          detail='Run "python -m pip install kaggle" once, then keep the Kaggle executable path as "kaggle" unless you installed it somewhere custom.'
        />
        <SetupStep
          index="2"
          ok={hasCredentials}
          title="Load your kaggle.json token"
          detail="Download it from Kaggle account settings, then load it in Settings or paste your username and API key."
        />
        <SetupStep
          index="3"
          ok={hasWorkspace}
          title="Choose a local workspace"
          detail="This is where pulled notebooks and downloaded datasets will live on your machine."
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={onOpenSettings}
          className="rounded-lg bg-[#20BEFF] px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-400"
        >
          Open Connection Settings
        </button>
        <button
          onClick={onRetry}
          disabled={loading}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Again'}
        </button>
      </div>
    </div>
  )
}

export default function NotebookList() {
  const {
    notebooks, notebooksLoading, notebooksError, loadNotebooks, settings, setActiveTab,
    notebookTab, setNotebookTab,
    notebookQuery, setNotebookQuery,
    notebookSearchResults, notebookSearchLoading, searchNotebooks,
  } = useAppStore()

  const [inputValue, setInputValue] = useState(notebookQuery)
  const debounceRef = useRef(null)

  useEffect(() => {
    loadNotebooks()
  }, [])

  // Debounce search input
  useEffect(() => {
    if (notebookTab !== 'search') return
    clearTimeout(debounceRef.current)
    if (!inputValue.trim()) {
      setNotebookQuery('')
      return
    }
    debounceRef.current = setTimeout(() => {
      searchNotebooks(inputValue.trim())
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [inputValue, notebookTab])

  function handleTabChange(tab) {
    setNotebookTab(tab)
    if (tab === 'search' && inputValue.trim() && notebookSearchResults.length === 0) {
      searchNotebooks(inputValue.trim())
    }
  }

  const isSearchTab = notebookTab === 'search'
  const displayItems = isSearchTab ? notebookSearchResults : notebooks
  const isLoading = isSearchTab ? notebookSearchLoading : notebooksLoading
  const workspace = settings.workspaceDir || `${window.process?.env?.HOME || '~'}/.kaggle-manager`

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Notebooks</h1>
          <p className="text-sm text-slate-400 mt-1">
            Workspace: <span className="text-slate-300">{workspace}</span>
          </p>
        </div>
        {!isSearchTab && (
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
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => handleTabChange('mine')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !isSearchTab
              ? 'bg-[#20BEFF] text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Notebooks
        </button>
        <button
          onClick={() => handleTabChange('search')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isSearchTab
              ? 'bg-[#20BEFF] text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🔍 Search Kaggle
        </button>
      </div>

      {/* Search input (search tab only) */}
      {isSearchTab && (
        <div className="relative mb-5">
          <input
            type="text"
            placeholder="Search public notebooks by keyword…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
            className="w-full bg-slate-800 border border-slate-600 focus:border-[#20BEFF] text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-colors"
          />
          {notebookSearchLoading && (
            <svg className="absolute right-3 top-3 w-4 h-4 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          )}
        </div>
      )}

      {/* Warnings */}
      {!settings.workspaceDir && (
        <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
          ⚠ No workspace directory set. Go to Settings to configure it.
        </div>
      )}

      {/* Empty states */}
      {!isLoading && displayItems.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isSearchTab && !inputValue.trim() ? (
            <>
              <p>Type a keyword to search Kaggle notebooks.</p>
              <p className="text-xs mt-1">e.g. "titanic", "NLP", "image classification"</p>
            </>
          ) : isSearchTab ? (
            <p>No notebooks found for "<span className="text-slate-400">{inputValue}</span>".</p>
          ) : !notebooksError ? (
            <>
              <p className="text-slate-300">Connected, but there are no notebooks in this Kaggle account yet.</p>
              <p className="text-xs mt-1">Use Search Kaggle to pull a public notebook, or create one on Kaggle and refresh.</p>
            </>
          ) : (
            <KaggleSetupPanel
              error={notebooksError}
              settings={settings}
              onOpenSettings={() => setActiveTab('settings')}
              onRetry={loadNotebooks}
              loading={notebooksLoading}
            />
          )}
        </div>
      )}

      {/* Results grid */}
      {displayItems.length > 0 && (
        <>
          {isSearchTab && (
            <p className="text-xs text-slate-500 mb-3">
              {displayItems.length} result{displayItems.length !== 1 ? 's' : ''} for "<span className="text-slate-400">{notebookQuery}</span>"
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayItems.map((nb, i) => (
              <NotebookCard key={nb.ref || i} notebook={nb} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
