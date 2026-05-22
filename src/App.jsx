import { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import NotebookList from './components/NotebookList'
import DatasetList from './components/DatasetList'
import Settings from './components/Settings'
import LogDrawer from './components/LogDrawer'
import { useAppStore } from './store/useAppStore'
import { api } from './api'

function NoCreditsBanner({ onGoToSettings }) {
  return (
    <div className="mx-6 mt-6 p-4 bg-yellow-900/30 border border-yellow-600 rounded-xl flex items-start gap-3">
      <span className="text-xl mt-0.5">🔑</span>
      <div className="flex-1 min-w-0">
        <p className="text-yellow-200 font-semibold text-sm">Kaggle credentials not configured</p>
        <p className="text-yellow-400/80 text-xs mt-1">
          Go to{' '}
          <a href="https://www.kaggle.com/settings" target="_blank" rel="noreferrer" className="underline hover:text-yellow-200">
            kaggle.com/settings
          </a>
          {' '}→ API → <strong>Create New API Token</strong> to download your <code className="bg-yellow-900/50 px-1 rounded">kaggle.json</code>, then load it in Settings.
        </p>
      </div>
      <button
        onClick={onGoToSettings}
        className="shrink-0 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-yellow-950 rounded-lg text-xs font-semibold transition-colors"
      >
        Open Settings
      </button>
    </div>
  )
}

export default function App() {
  const { activeTab, setActiveTab, loadSettings, appendLog, logDrawerOpen, settings } = useAppStore()
  const hasCredentials = !!(settings.kaggleUsername && settings.kaggleKey)

  useEffect(() => {
    loadSettings()
    const cleanup = api.onLog((line) => appendLog(line))
    return cleanup
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      <Sidebar />
      <main className={`flex-1 overflow-auto transition-all ${logDrawerOpen ? 'pb-64' : 'pb-0'}`}>
        {!hasCredentials && activeTab !== 'settings' && (
          <NoCreditsBanner onGoToSettings={() => setActiveTab('settings')} />
        )}
        {activeTab === 'notebooks' && <NotebookList />}
        {activeTab === 'datasets' && <DatasetList />}
        {activeTab === 'settings' && <Settings />}
      </main>
      <LogDrawer />
    </div>
  )
}
