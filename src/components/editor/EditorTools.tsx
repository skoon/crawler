import React, { useRef } from 'react'
import type { LevelData } from '../../types'
import type { EditorMode } from './Editor'

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
        </div>
      </div>

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
         <button onClick={() => fileInputRef.current?.click()}>Import JSON</button>
         <input type="file" accept=".json" style={{display:'none'}} ref={fileInputRef} onChange={handleImport} />
      </div>

      <button onClick={props.onExit} style={{marginTop: 'auto', borderColor: '#8b0000'}}>Exit Editor</button>
    </div>
  )
}
