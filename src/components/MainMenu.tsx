import { useState } from 'react'
import { loadGame } from '../systems/saveLoad'

interface Props {
  onStart: () => void
}

export function MainMenu({ onStart }: Props) {
  const [showAbout, setShowAbout] = useState(false)

  const handleContinue = () => {
    if (loadGame(0)) {
      onStart()
    }
  }

  if (showAbout) {
    return (
      <div className="main-menu" onClick={() => setShowAbout(false)}>
        <h1>Dungeon of the Catacombs</h1>
        <p className="about-text">
          A first-person dungeon crawler built with React, Three.js, and TypeScript.
        </p>
        <p className="about-text">
          Inspired by classic grid-based RPGs like Eye of the Beholder.
        </p>
        <p className="about-text" style={{ marginTop: 24, color: '#666' }}>
          Click anywhere to return.
        </p>
      </div>
    )
  }

  return (
    <div className="main-menu">
      <h1>Dungeon of the Catacombs</h1>
      <h2>A First-Person Dungeon Crawl</h2>
      <button onClick={onStart}>New Game</button>
      <button onClick={handleContinue}>Continue</button>
      <button onClick={() => setShowAbout(true)}>About</button>
    </div>
  )
}
