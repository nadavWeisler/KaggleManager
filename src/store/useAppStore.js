import { create } from 'zustand'
import { api } from '../api'

const LS_KEY = 'kaggle-manager:settings'

function lsLoad() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') } catch { return {} }
}
function lsSave(settings) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(settings)) } catch {}
}

export const useAppStore = create((set, get) => ({
  // Navigation
  activeTab: 'notebooks',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Settings
  settings: {},
  loadSettings: async () => {
    // Merge: localStorage as fast fallback, server as source of truth
    const local = lsLoad()
    if (Object.keys(local).length) set({ settings: local })
    try {
      const server = await api.settings.getAll()
      const merged = { ...local, ...server }
      lsSave(merged)
      set({ settings: merged })
    } catch {
      // server unavailable — keep localStorage values
    }
  },
  updateSetting: async (key, value) => {
    await api.settings.set(key, value)
    const updated = { ...get().settings, [key]: value }
    lsSave(updated)
    set({ settings: updated })
  },

  // Notebooks
  notebooks: [],
  notebooksLoading: false,
  loadNotebooks: async () => {
    set({ notebooksLoading: true })
    const result = await api.kaggle.list({ mine: true }, get().appendLog)
    set({ notebooks: result?.items || [], notebooksLoading: false })
  },

  // Notebook search
  notebookTab: 'mine',            // 'mine' | 'search'
  setNotebookTab: (tab) => set({ notebookTab: tab }),
  notebookQuery: '',
  setNotebookQuery: (q) => set({ notebookQuery: q }),
  notebookSearchResults: [],
  notebookSearchLoading: false,
  searchNotebooks: async (query) => {
    set({ notebookSearchLoading: true, notebookQuery: query })
    const result = await api.kaggle.search(query, 1, get().appendLog)
    set({ notebookSearchResults: result?.items || [], notebookSearchLoading: false })
  },

  // Datasets
  datasets: [],
  datasetsLoading: false,
  datasetSearch: '',
  setDatasetSearch: (q) => set({ datasetSearch: q }),
  loadDatasets: async (search = '') => {
    set({ datasetsLoading: true })
    const result = await api.kaggle.datasets(search, get().appendLog)
    set({ datasets: result?.items || [], datasetsLoading: false })
  },

  // Log drawer
  logs: [],
  logDrawerOpen: false,
  toggleLogDrawer: () => set((s) => ({ logDrawerOpen: !s.logDrawerOpen })),
  appendLog: (line) =>
    set((s) => ({
      logs: [...s.logs.slice(-500), { id: Date.now() + Math.random(), text: line, ts: new Date().toISOString() }],
    })),
  clearLogs: () => set({ logs: [] }),

  // Kaggle CLI available
  kaggleAvailable: null,
  setKaggleAvailable: (v) => set({ kaggleAvailable: v }),
}))
