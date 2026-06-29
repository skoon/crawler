import { useGameStore } from '../store'

const PORTRAIT_COLORS: Record<string, string> = {
  Fighter: '#c44',
  Mage: '#44c',
  Cleric: '#c84',
  Thief: '#484',
}

function hpColor(hp: number, maxHp: number): string {
  const pct = hp / maxHp
  if (pct > 0.5) return '#4a4'
  if (pct > 0.25) return '#ca4'
  return '#c44'
}

export function PartyPane() {
  const party = useGameStore((s) => s.party)
  const selectedIndex = useGameStore((s) => s.selectedMemberIndex)
  const selectMember = useGameStore((s) => s.selectMember)
  const activeStatusEffects = useGameStore((s) => s.activeStatusEffects)

  return (
    <div>
      {party.map((member, i) => {
        const effects = activeStatusEffects.filter((e) => e.targetId === member.id && e.duration > 0)
        return (
          <div
            key={member.id}
            className={`party-member${i === selectedIndex ? ' selected' : ''}`}
            onClick={() => selectMember(i)}
          >
            <div
              className="party-portrait"
              style={{ background: PORTRAIT_COLORS[member.class] ?? '#666' }}
            />
            <div className="party-info">
              <div className="party-name">{member.name}</div>
              <div className="party-class">
                Lvl {member.level} {member.class}
              </div>
              <div className="hp-bar-outer">
                <div
                  className="hp-bar-inner"
                  style={{
                    width: `${(member.hp / member.maxHp) * 100}%`,
                    background: hpColor(member.hp, member.maxHp),
                  }}
                />
              </div>
              <div className="party-hp-text">
                {member.hp}/{member.maxHp} HP
              </div>
              {effects.length > 0 && (
                <div className="party-status-badges" style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                  {effects.map((e) => (
                    <span
                      key={e.id}
                      className={`status-badge status-badge-${e.type}`}
                      style={{
                        fontSize: '9px',
                        background: e.type === 'poison' ? '#5a2' : e.type === 'sleep' ? '#66d' : e.type === 'shield' ? '#cc3' : '#a22',
                        color: '#fff',
                        padding: '1px 3px',
                        borderRadius: '3px',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                      }}
                      title={`${e.name} (${e.duration} rounds left)`}
                    >
                      {e.name.substring(0, 3)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
