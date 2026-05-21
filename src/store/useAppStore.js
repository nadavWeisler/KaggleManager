import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  // Navigation
  activeTab: 'notebooks',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Settings
  settings: {},
  loadSettings: async () => {
    if (!window.api) return
    const s = await window.api.settings.getAll()
    set({ settings: s || {} })
  },
  updateSetting: async (key, value) => {
    if (!window.api) return
    await window.api.settings.set(key, value)
    set((state) => ({ settings: { ...state.settings, [key]: value } }))
  },

  // Notebooks
  notebooks: [],
  notebooksLoading: false,
  loadNotebooks: async () => {
    if (!window.api) return
    set({ notebooksLoading: true })
    const result = await window.api.kaggle.list({ mine: true })
    set({ notebooks: result?.items || [], notebooksLoading: false })
  },

  // Datasets
  datasets: [],
  datasetsLoading: false,
  datasetSearch: '',
  setDatasetSearch: (q) => set({ datasetSearch: q }),
  loadDatasets: async (search = '') => {
    if (!window.api) return
    set({ datasetsLoading: true })
    const result = await window.api.kaggle.datasets(search)
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
