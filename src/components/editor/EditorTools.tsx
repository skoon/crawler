import React, { useRef } from 'react'
import type { LevelData, LevelTransition } from '../../types'
import { TILE_STAIRS_UP } from '../../types'
import type { EditorMode } from './Editor'
import { useGameStore } from '../../store'
import { exportModule, downloadModule } from '../../systems/dungeonModule'
import { listStairs, getTransition, upsertTransition, removeTransition } from './editorTransitions'

interface Props {
  level: LevelData
  onUpdateLevel: (level: LevelData) => void
  mode: EditorMode
  onSetMode: (m: EditorMode) => void
  paintTile: number
  onSetPaintTile: (t: number) => void
  pendingEnemyName: string
  onSetPendingEnemyName: (n: string) => void
  pendingItemId: string
  onSetPendingItemId: (i: string) => void
  onResize: (w: number, h: number) => void
  onTest: () => void
  onExit: () => void
}

export function EditorTools(props: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(props.level, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href",     dataStr)
    downloadAnchorNode.setAttribute("download", `${props.level.id || 'level'}.json`)
    document.body.appendChild(downloadAnchorNode) // required for firefox
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const handleExportModule = async () => {
    const current = props.level
    // Bundle every registered level, with the current edit taking precedence by id.
    const registered = useGameStore.getState().levels
    const byId: Record<string, LevelData> = { ...registered, [current.id]: current }
    const levels = Object.values(byId)

    const name = prompt('Module name:', current.name || current.id || 'Untitled Module')
    if (name === null) return // cancelled

    const blob = await exportModule(levels, {
      name: name || current.id || 'module',
      version: '1.0.0',
      entryLevelId: current.id,
    })
    const safeName = (name || current.id || 'module').replace(/[^a-z0-9_-]+/gi, '_')
    downloadModule(blob, `${safeName}.zip`)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as LevelData
        props.onUpdateLevel(json)
      } catch (err) {
        alert("Failed to parse JSON")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2>Map Editor</h2>
      
      <div className="editor-panel">
        <h3>Metadata</h3>
        <label>ID: <input value={props.level.id} onChange={e => props.onUpdateLevel({...props.level, id: e.target.value})} /></label>
        <label>Name: <input value={props.level.name} onChange={e => props.onUpdateLevel({...props.level, name: e.target.value})} /></label>
        <label>Floor Tex: <input value={props.level.floorTexture || ''} onChange={e => props.onUpdateLevel({...props.level, floorTexture: e.target.value})} /></label>
        <label>Wall Tex: <input value={props.level.wallTexture || ''} onChange={e => props.onUpdateLevel({...props.level, wallTexture: e.target.value})} /></label>
        <div style={{display:'flex', gap:'8px', marginTop: '8px'}}>
           <label>W: <input type="number" value={props.level.width} onChange={e => props.onResize(Number(e.target.value), props.level.height)} style={{width:'50px'}}/></label>
           <label>H: <input type="number" value={props.level.height} onChange={e => props.onResize(props.level.width, Number(e.target.value))} style={{width:'50px'}}/></label>
        </div>
      </div>

      <div className="editor-panel">
        <h3>Mode: {props.mode}</h3>
        <div style={{display:'flex', gap:'4px'}}>
          <button onClick={() => props.onSetMode('paint')} className={props.mode === 'paint' ? 'active' : ''}>Paint</button>
          <button onClick={() => props.onSetMode('start')} className={props.mode === 'start' ? 'active' : ''}>Start Pos</button>
          <button onClick={() => props.onSetMode('enemy')} className={props.mode === 'enemy' ? 'active' : ''}>Enemy</button>
          <button onClick={() => props.onSetMode('item')} className={props.mode === 'item' ? 'active' : ''}>Item</button>
          <button onClick={() => props.onSetMode('transition')} className={props.mode === 'transition' ? 'active' : ''}>Stairs</button>
        </div>
      </div>

      {props.mode === 'transition' && (
        <StairsTransitionPanel level={props.level} onUpdateLevel={props.onUpdateLevel} />
      )}

      {props.mode === 'paint' && (
        <div className="editor-panel">
          <h3>Palette</h3>
          <select value={props.paintTile} onChange={e => props.onSetPaintTile(Number(e.target.value))}>
            <option value={0}>Wall</option>
            <option value={1}>Floor</option>
            <option value={2}>Door (Open)</option>
            <option value={6}>Door (Closed)</option>
            <option value={7}>Secret Door</option>
            <option value={3}>Pit</option>
            <option value={4}>Stairs Up</option>
            <option value={5}>Stairs Down</option>
          </select>
        </div>
      )}

      {props.mode === 'enemy' && (
        <div className="editor-panel">
          <h3>Enemy Type</h3>
          <input value={props.pendingEnemyName} onChange={e => props.onSetPendingEnemyName(e.target.value)} />
          <p style={{fontSize:'10px', color:'#888'}}>Right-click to delete</p>
        </div>
      )}

      {props.mode === 'item' && (
        <div className="editor-panel">
          <h3>Item ID</h3>
          <input value={props.pendingItemId} onChange={e => props.onSetPendingItemId(e.target.value)} />
          <p style={{fontSize:'10px', color:'#888'}}>Right-click to delete</p>
        </div>
      )}

      <div className="editor-panel" style={{display:'flex', flexDirection:'column', gap:'8px'}}>
         <button onClick={props.onTest} style={{ borderColor: '#4a4', color: '#4a4' }}>Test Map</button>
         <button onClick={handleExport}>Export JSON</button>
         <button onClick={handleExportModule}>Export Module (.zip)</button>
         <button onClick={() => fileInputRef.current?.click()}>Import JSON</button>
         <input type="file" accept=".json" style={{display:'none'}} ref={fileInputRef} onChange={handleImport} />
      </div>

      <button onClick={props.onExit} style={{marginTop: 'auto', borderColor: '#8b0000'}}>Exit Editor</button>
    </div>
  )
}

const FACING_LABELS = ['North', 'East', 'South', 'West']

function StairsTransitionPanel({
  level,
  onUpdateLevel,
}: {
  level: LevelData
  onUpdateLevel: (level: LevelData) => void
}) {
  const stairs = listStairs(level)

  const editField = (
    x: number,
    y: number,
    patch: Partial<LevelTransition>,
  ) => {
    const existing = getTransition(level, x, y)
    const base: LevelTransition = existing ?? {
      tileX: x,
      tileY: y,
      targetLevelId: '',
      targetPosition: { x: 1, y: 1 },
      targetFacing: 0,
    }
    onUpdateLevel(upsertTransition(level, { ...base, ...patch, tileX: x, tileY: y }))
  }

  return (
    <div className="editor-panel">
      <h3>Stairs Links</h3>
      {stairs.length === 0 && (
        <p style={{ fontSize: '11px', color: '#888' }}>
          Paint a Stairs Up/Down tile first, then link it to a target level here.
        </p>
      )}
      {stairs.map(({ x, y, type }) => {
        const t = getTransition(level, x, y)
        const kind = type === TILE_STAIRS_UP ? 'Stairs Up' : 'Stairs Down'
        return (
          <div
            key={`${x},${y}`}
            style={{ border: '1px solid #333', padding: '6px', marginBottom: '8px', borderRadius: '3px' }}
          >
            <div style={{ fontSize: '12px', color: '#cbb98a', marginBottom: '4px' }}>
              {kind} @ ({x}, {y}) {t ? '' : '— not linked'}
            </div>
            <label style={{ display: 'block', fontSize: '11px' }}>
              Target Level ID:{' '}
              <input
                value={t?.targetLevelId ?? ''}
                placeholder="e.g. catacombs_2"
                onChange={(e) => editField(x, y, { targetLevelId: e.target.value })}
                style={{ width: '120px' }}
              />
            </label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <label style={{ fontSize: '11px' }}>
                X:{' '}
                <input
                  type="number"
                  value={t?.targetPosition.x ?? 1}
                  onChange={(e) =>
                    editField(x, y, {
                      targetPosition: { x: Number(e.target.value), y: t?.targetPosition.y ?? 1 },
                    })
                  }
                  style={{ width: '44px' }}
                />
              </label>
              <label style={{ fontSize: '11px' }}>
                Y:{' '}
                <input
                  type="number"
                  value={t?.targetPosition.y ?? 1}
                  onChange={(e) =>
                    editField(x, y, {
                      targetPosition: { x: t?.targetPosition.x ?? 1, y: Number(e.target.value) },
                    })
                  }
                  style={{ width: '44px' }}
                />
              </label>
              <label style={{ fontSize: '11px' }}>
                Facing:{' '}
                <select
                  value={t?.targetFacing ?? 0}
                  onChange={(e) => editField(x, y, { targetFacing: Number(e.target.value) })}
                >
                  {FACING_LABELS.map((label, i) => (
                    <option key={i} value={i}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {t && (
              <button
                onClick={() => onUpdateLevel(removeTransition(level, x, y))}
                style={{ marginTop: '4px', fontSize: '11px', borderColor: '#8b0000', color: '#c88' }}
              >
                Unlink
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
