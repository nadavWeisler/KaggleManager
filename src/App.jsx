import { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import NotebookList from './components/NotebookList'
import DatasetList from './components/DatasetList'
import Settings from './components/Settings'
import LogDrawer from './components/LogDrawer'
import { useAppStore } from './store/useAppStore'
import { api } from './api'

export default function App() {
  const { activeTab, loadSettings, appendLog, logDrawerOpen } = useAppStore()

  useEffect(() => {
    loadSettings()

    // Register global log stream listener (Electron only; web mode streams per-request)
    const cleanup = api.onLog((line) => appendLog(line))
    return cleanup
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      <Sidebar />
      <main className={`flex-1 overflow-auto transition-all ${logDrawerOpen ? 'pb-64' : 'pb-0'}`}>
        {activeTab === 'notebooks' && <NotebookList />}
        {activeTab === 'datasets' && <DatasetList />}
        {activeTab === 'settings' && <Settings />}
      </main>
      <LogDrawer />
    </div>
  )
}
