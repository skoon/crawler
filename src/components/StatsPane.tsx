import { useGameStore } from '../store'
import type { PartyMember } from '../types'

/** Calculate total equipment bonuses for a party member */
function getEquipmentBonuses(member: PartyMember) {
  const bonuses = { ac: 0, str: 0, dex: 0, con: 0, damage: 0, damageDice: '' }
  for (const item of Object.values(member.equipment)) {
    if (!item) continue
    bonuses.ac += item.effects.acBonus ?? 0
    bonuses.str += item.effects.strBonus ?? 0
    bonuses.dex += item.effects.dexBonus ?? 0
    bonuses.con += item.effects.conBonus ?? 0
    bonuses.damage += item.effects.damageBonus ?? 0
    if (item.effects.damageDice) bonuses.damageDice = item.effects.damageDice
  }
  return bonuses
}

export function StatsPane() {
  const party = useGameStore((s) => s.party)
  const selectedIndex = useGameStore((s) => s.selectedMemberIndex)
  const member = party[selectedIndex]

  if (!member) return <div className="stats-empty">No character selected</div>

  const bonuses = getEquipmentBonuses(member)
  const effectiveAc = member.ac - bonuses.ac  // Lower AC is better in THAC0 system
  const effectiveStr = member.str + bonuses.str
  const effectiveDex = member.dex + bonuses.dex
  const effectiveCon = member.con + bonuses.con

  return (
    <div className="stats-pane">
      <div className="stats-header">{member.name}</div>
      <div className="stats-class">Level {member.level} {member.class}</div>

      <div className="stats-section">
        <div className="stats-row">
          <span className="stats-label">HP</span>
          <span>{member.hp} / {member.maxHp}</span>
        </div>
        <div className="stats-row">
          <span className="stats-label">AC</span>
          <span>
            {effectiveAc}
            {bonuses.ac > 0 && <span className="stats-bonus"> (-{bonuses.ac} equip)</span>}
          </span>
        </div>
        <div className="stats-row">
          <span className="stats-label">Weapon</span>
          <span>
            {bonuses.damageDice || '1d4 (fists)'}
            {bonuses.damage > 0 && <span className="stats-bonus"> +{bonuses.damage}</span>}
          </span>
        </div>
        <div className="stats-row"><span className="stats-label">Level</span><span>{member.level}</span></div>
        <div className="stats-row"><span className="stats-label">XP</span><span>{member.xp}</span></div>
      </div>

      <div className="stats-section">
        <div className="stats-row">
          <span className="stats-label">STR</span>
          <span>
            {effectiveStr}
            {bonuses.str > 0 && <span className="stats-bonus"> (+{bonuses.str})</span>}
          </span>
        </div>
        <div className="stats-row">
          <span className="stats-label">DEX</span>
          <span>
            {effectiveDex}
            {bonuses.dex > 0 && <span className="stats-bonus"> (+{bonuses.dex})</span>}
          </span>
        </div>
        <div className="stats-row">
          <span className="stats-label">CON</span>
          <span>
            {effectiveCon}
            {bonuses.con > 0 && <span className="stats-bonus"> (+{bonuses.con})</span>}
          </span>
        </div>
        <div className="stats-row"><span className="stats-label">INT</span><span>{member.int}</span></div>
        <div className="stats-row"><span className="stats-label">WIS</span><span>{member.wis}</span></div>
        <div className="stats-row"><span className="stats-label">CHA</span><span>{member.cha}</span></div>
      </div>
    </div>
  )
}
