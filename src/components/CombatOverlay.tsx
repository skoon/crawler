import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store'
import { resolvePlayerAttack } from '../systems/combatResolution'
import { processEnemyTurn } from '../systems/enemyAI'

export function CombatOverlay() {
  const party = useGameStore((s) => s.party)
  const enemies = useGameStore((s) => s.enemies)
  const combatState = useGameStore((s) => s.combatState)
  const selectedIndex = useGameStore((s) => s.selectedMemberIndex)
  const currentTargetEnemyId = useGameStore((s) => s.currentTargetEnemyId)
  const inventory = useGameStore((s) => s.inventory)

  const setCombatState = useGameStore((s) => s.setCombatState)
  const setCurrentTargetEnemyId = useGameStore((s) => s.setCurrentTargetEnemyId)
  const damageEnemy = useGameStore((s) => s.damageEnemy)
  const setDefending = useGameStore((s) => s.setDefending)
  const addLogMessage = useGameStore((s) => s.addLogMessage)
  const endCombat = useGameStore((s) => s.endCombat)
  const useItem = useGameStore((s) => s.useItem)

  const enemyTurnRef = useRef(false)
  const [showItemMenu, setShowItemMenu] = useState(false)

  const aliveEnemies = enemies.filter((e) => e.hp > 0)
  const consumables = inventory.filter((i) => i.consumable)

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
    const member = party[selectedIndex]
    if (!member || member.hp <= 0) return
    const target = aliveEnemies.find((e) => e.id === currentTargetEnemyId)
    if (!target) {
      addLogMessage('Select a target first!')
      return
    }

    // Get equipped weapon info
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
    addLogMessage(`${party[selectedIndex]?.name} takes a defensive stance.`)
    setCombatState('enemyTurn')
  }

  const handleUseItem = (itemId: string) => {
    if (combatState !== 'playerTurn') return
    useItem(itemId, selectedIndex)
    setShowItemMenu(false)
    setCombatState('enemyTurn')
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

      {combatState === 'enemyTurn' && <div className="combat-status">Enemy turn...</div>}
      {combatState === 'victory' && <div className="combat-status combat-victory">Victory!</div>}
      {combatState === 'defeat' && <div className="combat-status combat-defeat">Defeat...</div>}
    </div>
  )
}
