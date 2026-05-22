import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#20BEFF] transition-colors"
    />
  )
}

export default function Settings() {
  const { settings, updateSetting } = useAppStore()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    workspaceDir: '',
    jupyterPath: 'jupyter',
    kagglePath: 'kaggle',
    kaggleUsername: '',
    kaggleKey: '',
  })

  useEffect(() => {
    setForm({
      workspaceDir: settings.workspaceDir || '',
      jupyterPath: settings.jupyterPath || 'jupyter',
      kagglePath: settings.kagglePath || 'kaggle',
      kaggleUsername: settings.kaggleUsername || '',
      kaggleKey: settings.kaggleKey || '',
    })
  }, [settings])

  async function handleSave() {
    for (const [key, value] of Object.entries(form)) {
      await updateSetting(key, value)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function pickWorkspaceDir() {
    if (!window.api) return
    const dir = await window.api.dialog.openDirectory()
    if (dir) setForm((f) => ({ ...f, workspaceDir: dir }))
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Settings</h1>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col gap-6">
        {/* Kaggle API */}
        <div>
          <h2 className="text-base font-semibold text-slate-200 mb-4">Kaggle API</h2>
          <div className="flex flex-col gap-4">
            <Field label="Kaggle Username">
              <Input
                value={form.kaggleUsername}
                onChange={(v) => setForm((f) => ({ ...f, kaggleUsername: v }))}
                placeholder="your-kaggle-username"
              />
            </Field>
            <Field label="Kaggle API Key">
              <Input
                type="password"
                value={form.kaggleKey}
                onChange={(v) => setForm((f) => ({ ...f, kaggleKey: v }))}
                placeholder="Your API key from kaggle.com/settings"
              />
            </Field>
            <p className="text-xs text-slate-500">
              Get your API key from <span className="text-[#20BEFF]">kaggle.com → Profile → Account → API</span>. Alternatively, place <code className="text-slate-300 bg-slate-700 px-1 rounded">~/.kaggle/kaggle.json</code> manually.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-700" />

        {/* Workspace */}
        <div>
          <h2 className="text-base font-semibold text-slate-200 mb-4">Local Workspace</h2>
          <div className="flex flex-col gap-4">
            <Field label="Workspace Directory">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.workspaceDir}
                  onChange={(e) => setForm((f) => ({ ...f, workspaceDir: e.target.value }))}
                  placeholder="~/.kaggle-manager"
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#20BEFF]"
                />
                <button
                  onClick={pickWorkspaceDir}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                >
                  Browse
                </button>
              </div>
              <p className="text-xs text-slate-500">Notebooks will be saved to <code className="text-slate-300 bg-slate-700 px-1 rounded">workspace/notebooks/</code>, datasets to <code className="text-slate-300 bg-slate-700 px-1 rounded">workspace/datasets/</code>.</p>
            </Field>
          </div>
        </div>

        <div className="border-t border-slate-700" />

        {/* Jupyter */}
        <div>
          <h2 className="text-base font-semibold text-slate-200 mb-4">Jupyter</h2>
          <Field label="Jupyter Executable Path">
            <Input
              value={form.jupyterPath}
              onChange={(v) => setForm((f) => ({ ...f, jupyterPath: v }))}
              placeholder="jupyter"
            />
            <p className="text-xs text-slate-500">Default: <code className="text-slate-300 bg-slate-700 px-1 rounded">jupyter</code>. Set full path if not in PATH (e.g. <code className="text-slate-300 bg-slate-700 px-1 rounded">/usr/local/bin/jupyter</code>).</p>
          </Field>
        </div>

        <div className="border-t border-slate-700" />

        {/* Kaggle CLI path */}
        <div>
          <h2 className="text-base font-semibold text-slate-200 mb-4">Kaggle CLI</h2>
          <Field label="Kaggle Executable Path">
            <Input
              value={form.kagglePath}
              onChange={(v) => setForm((f) => ({ ...f, kagglePath: v }))}
              placeholder="kaggle"
            />
            <p className="text-xs text-slate-500">
              Default: <code className="text-slate-300 bg-slate-700 px-1 rounded">kaggle</code>. If you see "ENOENT" errors, set the full path — usually{' '}
              <code className="text-slate-300 bg-slate-700 px-1 rounded">~/.local/bin/kaggle</code> or <code className="text-slate-300 bg-slate-700 px-1 rounded">/usr/local/bin/kaggle</code>.
            </p>
          </Field>
        </div>

        <button
          onClick={handleSave}
          className={`self-start px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
            saved
              ? 'bg-green-700 text-green-100'
              : 'bg-[#20BEFF] hover:bg-sky-400 text-slate-900'
          }`}
        >
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
