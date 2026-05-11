import { useEffect, useRef } from 'react'
import { useGameStore } from '../store'

export function LogPane() {
  const log = useGameStore((s) => s.log)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log.length])

  return (
    <div className="log-pane">
      {log.map((entry, i) => (
        <div key={i} className="log-entry">{entry}</div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
