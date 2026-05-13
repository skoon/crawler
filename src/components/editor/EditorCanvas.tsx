import React from 'react'
import type { LevelData } from '../../types'

interface Props {
  level: LevelData
  onCellClick: (x: number, y: number) => void
  onCellRightClick: (x: number, y: number) => void
}

export function EditorCanvas({ level, onCellClick, onCellRightClick }: Props) {
  
  const getCellColor = (tile: number) => {
    switch(tile) {
      case 0: return '#111' // Wall
      case 1: return '#444' // Floor
      case 2: return '#642' // Door
      case 3: return '#222' // Pit
      case 4: return '#4a4' // Stairs Up
      case 5: return '#a44' // Stairs Down
      case 6: return '#864' // Door Closed
      case 7: return '#333' // Secret Door
      default: return '#000'
    }
  }

  const getEntityIcon = (x: number, y: number) => {
    if (level.startPosition.x === x && level.startPosition.y === y) return 'S'
    const encounter = level.encounters.find(e => e.x === x && e.y === y)
    if (encounter) return 'E'
    const item = level.items.find(i => i.tileX === x && i.tileY === y)
    if (item) return 'I'
    return ''
  }

  return (
    <div className="editor-canvas" style={{ 
      display: 'grid', 
      gridTemplateColumns: `repeat(${level.width}, 30px)`,
      gridTemplateRows: `repeat(${level.height}, 30px)`,
      gap: '1px',
      background: '#000',
      border: '2px solid #333',
      padding: '2px',
      overflow: 'auto'
    }}>
      {level.tiles.map((row, y) => 
        row.map((tile, x) => (
          <div 
            key={`${x},${y}`} 
            className="editor-cell"
            style={{
              width: '30px', height: '30px',
              backgroundColor: getCellColor(tile),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '12px', fontWeight: 'bold',
              cursor: 'pointer',
              userSelect: 'none'
            }}
            onMouseDown={(e) => {
              if (e.button === 0) {
                onCellClick(x, y)
              } else if (e.button === 2) {
                e.preventDefault()
                onCellRightClick(x, y)
              }
            }}
            onMouseEnter={(e) => {
              if (e.buttons === 1) onCellClick(x, y) // click and drag painting
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {getEntityIcon(x, y)}
          </div>
        ))
      )}
    </div>
  )
}
