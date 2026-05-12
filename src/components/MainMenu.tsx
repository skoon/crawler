import { useState, useEffect } from 'react'
import { loadGame, getSaveSlots } from '../systems/saveLoad'

interface Props {
  onStart: () => void
}

export function MainMenu({ onStart }: Props) {
  const [view, setView] = useState<'main' | 'about' | 'load'>('main')
  const [slots, setSlots] = useState<{ slot: number; timestamp: string }[]>([])

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
      <button onClick={onStart}>New Game</button>
      <button onClick={() => setView('load')}>Load Game</button>
      <button onClick={() => setView('about')}>About</button>
    </div>
  )
}
