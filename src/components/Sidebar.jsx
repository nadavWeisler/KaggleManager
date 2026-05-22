import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'

const tabs = [
  {
    id: 'notebooks',
    label: 'Notebooks',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'datasets',
    label: 'Datasets',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 11h16M4 15h16" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

function UserAvatar({ username }) {
  const [imgFailed, setImgFailed] = useState(false)
  const initials = username ? username.slice(0, 2).toUpperCase() : '?'
  const avatarUrl = `https://www.kaggle.com/${username}/avatar`

  if (!username) {
    return (
      <div
        title="Not logged in — add credentials in Settings"
        className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-600"
      >
        ?
      </div>
    )
  }

  return (
    <a
      href={`https://www.kaggle.com/${username}`}
      target="_blank"
      rel="noreferrer"
      title={`@${username} — open Kaggle profile`}
      className="block w-9 h-9 rounded-full overflow-hidden border-2 border-slate-700 hover:border-[#20BEFF] transition-colors"
    >
      {!imgFailed ? (
        <img
          src={avatarUrl}
          alt={username}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="w-full h-full bg-[#20BEFF] flex items-center justify-center text-slate-900 text-xs font-bold">
          {initials}
        </div>
      )}
    </a>
  )
}

export default function Sidebar() {
  const { activeTab, setActiveTab, toggleLogDrawer, logDrawerOpen, logs, settings } = useAppStore()
  const username = settings.kaggleUsername || ''

  return (
    <aside className="w-16 flex flex-col items-center bg-slate-950 border-r border-slate-800 py-4 gap-2">
      {/* Logo */}
      <div className="mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#20BEFF] flex items-center justify-center text-slate-900 font-bold text-sm">K</div>
      </div>

      {tabs.map((tab) => (
        <button
          key={tab.id}
          title={tab.label}
          onClick={() => setActiveTab(tab.id)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            activeTab === tab.id
              ? 'bg-[#20BEFF] text-slate-900'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
          }`}
        >
          {tab.icon}
        </button>
      ))}

      {/* Bottom: logs + user avatar */}
      <div className="mt-auto flex flex-col items-center gap-3">
        <div className="relative">
          <button
            title="Logs"
            onClick={toggleLogDrawer}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              logDrawerOpen ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            {logs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#20BEFF]" />
            )}
          </button>
        </div>

        <UserAvatar username={username} />
      </div>
    </aside>
  )
}

