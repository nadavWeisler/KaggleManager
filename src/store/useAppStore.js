import { create } from 'zustand'
import { api } from '../api'

export const useAppStore = create((set, get) => ({
  // Navigation
  activeTab: 'notebooks',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Settings
  settings: {},
  loadSettings: async () => {
    const s = await api.settings.getAll()
    set({ settings: s || {} })
  },
  updateSetting: async (key, value) => {
    await api.settings.set(key, value)
    set((state) => ({ settings: { ...state.settings, [key]: value } }))
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
