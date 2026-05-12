import { Canvas } from '@react-three/fiber'
import { DungeonView } from './components/DungeonView'
import { DungeonViewCamera } from './components/DungeonViewCamera'
import { PartyPane } from './components/PartyPane'
import { RightPane } from './components/RightPane'
import { CombatOverlay } from './components/CombatOverlay'
import { useMovementSystem } from './systems/movement'
import { useEncounterCheck } from './systems/encounterCheck'
import { useItemPickup } from './systems/itemPickup'
import { useSecretDoorDetect } from './systems/secretDoorDetect'
import { useState, useEffect } from 'react'
import { useFogOfWar } from './systems/fogOfWar'
import { MainMenu } from './components/MainMenu'
import { InGameMenu } from './components/InGameMenu'
import './App.css'
import { useGameStore } from './store'

interface GameProps {
  onQuit: () => void
}

function Game({ onQuit }: GameProps) {
  const [isPaused, setIsPaused] = useState(false)
  useMovementSystem(isPaused)
  useEncounterCheck()
  useItemPickup()
  useSecretDoorDetect()
  useFogOfWar()

  // Handle Escape to toggle pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        setIsPaused(p => !p)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="app">
      <aside className="pane pane-left">
        <PartyPane />
      </aside>
      <main className="pane pane-center">
        <div>
          <Canvas>
            <ambientLight intensity={0.05} />
            <DungeonView />
            <DungeonViewCamera />
          </Canvas>
          <CombatOverlay />
          {isPaused && <InGameMenu onClose={() => setIsPaused(false)} onQuit={onQuit} />}
        </div>
      </main>
      <aside className="pane pane-right">
        <RightPane />
      </aside>
    </div>
  )
}

function App() {
  const [gameStarted, setGameStarted] = useState(false)

  if (!gameStarted) {
    return <MainMenu onStart={() => setGameStarted(true)} />
  }

  return <Game onQuit={() => setGameStarted(false)} />
}

export default App
