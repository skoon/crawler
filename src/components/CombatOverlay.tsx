import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store'
import { resolvePlayerAttack } from '../systems/combatResolution'
import { resolveMagicMissile, resolveFireball, resolveHealSpell, resolveSleepDuration } from '../systems/combatResolution'
import { processEnemyTurn } from '../systems/enemyAI'
import { spells } from '../data/spells'
import { createStatusEffect, processStatusEffects } from '../systems/statusEffects'
import type { Spell } from '../types'

export function CombatOverlay() {
  const party = useGameStore((s) => s.party)
  const enemies = useGameStore((s) => s.enemies)
  const combatState = useGameStore((s) => s.combatState)
  const selectedIndex = useGameStore((s) => s.selectedMemberIndex)
  const currentTargetEnemyId = useGameStore((s) => s.currentTargetEnemyId)
  const inventory = useGameStore((s) => s.inventory)
  const activeStatusEffects = useGameStore((s) => s.activeStatusEffects)

  const setCombatState = useGameStore((s) => s.setCombatState)
  const setCurrentTargetEnemyId = useGameStore((s) => s.setCurrentTargetEnemyId)
  const damageEnemy = useGameStore((s) => s.damageEnemy)
  const setDefending = useGameStore((s) => s.setDefending)
  const addLogMessage = useGameStore((s) => s.addLogMessage)
  const endCombat = useGameStore((s) => s.endCombat)
  const useItem = useGameStore((s) => s.useItem)
  const spendMp = useGameStore((s) => s.spendMp)
  const addStatusEffect = useGameStore((s) => s.addStatusEffect)
  const damageMember = useGameStore((s) => s.damageMember)

  const enemyTurnRef = useRef(false)
  const [showItemMenu, setShowItemMenu] = useState(false)
  const [showCastMenu, setShowCastMenu] = useState(false)
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null)
  const [targetingParty, setTargetingParty] = useState(false)

  const aliveEnemies = enemies.filter((e) => e.hp > 0)
  const consumables = inventory.filter((i) => i.consumable)
  const member = party[selectedIndex]
  const availableSpells = member
    ? spells.filter((s) => s.allowedClasses.includes(member.class) && member.mp >= s.mpCost)
    : []

  useEffect(() => {
    if (combatState === 'enemyTurn' && !enemyTurnRef.current) {
      enemyTurnRef.current = true
      const timer = setTimeout(() => {
        processEnemyTurn()
        enemyTurnRef.current = false
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [combatState])

  useEffect(() => {
    if (combatState === 'victory') {
      const timer = setTimeout(() => endCombat(), 2000)
      return () => clearTimeout(timer)
    }
  }, [combatState, endCombat])

  if (combatState === 'idle') return null

  const handleAttack = () => {
    if (combatState !== 'playerTurn') return
    if (!member || member.hp <= 0) return
    const target = aliveEnemies.find((e) => e.id === currentTargetEnemyId)
    if (!target) {
      addLogMessage('Select a target first!')
      return
    }

    const weapon = member.equipment.weapon
    const weaponDice = weapon?.effects.damageDice
    const weaponBonus = weapon?.effects.damageBonus

    const result = resolvePlayerAttack(member.str, target.ac, weaponDice, weaponBonus)
    if (result.hit) {
      damageEnemy(target.id, result.damage)
      addLogMessage(`${member.name} attacks ${target.name} for ${result.damage} damage!`)
    } else {
      addLogMessage(`${member.name} misses ${target.name}.`)
    }

    processStatusEffects()

    const targetDied = result.hit && target.hp <= result.damage
    const remaining = targetDied
      ? aliveEnemies.filter((e) => e.id !== target.id)
      : aliveEnemies
    if (remaining.length === 0) {
      addLogMessage('All enemies defeated!')
      setCombatState('victory')
    } else {
      setCombatState('enemyTurn')
    }
  }

  const handleDefend = () => {
    if (combatState !== 'playerTurn') return
    setDefending(selectedIndex, true)
    addLogMessage(`${member?.name} takes a defensive stance.`)
    processStatusEffects()
    setCombatState('enemyTurn')
  }

  const handleUseItem = (itemId: string) => {
    if (combatState !== 'playerTurn') return
    useItem(itemId, selectedIndex)
    setShowItemMenu(false)
    processStatusEffects()
    setCombatState('enemyTurn')
  }

  const handleCastClick = () => {
    if (combatState !== 'playerTurn') return
    setShowCastMenu(true)
  }

  const handleSpellSelect = (spell: Spell) => {
    setSelectedSpell(spell)
    setShowCastMenu(false)

    if (spell.targetType === 'self' || spell.targetType === 'all_enemies') {
      executeSpell(spell)
    } else if (spell.targetType === 'ally') {
      setTargetingParty(true)
    } else {
      if (!currentTargetEnemyId) {
        addLogMessage('Select a target enemy first!')
        setSelectedSpell(null)
        return
      }
      executeSpell(spell)
    }
  }

  const handleAllyTarget = (allyIndex: number) => {
    if (!selectedSpell) return
    executeSpell(selectedSpell, allyIndex)
    setTargetingParty(false)
    setSelectedSpell(null)
  }

  const executeSpell = (spell: Spell, allyIndex?: number) => {
    if (!member || member.hp <= 0) return
    if (member.mp < spell.mpCost) {
      addLogMessage('Not enough MP!')
      setSelectedSpell(null)
      return
    }

    spendMp(selectedIndex, spell.mpCost)
    addLogMessage(`${member.name} casts ${spell.name}!`)

    switch (spell.id) {
      case 'magic-missile': {
        const target = aliveEnemies.find((e) => e.id === currentTargetEnemyId)
        if (!target) { addLogMessage('No target!'); break }
        const result = resolveMagicMissile(0)
        damageEnemy(target.id, result.damage)
        addLogMessage(result.logMessage)
        break
      }
      case 'fireball': {
        const result = resolveFireball(0)
        for (const enemy of aliveEnemies) {
          damageEnemy(enemy.id, result.damage)
        }
        addLogMessage(result.logMessage)
        break
      }
      case 'heal': {
        if (allyIndex === undefined) { addLogMessage('No target!'); break }
        const result = resolveHealSpell(0)
        const target = party[allyIndex]
        if (!target) break
        const newHp = Math.min(target.maxHp, target.hp + result.healing)
        const actualHeal = newHp - target.hp
        addLogMessage(`${target.name} is healed for ${actualHeal} HP!`)
        const healIdx = party.findIndex((m) => m.id === target.id)
        if (healIdx >= 0) {
          damageMember(healIdx, -actualHeal) // negative damage = heal
        }
        break
      }
      case 'sleep': {
        const target = aliveEnemies.find((e) => e.id === currentTargetEnemyId)
        if (!target) { addLogMessage('No target!'); break }
        const dur = resolveSleepDuration()
        const effect = createStatusEffect('sleep', target.id, 'enemy', dur)
        addStatusEffect(effect)
        addLogMessage(`${target.name} falls asleep for ${dur} rounds!`)
        break
      }
      case 'haste': {
        const targetIdx = allyIndex ?? selectedIndex
        const target = party[targetIdx]
        const effect = createStatusEffect('haste', target.id, 'party_member', 3)
        addStatusEffect(effect)
        addLogMessage(`${target.name} is hasted for 3 rounds!`)
        break
      }
      case 'shield': {
        const targetIdx = allyIndex ?? selectedIndex
        const target = party[targetIdx]
        const effect = createStatusEffect('shield', target.id, 'party_member', 3)
        addStatusEffect(effect)
        addLogMessage(`${target.name} is shielded (+4 AC) for 3 rounds!`)
        break
      }
    }

    processStatusEffects()

    const remaining = aliveEnemies.filter((e) => e.hp > 0)
    if (remaining.length === 0) {
      addLogMessage('All enemies defeated!')
      setCombatState('victory')
    } else {
      setCombatState('enemyTurn')
    }
    setSelectedSpell(null)
  }

  const cancelCasting = () => {
    setShowCastMenu(false)
    setSelectedSpell(null)
    setTargetingParty(false)
  }

  const allEnemiesDead = aliveEnemies.length === 0

  return (
    <div className="combat-overlay">
      <div className="combat-enemy-list">
        {enemies.map((enemy) => (
          <div
            key={enemy.id}
            className={`combat-enemy${enemy.hp <= 0 ? ' dead' : ''}${currentTargetEnemyId === enemy.id ? ' targeted' : ''}`}
            onClick={() => enemy.hp > 0 && setCurrentTargetEnemyId(enemy.id)}
          >
            <span className="combat-enemy-name">{enemy.name}</span>
            {enemy.hp > 0 && (
              <div className="combat-enemy-hp-outer">
                <div
                  className="combat-enemy-hp-inner"
                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                />
              </div>
            )}
            {enemy.hp <= 0 && <span className="combat-enemy-dead">(defeated)</span>}
          </div>
        ))}
      </div>

      {combatState === 'playerTurn' && !allEnemiesDead && (
        <div className="combat-actions">
          <button className="combat-btn" onClick={handleAttack}>Attack</button>
          <button className="combat-btn" onClick={handleDefend}>Defend</button>
          <button
            className="combat-btn"
            onClick={() => setShowItemMenu(!showItemMenu)}
            disabled={consumables.length === 0}
          >
            Use Item{consumables.length > 0 && ` (${consumables.length})`}
          </button>
          <button
            className="combat-btn"
            onClick={handleCastClick}
            disabled={availableSpells.length === 0}
          >
            Cast{availableSpells.length > 0 && ` (${availableSpells.length})`}
          </button>
        </div>
      )}

      {showItemMenu && combatState === 'playerTurn' && (
        <div className="combat-item-menu">
          {consumables.map((item) => (
            <button
              key={item.id}
              className="combat-item-btn"
              onClick={() => handleUseItem(item.id)}
            >
              {item.name} — {item.description}
            </button>
          ))}
          <button
            className="combat-item-btn combat-item-cancel"
            onClick={() => setShowItemMenu(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {showCastMenu && combatState === 'playerTurn' && (
        <div className="combat-item-menu">
          {availableSpells.map((spell) => (
            <button
              key={spell.id}
              className="combat-item-btn"
              onClick={() => handleSpellSelect(spell)}
            >
              {spell.name} ({spell.mpCost} MP) — {spell.description}
            </button>
          ))}
          <button
            className="combat-item-btn combat-item-cancel"
            onClick={() => setShowCastMenu(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {targetingParty && combatState === 'playerTurn' && (
        <div className="combat-item-menu">
          <div style={{ color: '#e8d5a3', fontSize: '13px', marginBottom: '6px', textAlign: 'center' }}>
            Select target for {selectedSpell?.name}:
          </div>
          {party.map((m, i) => {
            const isHpFull = m.hp <= 0
            return (
              <button
                key={m.id}
                className="combat-item-btn"
                disabled={isHpFull && selectedSpell?.id !== 'haste' && selectedSpell?.id !== 'shield'}
                onClick={() => handleAllyTarget(i)}
              >
                {m.name} ({m.class}) — HP: {m.hp}/{m.maxHp} MP: {m.mp}/{m.maxMp}
              </button>
            )
          })}
          <button
            className="combat-item-btn combat-item-cancel"
            onClick={cancelCasting}
          >
            Cancel
          </button>
        </div>
      )}

      {member && member.maxMp > 0 && (
        <div className="combat-mp-bar">
          MP: {member.mp}/{member.maxMp}
        </div>
      )}

      {combatState === 'enemyTurn' && <div className="combat-status">Enemy turn...</div>}
      {combatState === 'victory' && <div className="combat-status combat-victory">Victory!</div>}
      {combatState === 'defeat' && <div className="combat-status combat-defeat">Defeat...</div>}
    </div>
  )
}
