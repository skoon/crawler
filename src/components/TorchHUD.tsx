import { useGameStore } from '../store'

export function TorchHUD() {
  const torchDuration = useGameStore((s) => s.torchDuration)
  const maxTorchDuration = useGameStore((s) => s.maxTorchDuration)
  const isResting = useGameStore((s) => s.isResting)
  const restTimer = useGameStore((s) => s.restTimer)

  const ratio = maxTorchDuration > 0 ? torchDuration / maxTorchDuration : 0
  const out = torchDuration <= 0

  let barColor = '#5ac85a' // green
  if (ratio < 0.3) barColor = '#c85a5a' // red
  else if (ratio < 0.6) barColor = '#c8c05a' // yellow

  return (
    <div className="torch-hud">
      {out ? (
        <div className="torch-darkness">DARKNESS</div>
      ) : (
        <div className="torch-meter">
          <span className="torch-label">Torch</span>
          <div className="torch-bar-outer">
            <div className="torch-bar-inner" style={{ width: `${ratio * 100}%`, background: barColor }} />
          </div>
          <span className="torch-time">{Math.ceil(torchDuration)}s</span>
        </div>
      )}
      {isResting && (
        <div className="torch-resting">Resting… {Math.floor(restTimer)}s (press R to stop)</div>
      )}
    </div>
  )
}
