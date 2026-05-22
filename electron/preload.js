const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  // Settings
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:getAll'),
  },

  // Dialog
  dialog: {
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  },

  // Kaggle
  kaggle: {
    list: (opts) => ipcRenderer.invoke('kaggle:list', opts),
    search: (query, page = 1) => ipcRenderer.invoke('kaggle:search', query, page),
    test: () => ipcRenderer.invoke('kaggle:test'),
    pull: (slug, destPath) => ipcRenderer.invoke('kaggle:pull', slug, destPath),
    push: (kernelPath) => ipcRenderer.invoke('kaggle:push', kernelPath),
    datasets: (search) => ipcRenderer.invoke('kaggle:datasets', search),
    downloadDataset: (slug, destPath) =>
      ipcRenderer.invoke('kaggle:download-dataset', slug, destPath),
    writeCredentials: (username, key) =>
      ipcRenderer.invoke('kaggle:write-credentials', username, key),
  },

  // Jupyter
  jupyter: {
    launch: (notebookPath) => ipcRenderer.invoke('jupyter:launch', notebookPath),
  },

  // VS Code
  vscode: {
    open: (filePath) => ipcRenderer.invoke('vscode:open', filePath),
  },

  // Shell
  shell: {
    openPath: (p) => ipcRenderer.invoke('shell:openPath', p),
  },

  // Log stream listener
  onLog: (callback) => {
    ipcRenderer.on('log:stream', (_, line) => callback(line))
    return () => ipcRenderer.removeAllListeners('log:stream')
  },
})
