import { useState } from 'react'
import { saveGame } from '../systems/saveLoad'
import { useGameStore } from '../store'

interface Props {
  onClose: () => void
  onQuit: () => void
}

export function InGameMenu({ onClose, onQuit }: Props) {
  const [view, setView] = useState<'main' | 'save'>('main')

  const handleSave = (slot: number) => {
    saveGame(slot)
    onClose()
  }

  if (view === 'save') {
    return (
      <div className="combat-overlay" style={{ top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)' }}>
        <h2 style={{ color: '#e8d5a3', marginBottom: '20px', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '2px' }}>Save Game</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3, 4, 5].map((slot) => (
            <button key={slot} className="combat-btn" onClick={() => handleSave(slot)} style={{ width: '200px' }}>
              Save to Slot {slot}
            </button>
          ))}
        </div>
        <button className="combat-btn" onClick={() => setView('main')} style={{ width: '200px' }}>Back</button>
      </div>
    )
  }

  return (
    <div className="combat-overlay" style={{ top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)' }}>
      <h2 style={{ color: '#e8d5a3', marginBottom: '20px', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '2px' }}>Paused</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button className="combat-btn" onClick={onClose} style={{ width: '200px' }}>Resume</button>
        <button className="combat-btn" onClick={() => setView('save')} style={{ width: '200px' }}>Save Game</button>
        <button className="combat-btn" onClick={onQuit} style={{ width: '200px', borderColor: '#8b0000', color: '#c44' }}>Quit to Menu</button>
      </div>
      <div style={{ marginTop: '30px', color: '#777', fontSize: '12px', fontStyle: 'italic' }}>
        F5 = Quicksave (Slot 0) &nbsp; | &nbsp; F9 = Quickload (Slot 0)
      </div>
    </div>
  )
}
