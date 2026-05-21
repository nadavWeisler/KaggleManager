<div align="center">

<img src="https://img.shields.io/badge/KaggleManager-v1.0.0-20BEFF?style=for-the-badge&logo=kaggle&logoColor=white" alt="KaggleManager"/>

# KaggleManager

**A GitHub Desktop–style GUI for Kaggle notebooks and datasets**

[![Electron](https://img.shields.io/badge/Electron-31-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Pull, push, and manage your Kaggle notebooks locally — just like GitHub Desktop, but for Kaggle.

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📓 **Notebook Manager** | List all your Kaggle kernels, pull them locally, edit, and push back |
| 🗃️ **Dataset Browser** | Search, download, and manage Kaggle datasets to local folders |
| 🚀 **One-click Jupyter** | Launch any notebook in Jupyter with a single button |
| 💻 **VS Code Integration** | Open any notebook or folder directly in VS Code |
| 📜 **Live Log Drawer** | Stream real-time CLI output with color-coded status lines |
| ⚙️ **Persistent Settings** | API key, workspace directory, and Jupyter path saved across sessions |

---

## 📸 Screenshots

> _Coming soon — run `npm run dev` to see the app in action._

---

## 🚀 Getting Started

### Prerequisites

| Tool | Install |
|---|---|
| **Node.js** ≥ 18 | [nodejs.org](https://nodejs.org/) |
| **Kaggle CLI** | `pip install kaggle` |
| **Kaggle API token** | [kaggle.com → Settings → API](https://www.kaggle.com/settings) |
| **Jupyter** _(optional)_ | `pip install jupyter` |
| **VS Code** _(optional)_ | [code.visualstudio.com](https://code.visualstudio.com/) |

### Kaggle API Setup

1. Go to [kaggle.com/settings](https://www.kaggle.com/settings) → **Account** → **API** → **Create New Token**
2. This downloads `kaggle.json`. Place it at:
   - **Linux/macOS:** `~/.kaggle/kaggle.json`
   - **Windows:** `C:\Users\<username>\.kaggle\kaggle.json`
3. Set permissions: `chmod 600 ~/.kaggle/kaggle.json`

Alternatively, enter your credentials directly in **KaggleManager → Settings**.

---

## 📦 Installation

### Option A — Run from Source

```bash
git clone https://github.com/nadavWeisler/KaggleManager.git
cd KaggleManager
npm install
npm run dev
```

### Option B — Download Release

Download the latest `.AppImage` (Linux) from the [Releases page](https://github.com/nadavWeisler/KaggleManager/releases).

```bash
chmod +x KaggleManager-*.AppImage
./KaggleManager-*.AppImage
```

### Option C — Build Yourself

```bash
npm install
npm run build        # Builds Vite + packages with electron-builder
```

Output is in `dist_electron/`.

---

## 🖥️ Usage

### First Launch

1. Open **Settings** (gear icon in sidebar)
2. Enter your Kaggle username and API key
3. Choose a **local workspace directory** (e.g. `~/kaggle-workspace`)
4. Optionally set your Jupyter path (defaults to `jupyter` on PATH)
5. Click **Save Settings**

### Working with Notebooks

#### Pull a Notebook
Click **↓ Pull** on any notebook card. The kernel is downloaded to:
```
<workspace>/notebooks/<username>_<notebook-slug>/
```
This folder contains the `.ipynb` file + `kernel-metadata.json`.

#### Edit Locally
- **Jupyter** button → opens the notebook in Jupyter in your browser
- **Code** button → opens the folder in VS Code
- **📁** button → opens the folder in your file manager

#### Push Changes Back
Click **↑ Push** to sync your local edits back to Kaggle. This runs `kaggle kernels push` and streams output to the Log Drawer.

### Working with Datasets

1. Go to the **Datasets** tab
2. Search by topic (e.g. "titanic", "house prices")
3. Click **⬇ Download** — the dataset is downloaded and unzipped to:
   ```
   <workspace>/datasets/<owner>_<dataset-slug>/
   ```

### Log Drawer

Click the **≡** icon at the bottom of the sidebar to toggle the log drawer. All Kaggle CLI output streams here in real time, color-coded:

| Color | Meaning |
|---|---|
| 🟡 Yellow | Command started / warning |
| 🔴 Red | Error |
| 🟢 Green | Success |
| ⚪ Gray | Info |

---

## 🏗️ Architecture

```
KaggleManager/
├── electron/
│   ├── main.js          # Electron main process, IPC handlers, BrowserWindow
│   ├── preload.js       # contextBridge — securely exposes API to renderer
│   └── kaggle.js        # Wraps kaggle CLI via child_process.spawn
├── src/
│   ├── App.jsx          # Root layout
│   ├── main.jsx         # React entry point
│   ├── index.css        # Tailwind base styles
│   ├── components/
│   │   ├── Sidebar.jsx        # Icon nav with log indicator
│   │   ├── NotebookList.jsx   # Notebooks tab
│   │   ├── NotebookCard.jsx   # Per-notebook Pull/Push/Open actions
│   │   ├── DatasetList.jsx    # Datasets tab with search
│   │   ├── DatasetCard.jsx    # Per-dataset download
│   │   ├── LogDrawer.jsx      # Live log streaming panel
│   │   └── Settings.jsx       # Config form
│   └── store/
│       └── useAppStore.js     # Zustand global state
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### IPC Bridge

All Kaggle CLI calls run in the Electron main process (Node.js) and communicate with the React renderer via secure IPC channels:

| Channel | Direction | Purpose |
|---|---|---|
| `kaggle:list` | renderer → main | List remote kernels |
| `kaggle:pull` | renderer → main | Pull kernel to local path |
| `kaggle:push` | renderer → main | Push local kernel to Kaggle |
| `kaggle:datasets` | renderer → main | Search/list datasets |
| `kaggle:download-dataset` | renderer → main | Download & unzip dataset |
| `jupyter:launch` | renderer → main | Spawn Jupyter for a notebook |
| `vscode:open` | renderer → main | Open path in VS Code |
| `log:stream` | main → renderer | Stream CLI stdout/stderr |
| `settings:get/set` | renderer ↔ main | Read/write electron-store config |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | [Electron 31](https://www.electronjs.org/) |
| UI framework | [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) |
| State | [Zustand 4](https://zustand-demo.pmnd.rs/) |
| Config persistence | [electron-store 8](https://github.com/sindresorhus/electron-store) |
| CLI integration | Node.js `child_process.spawn` |
| Packaging | [electron-builder 24](https://www.electron.build/) |

---

## 🔧 Development

```bash
# Install dependencies
npm install

# Start dev mode (Vite + Electron hot-reload)
npm run dev

# Build React only (no Electron packaging)
npm run build:vite

# Full build + package
npm run build
```

### Environment

The app detects `NODE_ENV=development` or `app.isPackaged` to decide whether to load Vite dev server (`localhost:5173`) or the built `dist/index.html`.

---

## 🔒 Security

- All Node.js / Kaggle CLI code runs exclusively in the **main process**
- The renderer has `nodeIntegration: false` and `contextIsolation: true`
- The `preload.js` exposes only a safe, scoped API via `contextBridge`
- API keys are stored locally via `electron-store` (never sent anywhere except the Kaggle API)

---

## 🗺️ Roadmap

- [ ] Show local diff / dirty state per notebook (modified since last pull)
- [ ] Notebook version history viewer
- [ ] Auto-sync on file change (watch mode)
- [ ] Competition browser & submission manager
- [ ] Dark / Light theme toggle

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss what you'd like to change.

```bash
git checkout -b feature/my-feature
# make changes
git commit -m "feat: add my feature"
git push origin feature/my-feature
# open a PR
```

---

## 📄 License

[MIT](LICENSE) © [Nadav Weisler](https://github.com/nadavWeisler)

---

<div align="center">
Made with ☕ and the <a href="https://www.kaggle.com/docs/api">Kaggle API</a>
</div>
