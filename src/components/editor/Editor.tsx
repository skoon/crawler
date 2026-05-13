import { useState, useEffect } from 'react'
import type { LevelData, EncounterTrigger, MapItem, Enemy, Item } from '../../types'
import { EditorCanvas } from './EditorCanvas'
import { EditorTools } from './EditorTools'

const defaultMap: LevelData = {
  id: 'new_level',
  name: 'New Level',
  width: 12,
  height: 12,
  startPosition: { x: 1, y: 1 },
  startFacing: 0,
  tiles: Array(12).fill(0).map(() => Array(12).fill(0)), // default all walls
  encounters: [],
  items: [],
}

export type EditorMode = 'paint' | 'start' | 'enemy' | 'item'

export function Editor({ onExit, onTest }: { onExit: () => void, onTest: (lvl: LevelData) => void }) {
  const [level, setLevel] = useState<LevelData>(() => {
    const backup = localStorage.getItem('editor_backup')
    if (backup) {
      try {
        return JSON.parse(backup)
      } catch (e) {}
    }
    return defaultMap
  })

  // Sync to local storage so you don't lose work when testing
  useEffect(() => {
    localStorage.setItem('editor_backup', JSON.stringify(level))
  }, [level])

  const [mode, setMode] = useState<EditorMode>('paint')
  const [paintTile, setPaintTile] = useState<number>(1) // 1 = Floor

  // State for placing entities
  const [pendingEnemyName, setPendingEnemyName] = useState('Goblin')
  const [pendingItemId, setPendingItemId] = useState('healing-potion')

  const handleCellClick = (x: number, y: number) => {
    setLevel((prev) => {
      const next = { ...prev }
      if (mode === 'paint') {
        const newTiles = next.tiles.map((row) => [...row])
        newTiles[y][x] = paintTile
        next.tiles = newTiles
      } else if (mode === 'start') {
        next.startPosition = { x, y }
      } else if (mode === 'enemy') {
        const existingIdx = next.encounters.findIndex((e) => e.x === x && e.y === y)
        const enemy: Omit<Enemy, 'id' | 'tileX' | 'tileY'> = {
          name: pendingEnemyName,
          hp: 10, maxHp: 10, ac: 10, thac0: 18, damage: '1d6', damageBonus: 0, xp: 10
        }
        if (existingIdx >= 0) {
          next.encounters = [...next.encounters]
          next.encounters[existingIdx] = {
            ...next.encounters[existingIdx],
            enemies: [...next.encounters[existingIdx].enemies, enemy]
          }
        } else {
          next.encounters = [...next.encounters, { x, y, enemies: [enemy] }]
        }
      } else if (mode === 'item') {
        const item: Item = {
          id: pendingItemId,
          name: pendingItemId.replace('-', ' '),
          type: 'misc',
          weight: 1,
          description: 'A placed item.',
          effects: {},
          consumable: false
        }
        next.items = [...next.items, { item, tileX: x, tileY: y }]
      }
      return next
    })
  }

  const handleResize = (newW: number, newH: number) => {
    setLevel((prev) => {
      const newTiles = Array(newH).fill(0).map((_, y) => 
        Array(newW).fill(0).map((_, x) => 
          prev.tiles[y]?.[x] ?? 0
        )
      )
      return { ...prev, width: newW, height: newH, tiles: newTiles }
    })
  }

  return (
    <div className="editor-layout">
      <div className="editor-canvas-container">
        <EditorCanvas 
          level={level} 
          onCellClick={handleCellClick} 
          onCellRightClick={(x,y) => {
             setLevel(prev => ({
               ...prev,
               encounters: prev.encounters.filter(e => !(e.x === x && e.y === y)),
               items: prev.items.filter(i => !(i.tileX === x && i.tileY === y))
             }))
          }}
        />
      </div>
      <div className="editor-sidebar">
        <EditorTools
          level={level}
          onUpdateLevel={setLevel}
          mode={mode}
          onSetMode={setMode}
          paintTile={paintTile}
          onSetPaintTile={setPaintTile}
          pendingEnemyName={pendingEnemyName}
          onSetPendingEnemyName={setPendingEnemyName}
          pendingItemId={pendingItemId}
          onSetPendingItemId={setPendingItemId}
          onResize={handleResize}
          onTest={() => onTest(level)}
          onExit={onExit}
        />
      </div>
    </div>
  )
}
