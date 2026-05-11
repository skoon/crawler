import { useGameStore } from '../store'

export function StatsPane() {
  const party = useGameStore((s) => s.party)
  const selectedIndex = useGameStore((s) => s.selectedMemberIndex)
  const inventory = useGameStore((s) => s.inventory)
  const member = party[selectedIndex]

  if (!member) return <div className="stats-empty">No character selected</div>

  const acBonus = inventory.reduce((sum, item) => sum + (item.effects.acBonus ?? 0), 0)
  const modifiedAc = member.ac - acBonus

  return (
    <div className="stats-pane">
      <div className="stats-header">{member.name}</div>
      <div className="stats-class">Level {member.level} {member.class}</div>

      <div className="stats-section">
        <div className="stats-row"><span className="stats-label">HP</span><span>{member.hp} / {member.maxHp}</span></div>
        <div className="stats-row"><span className="stats-label">AC</span><span>{modifiedAc} {acBonus > 0 && <span className="stats-bonus">(-{acBonus} equipped)</span>}</span></div>
        <div className="stats-row"><span className="stats-label">Level</span><span>{member.level}</span></div>
        <div className="stats-row"><span className="stats-label">XP</span><span>{member.xp}</span></div>
      </div>

      <div className="stats-section">
        <div className="stats-row"><span className="stats-label">STR</span><span>{member.str}</span></div>
        <div className="stats-row"><span className="stats-label">DEX</span><span>{member.dex}</span></div>
        <div className="stats-row"><span className="stats-label">CON</span><span>{member.con}</span></div>
        <div className="stats-row"><span className="stats-label">INT</span><span>{member.int}</span></div>
        <div className="stats-row"><span className="stats-label">WIS</span><span>{member.wis}</span></div>
        <div className="stats-row"><span className="stats-label">CHA</span><span>{member.cha}</span></div>
      </div>
    </div>
  )
}
