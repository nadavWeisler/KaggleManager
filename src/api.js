/**
 * Unified API adapter.
 * - In Electron: delegates to window.api (IPC)
 * - In browser: calls the Express server at /api/* using SSE streams
 */

const isElectron = () => typeof window !== 'undefined' && !!window.api

// ── SSE stream helper ─────────────────────────────────────────────────────────
// Connects to an SSE endpoint, feeds log lines to onLog, resolves on 'done'.
function streamRequest(url, opts = {}, onLog) {
  return new Promise((resolve, reject) => {
    const { method = 'GET', body } = opts

    const doFetch = () =>
      fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })

    doFetch().then(async (response) => {
      if (!response.ok) {
        reject(new Error(`HTTP ${response.status}`))
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() // keep incomplete chunk

        for (const chunk of parts) {
          const eventLine = chunk.match(/^event: (.+)/m)?.[1]
          const dataLine = chunk.match(/^data: (.+)/m)?.[1]
          if (!dataLine) continue

          let data
          try { data = JSON.parse(dataLine) } catch { continue }

          if (eventLine === 'log') {
            onLog?.(data.line)
          } else if (eventLine === 'done') {
            resolve(data)
            return
          } else if (eventLine === 'error') {
            reject(new Error(data.message))
            return
          }
        }
      }

      resolve({}) // stream ended without explicit done
    }).catch(reject)
  })
}

// ── Settings ──────────────────────────────────────────────────────────────────

function getSettings() {
  if (isElectron()) return window.api.settings.getAll()
  return fetch('/api/settings').then((r) => r.json())
}

function setSetting(key, value) {
  if (isElectron()) return window.api.settings.set(key, value)
  return fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  }).then((r) => r.json())
}

// ── Kaggle ────────────────────────────────────────────────────────────────────

function listKernels(opts = {}, onLog) {
  if (isElectron()) return window.api.kaggle.list(opts)
  const { mine = true, page = 1, search = '' } = opts
  const q = new URLSearchParams({ mine: String(mine), page, search })
  return streamRequest(`/api/kaggle/kernels?${q}`, {}, onLog)
}

function searchKernels(query, page = 1, onLog) {
  if (isElectron()) return window.api.kaggle.search(query, page)
  const q = new URLSearchParams({ mine: 'false', search: query, page })
  return streamRequest(`/api/kaggle/kernels?${q}`, {}, onLog)
}

function testConnection(onLog) {
  if (isElectron()) return window.api.kaggle.test()
  return streamRequest('/api/kaggle/test', {}, onLog)
}

function pullKernel(slug, destPath, onLog) {
  if (isElectron()) return window.api.kaggle.pull(slug, destPath)
  return streamRequest('/api/kaggle/kernels/pull', { method: 'POST', body: { slug, destPath } }, onLog)
}

function pushKernel(kernelPath, onLog) {
  if (isElectron()) return window.api.kaggle.push(kernelPath)
  return streamRequest('/api/kaggle/kernels/push', { method: 'POST', body: { kernelPath } }, onLog)
}

function listDatasets(search = '', onLog) {
  if (isElectron()) return window.api.kaggle.datasets(search)
  const q = new URLSearchParams({ search })
  return streamRequest(`/api/kaggle/datasets?${q}`, {}, onLog)
}

function downloadDataset(slug, destPath, onLog) {
  if (isElectron()) return window.api.kaggle.downloadDataset(slug, destPath)
  return streamRequest('/api/kaggle/datasets/download', { method: 'POST', body: { slug, destPath } }, onLog)
}

function writeKaggleCredentials(username, key) {
  if (isElectron()) return window.api.kaggle.writeCredentials(username, key)
  return fetch('/api/kaggle/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, key }),
  }).then((r) => r.json())
}

// ── Dialog / shell (web stubs) ────────────────────────────────────────────────

function openFile() {
  if (isElectron()) return window.api.dialog.openFile()
  // Web: caller handles via <input type="file">
  return Promise.resolve(null)
}

function openDirectory() {
  if (isElectron()) return window.api.dialog.openDirectory()
  // Browser can't pick arbitrary directories; return null (caller handles gracefully)
  return Promise.resolve(null)
}

function openPath(p) {
  if (isElectron()) return window.api.shell.openPath(p)
  return Promise.resolve({ ok: false, reason: 'not supported in browser' })
}

function openVSCode(filePath) {
  if (isElectron()) return window.api.vscode.open(filePath)
  window.open(`vscode://file/${filePath}`)
  return Promise.resolve({ ok: true })
}

function launchJupyter(notebookPath) {
  if (isElectron()) return window.api.jupyter.launch(notebookPath)
  return Promise.resolve({ ok: false, reason: 'not supported in browser' })
}

function onLog(callback) {
  if (isElectron()) return window.api.onLog(callback)
  return () => {} // no-op unsubscribe
}

export const api = {
  settings: { getAll: getSettings, set: setSetting },
  dialog: { openDirectory, openFile },
  kaggle: {
    list: listKernels,
    search: searchKernels,
    test: testConnection,
    pull: pullKernel,
    push: pushKernel,
    datasets: listDatasets,
    downloadDataset,
    writeCredentials: writeKaggleCredentials,
  },
  jupyter: { launch: launchJupyter },
  vscode: { open: openVSCode },
  shell: { openPath },
  onLog,
}
