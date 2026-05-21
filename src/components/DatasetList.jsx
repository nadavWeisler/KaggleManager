import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import DatasetCard from './DatasetCard'

export default function DatasetList() {
  const { datasets, datasetsLoading, loadDatasets, datasetSearch, setDatasetSearch } = useAppStore()
  const [inputVal, setInputVal] = useState(datasetSearch)

  useEffect(() => {
    loadDatasets('')
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    setDatasetSearch(inputVal)
    loadDatasets(inputVal)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Datasets</h1>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Search Kaggle datasets..."
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#20BEFF]"
        />
        <button
          type="submit"
          disabled={datasetsLoading}
          className="px-5 py-2 bg-[#20BEFF] hover:bg-sky-400 text-slate-900 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {datasetsLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {datasets.length === 0 && !datasetsLoading && (
        <div className="text-center py-20 text-slate-500">
          <p>No datasets found.</p>
          <p className="text-xs mt-1">Try searching for a topic above.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {datasets.map((ds, i) => (
          <DatasetCard key={ds.ref || i} dataset={ds} />
        ))}
      </div>
    </div>
  )
}
