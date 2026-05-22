const { spawn, exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const os = require('os')

// Electron strips the user shell PATH. Augment it with common locations
// where pip/conda/pyenv install CLI tools.
const EXTRA_PATHS = [
  path.join(os.homedir(), '.local', 'bin'),
  path.join(os.homedir(), '.local', 'bin'),
  '/usr/local/bin',
  '/usr/bin',
  '/bin',
  // conda / pyenv common locations
  path.join(os.homedir(), 'anaconda3', 'bin'),
  path.join(os.homedir(), 'miniconda3', 'bin'),
  path.join(os.homedir(), '.pyenv', 'shims'),
]

function buildEnv() {
  const existing = (process.env.PATH || '').split(path.delimiter)
  const merged = [...new Set([...EXTRA_PATHS, ...existing])].join(path.delimiter)
  return { ...process.env, PATH: merged }
}

function runCommand(cmd, args, cwd, onLog) {
  return new Promise((resolve, reject) => {
    onLog?.(`▶ ${cmd} ${args.join(' ')}`)
    const proc = spawn(cmd, args, { cwd, env: buildEnv(), shell: false })
    const output = []

    proc.stdout.on('data', (d) => {
      const line = d.toString().trim()
      if (line) {
        onLog?.(line)
        output.push(line)
      }
    })

    proc.stderr.on('data', (d) => {
      const line = d.toString().trim()
      if (line) {
        onLog?.(`⚠ ${line}`)
        output.push(line)
      }
    })

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ ok: true, output: output.join('\n') })
      } else {
        reject(new Error(output.join('\n') || `Exit code ${code}`))
      }
    })

    proc.on('error', (err) => reject(err))
  })
}

async function listKernels(onLog, { mine = true, page = 1, search = '', kaggleBin = 'kaggle' } = {}) {
  try {
    const args = ['kernels', 'list', '--csv', `--page=${page}`]
    if (mine && !search) args.push('--mine')
    if (search) args.push('--search', search)
    const result = await runCommand(kaggleBin, args, undefined, onLog)
    return parseCSV(result.output)
  } catch (err) {
    onLog?.(`✗ Error listing kernels: ${err.message}`)
    return { error: err.message, items: [] }
  }
}

async function pullKernel(slug, destPath, onLog, kaggleBin = 'kaggle') {
  try {
    fs.mkdirSync(destPath, { recursive: true })
    await runCommand(kaggleBin, ['kernels', 'pull', slug, '-p', destPath, '-m'], undefined, onLog)
    onLog?.(`✓ Pulled ${slug} → ${destPath}`)
    return { ok: true, path: destPath }
  } catch (err) {
    onLog?.(`✗ Pull failed: ${err.message}`)
    return { error: err.message }
  }
}

async function pushKernel(kernelPath, onLog, kaggleBin = 'kaggle') {
  try {
    await runCommand(kaggleBin, ['kernels', 'push', '-p', kernelPath], undefined, onLog)
    onLog?.(`✓ Pushed kernel from ${kernelPath}`)
    return { ok: true }
  } catch (err) {
    onLog?.(`✗ Push failed: ${err.message}`)
    return { error: err.message }
  }
}

async function listDatasets(search, onLog, kaggleBin = 'kaggle') {
  try {
    const args = ['datasets', 'list', '--csv']
    if (search) args.push('--search', search)
    const result = await runCommand(kaggleBin, args, undefined, onLog)
    return parseCSV(result.output)
  } catch (err) {
    onLog?.(`✗ Error listing datasets: ${err.message}`)
    return { error: err.message, items: [] }
  }
}

async function downloadDataset(slug, destPath, onLog, kaggleBin = 'kaggle') {
  try {
    fs.mkdirSync(destPath, { recursive: true })
    await runCommand(
      kaggleBin,
      ['datasets', 'download', slug, '-p', destPath, '--unzip'],
      undefined,
      onLog
    )
    onLog?.(`✓ Downloaded dataset ${slug} → ${destPath}`)
    return { ok: true, path: destPath }
  } catch (err) {
    onLog?.(`✗ Dataset download failed: ${err.message}`)
    return { error: err.message }
  }
}

function launchJupyter(notebookPath, jupyterBin = 'jupyter', onLog) {
  return new Promise((resolve) => {
    onLog?.(`▶ Launching Jupyter for ${notebookPath}`)
    const proc = spawn(jupyterBin, ['notebook', notebookPath], {
      detached: true,
      stdio: 'ignore',
    })
    proc.unref()
    onLog?.(`✓ Jupyter launched (PID ${proc.pid})`)
    resolve({ ok: true, pid: proc.pid })
  })
}

// Parse CSV output from kaggle CLI into array of objects
function parseCSV(output) {
  const lines = output.split('\n').filter(Boolean)
  if (lines.length < 2) return { items: [] }

  const headers = lines[0].split(',').map((h) => h.trim())
  const items = lines.slice(1).map((line) => {
    // Handle quoted fields with commas
    const values = line.match(/(".*?"|[^,]+)(?=,|$)/g) || []
    return headers.reduce((obj, h, i) => {
      obj[h] = (values[i] || '').replace(/^"|"$/g, '').trim()
      return obj
    }, {})
  })
  return { items }
}

/**
 * Test connection: checks binary exists and API credentials work.
 * Returns { ok, steps: [{label, ok, detail}] }
 */
async function testConnection(onLog, kaggleBin = 'kaggle') {
  const steps = []

  // Step 1: check binary exists + version
  try {
    const result = await runCommand(kaggleBin, ['--version'], undefined, onLog)
    const version = result.output.trim()
    steps.push({ label: 'Kaggle CLI found', ok: true, detail: version })
  } catch (err) {
    steps.push({ label: 'Kaggle CLI found', ok: false, detail: `Binary not found: ${err.message}` })
    return { ok: false, steps }
  }

  // Step 2: validate API credentials (list 1 notebook from mine)
  try {
    const result = await runCommand(
      kaggleBin,
      ['kernels', 'list', '--csv', '--page=1', '--page-size=1', '--mine'],
      undefined,
      onLog
    )
    const lines = result.output.trim().split('\n').filter(Boolean)
    if (lines.length >= 1) {
      steps.push({ label: 'API credentials valid', ok: true, detail: 'Successfully connected to Kaggle API' })
    } else {
      steps.push({ label: 'API credentials valid', ok: true, detail: 'Connected (no notebooks found, but auth works)' })
    }
  } catch (err) {
    const detail = err.message.includes('401') || err.message.toLowerCase().includes('unauthorized') || err.message.toLowerCase().includes('credential')
      ? 'Invalid API credentials — check your kaggle.json or username/key in Settings'
      : err.message
    steps.push({ label: 'API credentials valid', ok: false, detail })
    return { ok: false, steps }
  }

  return { ok: true, steps }
}

/**
 * Write Kaggle API credentials to ~/.config/kaggle/kaggle.json (and legacy ~/.kaggle/kaggle.json).
 * Returns { ok, path }
 */
async function writeKaggleCredentials(username, key) {
  if (!username || !key) return { ok: false, error: 'Username and key are required' }

  const content = JSON.stringify({ username, key }, null, 2)
  const written = []

  // Primary: ~/.config/kaggle/kaggle.json
  const configDir = path.join(os.homedir(), '.config', 'kaggle')
  fs.mkdirSync(configDir, { recursive: true })
  fs.writeFileSync(path.join(configDir, 'kaggle.json'), content, { mode: 0o600 })
  written.push(path.join(configDir, 'kaggle.json'))

  // Legacy: ~/.kaggle/kaggle.json
  const legacyDir = path.join(os.homedir(), '.kaggle')
  fs.mkdirSync(legacyDir, { recursive: true })
  fs.writeFileSync(path.join(legacyDir, 'kaggle.json'), content, { mode: 0o600 })
  written.push(path.join(legacyDir, 'kaggle.json'))

  return { ok: true, paths: written }
}

module.exports = {
  listKernels,
  pullKernel,
  pushKernel,
  listDatasets,
  downloadDataset,
  launchJupyter,
  testConnection,
  writeKaggleCredentials,
}
