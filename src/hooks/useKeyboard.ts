import { useEffect, useRef } from 'react'

export function useKeyboard() {
  const keysRef = useRef(new Set<string>())

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)
    }
    const up = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  return keysRef
}
