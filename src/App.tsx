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
import { useState } from 'react'
import { useFogOfWar } from './systems/fogOfWar'
import { MainMenu } from './components/MainMenu'
import './App.css'

function Game() {
  useMovementSystem()
  useEncounterCheck()
  useItemPickup()
  useSecretDoorDetect()
  useFogOfWar()

  return (
    <div className="app">
      <aside className="pane pane-left">
        <PartyPane />
      </aside>
      <main className="pane pane-center">
        <div>
          <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} />
            <DungeonView />
            <DungeonViewCamera />
          </Canvas>
          <CombatOverlay />
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

  return <Game />
}

export default App
