import { useState } from 'react'
import type { PartyMember } from '../types'
import { classDefs, CLASS_IDS, STAT_KEYS, STAT_LABELS } from '../data/classDefinitions'
import type { StatKey } from '../data/classDefinitions'
import {
  rollAllStats,
  makePartyMember,
  deriveMaxHp,
  deriveBaseAc,
  deriveMaxMp,
  buildTemplateChars,
  partyTemplates,
} from '../systems/characterCreation'
import type { CreationChar, RollMethod } from '../systems/characterCreation'

interface Props {
  onComplete: (party: PartyMember[]) => void
  onCancel: () => void
}

export function CharacterCreation({ onComplete, onCancel }: Props) {
  const [method, setMethod] = useState<RollMethod>('3d6')
  const [chars, setChars] = useState<CreationChar[]>(() => buildTemplateChars(partyTemplates[0], '3d6'))
  const [selected, setSelected] = useState(0)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const current = chars[selected]

  const updateChar = (index: number, patch: Partial<CreationChar>) => {
    setChars((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }

  const applyTemplate = (templateId: string) => {
    const tpl = partyTemplates.find((t) => t.id === templateId)
    if (!tpl) return
    setChars(buildTemplateChars(tpl, method))
    setSelected(0)
  }

  const rerollCurrent = () => updateChar(selected, { stats: rollAllStats(method) })

  const handleDrop = (target: number) => {
    if (dragIndex === null || dragIndex === target) return
    setChars((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(target, 0, moved)
      return next
    })
    setSelected(target)
    setDragIndex(null)
  }

  const start = () => {
    const party = chars.map((c, i) => makePartyMember(String(i + 1), c.name, c.classId, c.stats))
    onComplete(party)
  }

  const scores = Object.fromEntries(STAT_KEYS.map((k) => [k, current.stats[k].total])) as Record<StatKey, number>
  const hp = deriveMaxHp(current.classId, scores.con)
  const ac = deriveBaseAc(current.classId, scores.dex)
  const mp = deriveMaxMp(current.classId, scores)
  const def = classDefs[current.classId]

  return (
    <div className="cc-screen">
      <h1 className="cc-title">Assemble Your Party</h1>

      <div className="cc-templates">
        <span className="cc-templates-label">Templates:</span>
        {partyTemplates.map((t) => (
          <button key={t.id} className="cc-template-btn" title={t.description} onClick={() => applyTemplate(t.id)}>
            {t.label}
          </button>
        ))}
        <span className="cc-method">
          Roll:
          <select value={method} onChange={(e) => setMethod(e.target.value as RollMethod)}>
            <option value="3d6">3d6</option>
            <option value="4d6-drop-lowest">4d6 drop lowest</option>
          </select>
        </span>
      </div>

      <div className="cc-body">
        <div className="cc-roster">
          {chars.map((c, i) => {
            const cd = classDefs[c.classId]
            return (
              <div
                key={i}
                className={`cc-slot${i === selected ? ' selected' : ''}`}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                onClick={() => setSelected(i)}
              >
                <span className="cc-slot-portrait" style={{ background: cd?.portraitColor ?? '#666' }} />
                <span className="cc-slot-info">
                  <span className="cc-slot-name">{c.name || '(unnamed)'}</span>
                  <span className="cc-slot-class">{cd?.name ?? c.classId}</span>
                </span>
                <span className="cc-slot-grip" title="Drag to reorder">⠿</span>
              </div>
            )
          })}
          <p className="cc-hint">Drag slots to set marching order (front to back).</p>
        </div>

        <div className="cc-editor">
          <label className="cc-field">
            Name
            <input value={current.name} onChange={(e) => updateChar(selected, { name: e.target.value })} maxLength={20} />
          </label>

          <label className="cc-field">
            Class
            <select value={current.classId} onChange={(e) => updateChar(selected, { classId: e.target.value })}>
              {CLASS_IDS.map((id) => (
                <option key={id} value={id}>
                  {classDefs[id].name}
                </option>
              ))}
            </select>
          </label>
          <p className="cc-class-desc">{def?.description}</p>

          <div className="cc-derived">
            <span>HP <b>{hp}</b></span>
            <span>AC <b>{ac}</b></span>
            <span>MP <b>{mp}</b></span>
          </div>

          <div className="cc-stats-header">
            <span>Abilities</span>
            <button className="cc-reroll" onClick={rerollCurrent}>⟳ Reroll</button>
          </div>
          <div className="cc-stats">
            {STAT_KEYS.map((k) => {
              const roll = current.stats[k]
              const isPrime = def?.primeStat === k
              return (
                <div key={k} className={`cc-stat${isPrime ? ' prime' : ''}`}>
                  <span className="cc-stat-key">{STAT_LABELS[k]}{isPrime ? '★' : ''}</span>
                  <span className="cc-stat-total">{roll.total}</span>
                  <span className="cc-stat-breakdown">{roll.rolls.join('+')} = {roll.rolls.reduce((s, r) => s + r, 0)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="cc-actions">
        <button className="cc-back" onClick={onCancel}>Back</button>
        <button className="cc-start" onClick={start}>Descend →</button>
      </div>
    </div>
  )
}
