import { useState, useEffect, useRef } from 'react'
import { loadGame, getSaveSlots } from '../systems/saveLoad'
import { importModule } from '../systems/dungeonModule'
import { useGameStore } from '../store'
import catacombsLevel from '../map/catacombs_1.json'
import catacombsLevel2 from '../map/catacombs_2.json'
import type { LevelData } from '../types'

interface Props {
  onStart: () => void
  onEditor: () => void
}

export function MainMenu({ onStart, onEditor }: Props) {
  const [view, setView] = useState<'main' | 'about' | 'load'>('main')
  const [slots, setSlots] = useState<{ slot: number; timestamp: string }[]>([])
  const moduleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (view === 'load') {
      setSlots(getSaveSlots())
    }
  }, [view])

  const handleLoad = (slot: number) => {
    if (loadGame(slot)) {
      onStart()
    }
  }

  const handleNewGame = () => {
    const store = useGameStore.getState()
    store.registerLevel(catacombsLevel as LevelData)
    store.registerLevel(catacombsLevel2 as LevelData)
    store.changeLevel('catacombs_1', catacombsLevel.startPosition, catacombsLevel.startFacing)
    onStart()
  }

  const handleLoadModule = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    try {
      const { manifest, levels } = await importModule(file)
      useGameStore.getState().loadModule(levels, manifest.entryLevelId)
      onStart()
    } catch (err) {
      alert(`Failed to load module: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  if (view === 'about') {
    return (
      <div className="main-menu" onClick={() => setView('main')}>
        <h1>Dungeon of the Catacombs</h1>
        <p className="about-text">
          A first-person dungeon crawler built with React, Three.js, and TypeScript.
        </p>
        <p className="about-text">
          Inspired by classic grid-based RPGs like Eye of the Beholder.
        </p>
        <p className="about-text" style={{ marginTop: 24, color: '#666', border: 'none', background: 'transparent' }}>
          Click anywhere to return.
        </p>
      </div>
    )
  }

  if (view === 'load') {
    return (
      <div className="main-menu">
        <h1>Load Game</h1>
        {slots.length === 0 ? (
          <p className="about-text" style={{ textAlign: 'center', marginBottom: 24 }}>No saved games found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', maxHeight: '50vh', overflowY: 'auto', padding: '10px' }}>
            {slots.map((s) => (
              <button key={s.slot} onClick={() => handleLoad(s.slot)} style={{ fontSize: '14px', width: '300px' }}>
                Slot {s.slot} — {new Date(s.timestamp).toLocaleString()}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => setView('main')}>Back</button>
      </div>
    )
  }

  return (
    <div className="main-menu">
      <h1>Dungeon of the Catacombs</h1>
      <h2>A First-Person Dungeon Crawl</h2>
      <button onClick={handleNewGame}>New Game</button>
      <button onClick={() => setView('load')}>Load Game</button>
      <button onClick={() => moduleInputRef.current?.click()}>Load Module (.zip)</button>
      <button onClick={onEditor}>Level Editor</button>
      <button onClick={() => setView('about')}>About</button>
      <input
        type="file"
        accept=".zip"
        style={{ display: 'none' }}
        ref={moduleInputRef}
        onChange={handleLoadModule}
      />
    </div>
  )
}
