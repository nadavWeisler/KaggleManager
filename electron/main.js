const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const Store = require('electron-store')
const kaggle = require('./kaggle')

const store = new Store()
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    frame: process.platform !== 'linux',
    backgroundColor: '#0f172a',
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  return win
}

app.whenReady().then(() => {
  const win = createWindow()

  // Settings IPC
  ipcMain.handle('settings:get', (_, key) => store.get(key))
  ipcMain.handle('settings:set', (_, key, value) => store.set(key, value))
  ipcMain.handle('settings:getAll', () => store.store)

  // File dialog: open a JSON file and return its text content
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    if (result.canceled) return null
    return require('fs').readFileSync(result.filePaths[0], 'utf8')
  })

  // File/directory picker
  ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // Kaggle: test connection
  ipcMain.handle('kaggle:test', async (event) => {
    const kaggleBin = store.get('kagglePath', 'kaggle')
    return kaggle.testConnection(
      (line) => event.sender.send('log:stream', line),
      kaggleBin
    )
  })

  // Kaggle: list kernels
  ipcMain.handle('kaggle:list', async (event, opts = {}) => {
    const kaggleBin = store.get('kagglePath', 'kaggle')
    return kaggle.listKernels(
      (line) => event.sender.send('log:stream', line),
      { ...opts, kaggleBin }
    )
  })

  // Kaggle: search public kernels
  ipcMain.handle('kaggle:search', async (event, query = '', page = 1) => {
    const kaggleBin = store.get('kagglePath', 'kaggle')
    return kaggle.listKernels(
      (line) => event.sender.send('log:stream', line),
      { mine: false, search: query, page, kaggleBin }
    )
  })

  // Kaggle: pull kernel
  ipcMain.handle('kaggle:pull', async (event, slug, destPath) => {
    const kaggleBin = store.get('kagglePath', 'kaggle')
    return kaggle.pullKernel(
      slug,
      destPath,
      (line) => event.sender.send('log:stream', line),
      kaggleBin
    )
  })

  // Kaggle: push kernel
  ipcMain.handle('kaggle:push', async (event, kernelPath) => {
    const kaggleBin = store.get('kagglePath', 'kaggle')
    return kaggle.pushKernel(
      kernelPath,
      (line) => event.sender.send('log:stream', line),
      kaggleBin
    )
  })

  // Kaggle: list datasets
  ipcMain.handle('kaggle:datasets', async (event, search = '') => {
    const kaggleBin = store.get('kagglePath', 'kaggle')
    return kaggle.listDatasets(
      search,
      (line) => event.sender.send('log:stream', line),
      kaggleBin
    )
  })

  // Kaggle: download dataset
  ipcMain.handle('kaggle:download-dataset', async (event, slug, destPath) => {
    const kaggleBin = store.get('kagglePath', 'kaggle')
    return kaggle.downloadDataset(
      slug,
      destPath,
      (line) => event.sender.send('log:stream', line),
      kaggleBin
    )
  })

  // Jupyter: launch notebook
  ipcMain.handle('jupyter:launch', async (event, notebookPath) => {
    return kaggle.launchJupyter(
      notebookPath,
      store.get('jupyterPath', 'jupyter'),
      (line) => event.sender.send('log:stream', line)
    )
  })

  // Kaggle: read existing credentials from disk
  ipcMain.handle('kaggle:read-credentials', async () => {
    return kaggle.readKaggleCredentials()
  })

  // Kaggle: write credentials to ~/.config/kaggle/kaggle.json
  ipcMain.handle('kaggle:write-credentials', async (_, username, key) => {
    return kaggle.writeKaggleCredentials(username, key)
  })

  // Open in VS Code
  ipcMain.handle('vscode:open', async (_, filePath) => {
    shell.openExternal(`vscode://file/${filePath}`)
    return { ok: true }
  })

  // Open folder in file manager
  ipcMain.handle('shell:openPath', async (_, p) => {
    shell.openPath(p)
    return { ok: true }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
