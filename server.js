/**
 * Web mode Express server — mirrors all Electron IPC handlers as REST endpoints.
 * Run with: node server.js (default port 3444)
 * Settings stored at ~/.kaggle-manager/settings.json
 */

const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const os = require('os')
const kaggle = require('./electron/kaggle')

const app = express()
const PORT = process.env.PORT || 3444
const SETTINGS_FILE = path.join(os.homedir(), '.kaggle-manager', 'settings.json')

// ── Settings helpers ──────────────────────────────────────────────────────────

function readSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return {}
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'))
  } catch {
    return {}
  }
}

function writeSettings(data) {
  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true })
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2))
}

function getSetting(key, defaultVal) {
  const s = readSettings()
  return key in s ? s[key] : defaultVal
}

function setSetting(key, value) {
  const s = readSettings()
  s[key] = value
  writeSettings(s)
}

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors())
app.use(express.json())

// Serve built Vite assets if present
const distPath = path.join(__dirname, 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
}

// ── SSE log helper ────────────────────────────────────────────────────────────
// Wrap a kaggle operation and stream log lines as SSE, then send a final 'done' event.
function withSSE(res, fn) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)

  fn(
    (line) => send('log', { line }),
    (result) => { send('done', result); res.end() },
    (err) => { send('error', { message: err.message }); res.end() }
  )
}

// ── Settings routes ───────────────────────────────────────────────────────────

app.get('/api/settings', (_, res) => res.json(readSettings()))

app.post('/api/settings', (req, res) => {
  const { key, value } = req.body
  setSetting(key, value)
  res.json({ ok: true })
})

// ── Kaggle: write credentials ─────────────────────────────────────────────────

app.post('/api/kaggle/credentials', async (req, res) => {
  const { username, key } = req.body
  try {
    const result = await kaggle.writeKaggleCredentials(username, key)
    res.json(result)
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

// ── Kaggle: test connection ───────────────────────────────────────────────────

app.get('/api/kaggle/test', (req, res) => {
  const kaggleBin = getSetting('kagglePath', 'kaggle')
  withSSE(res, (onLog, onDone, onError) => {
    kaggle.testConnection(onLog, kaggleBin)
      .then(onDone)
      .catch(onError)
  })
})

// ── Kaggle: list/search kernels ───────────────────────────────────────────────

app.get('/api/kaggle/kernels', (req, res) => {
  const kaggleBin = getSetting('kagglePath', 'kaggle')
  const { mine = 'true', page = 1, search = '' } = req.query
  withSSE(res, (onLog, onDone, onError) => {
    kaggle.listKernels(onLog, {
      mine: mine === 'true',
      page: Number(page),
      search,
      kaggleBin,
    })
      .then(onDone)
      .catch(onError)
  })
})

// ── Kaggle: pull kernel ───────────────────────────────────────────────────────

app.post('/api/kaggle/kernels/pull', (req, res) => {
  const kaggleBin = getSetting('kagglePath', 'kaggle')
  const { slug, destPath } = req.body
  withSSE(res, (onLog, onDone, onError) => {
    kaggle.pullKernel(slug, destPath, onLog, kaggleBin)
      .then(onDone)
      .catch(onError)
  })
})

// ── Kaggle: push kernel ───────────────────────────────────────────────────────

app.post('/api/kaggle/kernels/push', (req, res) => {
  const kaggleBin = getSetting('kagglePath', 'kaggle')
  const { kernelPath } = req.body
  withSSE(res, (onLog, onDone, onError) => {
    kaggle.pushKernel(kernelPath, onLog, kaggleBin)
      .then(onDone)
      .catch(onError)
  })
})

// ── Kaggle: list datasets ─────────────────────────────────────────────────────

app.get('/api/kaggle/datasets', (req, res) => {
  const kaggleBin = getSetting('kagglePath', 'kaggle')
  const { search = '' } = req.query
  withSSE(res, (onLog, onDone, onError) => {
    kaggle.listDatasets(search, onLog, kaggleBin)
      .then(onDone)
      .catch(onError)
  })
})

// ── Kaggle: download dataset ──────────────────────────────────────────────────

app.post('/api/kaggle/datasets/download', (req, res) => {
  const kaggleBin = getSetting('kagglePath', 'kaggle')
  const { slug, destPath } = req.body
  withSSE(res, (onLog, onDone, onError) => {
    kaggle.downloadDataset(slug, destPath, onLog, kaggleBin)
      .then(onDone)
      .catch(onError)
  })
})

// ── SPA fallback ──────────────────────────────────────────────────────────────

if (fs.existsSync(distPath)) {
  app.get('*', (_, res) => res.sendFile(path.join(distPath, 'index.html')))
}

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`KaggleManager web server running at http://localhost:${PORT}`)
  console.log(`Settings stored at: ${SETTINGS_FILE}`)
})
