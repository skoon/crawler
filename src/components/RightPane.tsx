import { useState } from 'react'
import { StatsPane } from './StatsPane'
import { InventoryPane } from './InventoryPane'
import { LogPane } from './LogPane'

type Tab = 'stats' | 'inventory' | 'log'

export function RightPane() {
  const [tab, setTab] = useState<Tab>('stats')

  return (
    <div className="right-pane">
      <div className="tab-bar">
        <button
          className={`tab-btn${tab === 'stats' ? ' active' : ''}`}
          onClick={() => setTab('stats')}
        >
          Stats
        </button>
        <button
          className={`tab-btn${tab === 'inventory' ? ' active' : ''}`}
          onClick={() => setTab('inventory')}
        >
          Inventory
        </button>
        <button
          className={`tab-btn${tab === 'log' ? ' active' : ''}`}
          onClick={() => setTab('log')}
        >
          Log
        </button>
      </div>
      <div className="tab-content">
        {tab === 'stats' && <StatsPane />}
        {tab === 'inventory' && <InventoryPane />}
        {tab === 'log' && <LogPane />}
      </div>
    </div>
  )
}
