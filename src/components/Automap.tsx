import { useMemo } from 'react'
import { useGameStore } from '../store'
import {
  TILE_WALL, TILE_FLOOR, TILE_DOOR, TILE_PIT,
  TILE_STAIRS_UP, TILE_STAIRS_DOWN, TILE_DOOR_CLOSED, TILE_SECRET_DOOR,
} from '../types'

const CELL = 10
const GAP = 1

const TILE_COLORS: Record<number, string> = {
  [TILE_WALL]: '#333',
  [TILE_FLOOR]: '#555',
  [TILE_DOOR]: '#864',
  [TILE_PIT]: '#411',
  [TILE_STAIRS_UP]: '#282',
  [TILE_STAIRS_DOWN]: '#822',
  [TILE_DOOR_CLOSED]: '#864',
  [TILE_PRESSURE_PLATE]: '#48f',
  [TILE_TELEPORTER]: '#a4f',
  [TILE_TRAP_HIDDEN]: '#a22',
  [TILE_SWITCH]: '#ca4',
}

const FACING_ARROWS = ['▲', '►', '▼', '◄']

export function Automap() {
  const dungeonMap = useGameStore((s) => s.dungeonMap)
  const exploredTiles = useGameStore((s) => s.exploredTiles)
  const secretDoorsRevealed = useGameStore((s) => s.secretDoorsRevealed)
  const playerX = useGameStore((s) => s.playerPosition.x)
  const playerY = useGameStore((s) => s.playerPosition.y)
  const playerFacing = useGameStore((s) => s.playerFacing)

  const grid = useMemo(() => {
    if (!dungeonMap.length) return null
    const height = dungeonMap.length
    const width = dungeonMap[0].length
    const rows: React.ReactNode[] = []

    for (let y = 0; y < height; y++) {
      const cells: React.ReactNode[] = []
      for (let x = 0; x < width; x++) {
        const tile = dungeonMap[y]?.[x]
        const explored = exploredTiles[`${x},${y}`]
        const isPlayer = x === playerX && y === playerY
        let color: string
        let label: string | undefined

        if (isPlayer) {
          color = '#e8d5a3'
          label = FACING_ARROWS[playerFacing]
        } else if (!explored) {
          color = 'transparent'
        } else if (tile === TILE_SECRET_DOOR && !secretDoorsRevealed[`${x},${y}`]) {
          color = TILE_COLORS[TILE_WALL]
        } else {
          color = TILE_COLORS[tile] || '#222'
        }

        cells.push(
          <div
            key={x}
            style={{
              width: CELL,
              height: CELL,
              backgroundColor: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              lineHeight: 1,
              color: playerFacing !== undefined && isPlayer ? '#000' : undefined,
              fontWeight: 'bold',
            }}
          >
            {label}
          </div>
        )
      }
      rows.push(
        <div key={y} style={{ display: 'flex', gap: GAP }}>
          {cells}
        </div>
      )
    }
    return rows
  }, [dungeonMap, exploredTiles, secretDoorsRevealed, playerX, playerY, playerFacing])

  if (!grid) return null

  return (
    <div className="automap">
      <div className="automap-frame">
        <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
          {grid}
        </div>
      </div>
    </div>
  )
}
