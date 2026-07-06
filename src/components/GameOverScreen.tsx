import { getSaveSlots, loadGame } from '../systems/saveLoad'

interface Props {
  onNewGame: () => void
  onQuit: () => void
  onLoaded: () => void
}

export function GameOverScreen({ onNewGame, onQuit, onLoaded }: Props) {
  const slots = getSaveSlots()

  const handleLoad = () => {
    if (slots.length > 0 && loadGame(slots[0].slot)) onLoaded()
  }

  return (
    <div className="gameover">
      <h1 className="gameover-title">TOTAL PARTY KILL</h1>
      <p className="gameover-sub">
        Your party has fallen in the depths. The catacombs claim another band of adventurers.
      </p>
      <div className="gameover-actions">
        <button className="gameover-btn" onClick={handleLoad} disabled={slots.length === 0}>
          Load Save
        </button>
        <button className="gameover-btn" onClick={onNewGame}>New Game</button>
        <button className="gameover-btn" onClick={onQuit}>Quit to Menu</button>
      </div>
    </div>
  )
}
