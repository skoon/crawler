import { useGameStore } from '../store'

export function LevelUpModal() {
  const pending = useGameStore((s) => s.pendingLevelUps)
  const clear = useGameStore((s) => s.clearPendingLevelUps)

  if (pending.length === 0) return null

  return (
    <div className="levelup-overlay">
      <div className="levelup-modal">
        <h2 className="levelup-title">Level Up!</h2>
        {pending.map((r, i) => (
          <div key={`${r.memberId}-${i}`} className="levelup-row">
            <b>{r.name}</b> reached level <b>{r.newLevel}</b>
            <span className="levelup-gains">
              +{r.hpGained} HP{r.mpGained > 0 ? `, +${r.mpGained} MP` : ''}
            </span>
          </div>
        ))}
        <button className="levelup-btn" onClick={clear}>Continue</button>
      </div>
    </div>
  )
}
