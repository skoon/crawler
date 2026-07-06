import { Canvas } from '@react-three/fiber'
import { DungeonView } from './components/DungeonView'
import { DungeonViewCamera } from './components/DungeonViewCamera'
import { PartyPane } from './components/PartyPane'
import { RightPane } from './components/RightPane'
import { CombatOverlay } from './components/CombatOverlay'
import { DialogueOverlay } from './components/DialogueOverlay'
import { ShopOverlay } from './components/ShopOverlay'
import { useMovementSystem } from './systems/movement'
import { useEncounterCheck } from './systems/encounterCheck'
import { useItemPickup } from './systems/itemPickup'
import { useSecretDoorDetect } from './systems/secretDoorDetect'
import { useTrapSystem } from './systems/trapSystem'
import { useState, useEffect } from 'react'
import { useFogOfWar } from './systems/fogOfWar'
import { useStatusEffectsSystem } from './systems/statusEffects'
import { useTorchTimer } from './hooks/useTorchTimer'
import { TorchHUD } from './components/TorchHUD'
import { TorchLighting } from './components/TorchLighting'
import { TargetingReticle } from './components/TargetingReticle'
import { useAudioManager } from './systems/audio'
import { useAmbientAudio } from './systems/ambientAudio'
import { useMusicManager } from './systems/musicManager'
import { MainMenu } from './components/MainMenu'
import { CharacterCreation } from './components/CharacterCreation'
import { GameOverScreen } from './components/GameOverScreen'
import { LevelUpModal } from './components/LevelUpModal'
import { startNewGame } from './systems/newGame'
import { InGameMenu } from './components/InGameMenu'
import { Editor } from './components/editor/Editor'
import './App.css'
import { useGameStore } from './store'
import { Automap } from './components/Automap'

interface GameProps {
  onQuit: () => void
}

function Game({ onQuit }: GameProps) {
  const [isPaused, setIsPaused] = useState(false)
  useMovementSystem(isPaused)
  useEncounterCheck()
  useItemPickup()
  useSecretDoorDetect()
  useTrapSystem()
  useFogOfWar()
  useStatusEffectsSystem()
  useTorchTimer(isPaused)
  useAmbientAudio()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        const state = useGameStore.getState()
        if (state.targetingMode) {
          // Let the combat overlay's own handler cancel aiming; don't open the pause menu.
          state.setTargetingMode(false)
          state.setTargetPosition(null)
        } else if (state.activeNpcId !== null) {
          state.endDialogue()
        } else {
          setIsPaused(p => !p)
        }
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
            <color attach="background" args={['#050505']} />
            <fog attach="fog" args={['#050505', 3, 11]} />
            <TorchLighting />
            <DungeonView />
            <TargetingReticle />
            <DungeonViewCamera />
          </Canvas>
          <TorchHUD />
          <CombatOverlay />
          <DialogueOverlay />
          <ShopOverlay />
          <Automap />
          <LevelUpModal />
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
  const [route, setRoute] = useState<'menu' | 'creation' | 'game' | 'editor'>('menu')
  const gameOver = useGameStore((s) => s.gameOver)
  useAudioManager()
  useMusicManager(route === 'creation' ? 'menu' : route)

  if (route === 'editor') {
    return <Editor
      onExit={() => setRoute('menu')}
      onTest={(lvl) => {
        useGameStore.getState().loadLevel(lvl)
        setRoute('game')
      }}
    />
  }

  if (route === 'creation') {
    return (
      <CharacterCreation
        onCancel={() => setRoute('menu')}
        onComplete={(party) => {
          startNewGame(party)
          setRoute('game')
        }}
      />
    )
  }

  if (route === 'game') {
    return (
      <>
        <Game onQuit={() => setRoute('menu')} />
        {gameOver && (
          <GameOverScreen
            onNewGame={() => {
              useGameStore.getState().resetGameOver()
              setRoute('creation')
            }}
            onQuit={() => {
              useGameStore.getState().resetGameOver()
              setRoute('menu')
            }}
            onLoaded={() => {
              /* loadGame already cleared gameOver; stay in the game route */
            }}
          />
        )}
      </>
    )
  }

  return (
    <MainMenu
      onNewGame={() => setRoute('creation')}
      onStart={() => setRoute('game')}
      onEditor={() => setRoute('editor')}
    />
  )
}

export default App
