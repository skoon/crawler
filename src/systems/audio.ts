import { useEffect } from 'react'
import { useGameStore } from '../store'
import ambienceUrl from '../assets/sound/dark_dungeon_ambience.mp3'

export type SfxName =
  | 'footstep'
  | 'swing'
  | 'hit'
  | 'miss'
  | 'death'
  | 'heal'
  | 'cast'
  | 'bow'
  | 'drip'
  | 'growl'
  | 'door'

export type MusicTrack = 'menu' | 'explore' | 'combat'

interface PlayOpts {
  volume?: number
  pan?: number
}

/**
 * Self-contained Web Audio manager. SFX are generated procedurally; the vendored
 * ambience mp3 is the exploration/menu music bed; combat music is a procedural
 * drone. Lives as a singleton so any system (in or out of the R3F canvas) can
 * trigger sound. Positional cues are approximated with stereo pan + distance gain.
 */
class AudioManager {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private masterVolume = 0.7
  private muted = false

  // Music
  private bed: HTMLAudioElement | null = null
  private combatDrone: { stop: () => void } | null = null
  private currentTrack: MusicTrack | null = null

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      try {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        this.ctx = new Ctor()
        this.master = this.ctx.createGain()
        this.master.gain.value = this.muted ? 0 : this.masterVolume
        this.master.connect(this.ctx.destination)
      } catch {
        return null
      }
    }
    return this.ctx
  }

  /** Resume audio after a user gesture (browsers block autoplay otherwise). */
  unlock() {
    const ctx = this.ensure()
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})
    // Nudge the pending bed if music was requested before unlock.
    if (this.bed && !this.muted && this.currentTrack !== 'combat') this.bed.play().catch(() => {})
  }

  setMasterVolume(v: number) {
    this.masterVolume = Math.max(0, Math.min(1, v))
    if (this.master) this.master.gain.value = this.muted ? 0 : this.masterVolume
    if (this.bed) this.bed.volume = this.muted ? 0 : this.masterVolume * 0.5
  }

  getMasterVolume() {
    return this.masterVolume
  }

  toggleMute(): boolean {
    this.muted = !this.muted
    if (this.master) this.master.gain.value = this.muted ? 0 : this.masterVolume
    if (this.bed) this.bed.volume = this.muted ? 0 : this.masterVolume * 0.5
    return this.muted
  }

  isMuted() {
    return this.muted
  }

  // ─── Procedural SFX ────────────────────────────────────────────────
  private noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
    return buf
  }

  private makeGain(ctx: AudioContext, pan: number): GainNode {
    const g = ctx.createGain()
    if (typeof ctx.createStereoPanner === 'function' && pan !== 0) {
      const p = ctx.createStereoPanner()
      p.pan.value = Math.max(-1, Math.min(1, pan))
      g.connect(p)
      p.connect(this.master!)
    } else {
      g.connect(this.master!)
    }
    return g
  }

  playSound(name: SfxName, opts: PlayOpts = {}) {
    const ctx = this.ensure()
    if (!ctx || !this.master || this.muted) return
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    const t = ctx.currentTime
    const vol = opts.volume ?? 1
    const out = this.makeGain(ctx, opts.pan ?? 0)

    switch (name) {
      case 'footstep': {
        const src = ctx.createBufferSource()
        src.buffer = this.noiseBuffer(ctx, 0.12)
        const lp = ctx.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = 380
        out.gain.setValueAtTime(0.0001, t)
        out.gain.linearRampToValueAtTime(0.28 * vol, t + 0.01)
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
        src.connect(lp)
        lp.connect(out)
        src.start(t)
        src.stop(t + 0.13)
        break
      }
      case 'door': {
        const src = ctx.createBufferSource()
        src.buffer = this.noiseBuffer(ctx, 0.5)
        const bp = ctx.createBiquadFilter()
        bp.type = 'bandpass'
        bp.frequency.setValueAtTime(200, t)
        bp.frequency.linearRampToValueAtTime(90, t + 0.45)
        out.gain.setValueAtTime(0.0001, t)
        out.gain.linearRampToValueAtTime(0.25 * vol, t + 0.05)
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
        src.connect(bp)
        bp.connect(out)
        src.start(t)
        src.stop(t + 0.52)
        break
      }
      case 'swing':
      case 'miss': {
        const src = ctx.createBufferSource()
        src.buffer = this.noiseBuffer(ctx, 0.3)
        const bp = ctx.createBiquadFilter()
        bp.type = 'bandpass'
        bp.Q.value = 1.2
        const hi = name === 'miss' ? 1800 : 1200
        bp.frequency.setValueAtTime(hi, t)
        bp.frequency.exponentialRampToValueAtTime(400, t + 0.25)
        out.gain.setValueAtTime(0.0001, t)
        out.gain.linearRampToValueAtTime((name === 'miss' ? 0.18 : 0.3) * vol, t + 0.03)
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
        src.connect(bp)
        bp.connect(out)
        src.start(t)
        src.stop(t + 0.3)
        break
      }
      case 'hit': {
        // Metallic impact: two detuned oscillators + a noise click.
        for (const [freq, type] of [[220, 'square'], [330, 'triangle']] as const) {
          const o = ctx.createOscillator()
          o.type = type
          o.frequency.setValueAtTime(freq, t)
          o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.14)
          const g = ctx.createGain()
          g.gain.setValueAtTime(0.25 * vol, t)
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
          o.connect(g)
          g.connect(out)
          o.start(t)
          o.stop(t + 0.17)
        }
        const src = ctx.createBufferSource()
        src.buffer = this.noiseBuffer(ctx, 0.05)
        const clickG = ctx.createGain()
        clickG.gain.setValueAtTime(0.3 * vol, t)
        clickG.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
        src.connect(clickG)
        clickG.connect(out)
        src.start(t)
        src.stop(t + 0.06)
        break
      }
      case 'bow': {
        const o = ctx.createOscillator()
        o.type = 'triangle'
        o.frequency.setValueAtTime(600, t)
        o.frequency.exponentialRampToValueAtTime(180, t + 0.18)
        out.gain.setValueAtTime(0.3 * vol, t)
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
        o.connect(out)
        o.start(t)
        o.stop(t + 0.21)
        break
      }
      case 'death': {
        const o = ctx.createOscillator()
        o.type = 'sawtooth'
        o.frequency.setValueAtTime(300, t)
        o.frequency.exponentialRampToValueAtTime(50, t + 0.5)
        const lp = ctx.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = 900
        out.gain.setValueAtTime(0.3 * vol, t)
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.55)
        o.connect(lp)
        lp.connect(out)
        o.start(t)
        o.stop(t + 0.56)
        break
      }
      case 'heal': {
        const notes = [523.25, 659.25, 783.99] // C5 E5 G5
        notes.forEach((f, i) => {
          const o = ctx.createOscillator()
          o.type = 'sine'
          o.frequency.value = f
          const g = ctx.createGain()
          const start = t + i * 0.08
          g.gain.setValueAtTime(0.0001, start)
          g.gain.linearRampToValueAtTime(0.22 * vol, start + 0.03)
          g.gain.exponentialRampToValueAtTime(0.0001, start + 0.3)
          o.connect(g)
          g.connect(out)
          o.start(start)
          o.stop(start + 0.32)
        })
        break
      }
      case 'cast': {
        const o = ctx.createOscillator()
        o.type = 'sine'
        o.frequency.setValueAtTime(400, t)
        o.frequency.linearRampToValueAtTime(1200, t + 0.35)
        const lfo = ctx.createOscillator()
        lfo.frequency.value = 18
        const lfoGain = ctx.createGain()
        lfoGain.gain.value = 40
        lfo.connect(lfoGain)
        lfoGain.connect(o.frequency)
        out.gain.setValueAtTime(0.0001, t)
        out.gain.linearRampToValueAtTime(0.22 * vol, t + 0.05)
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)
        o.connect(out)
        o.start(t)
        lfo.start(t)
        o.stop(t + 0.42)
        lfo.stop(t + 0.42)
        break
      }
      case 'drip': {
        const o = ctx.createOscillator()
        o.type = 'sine'
        o.frequency.setValueAtTime(900, t)
        o.frequency.exponentialRampToValueAtTime(300, t + 0.12)
        out.gain.setValueAtTime(0.0001, t)
        out.gain.linearRampToValueAtTime(0.16 * vol, t + 0.01)
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
        o.connect(out)
        o.start(t)
        o.stop(t + 0.2)
        break
      }
      case 'growl': {
        const o = ctx.createOscillator()
        o.type = 'sawtooth'
        o.frequency.value = 70
        const lp = ctx.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = 220
        const lfo = ctx.createOscillator()
        lfo.frequency.value = 7
        const lfoGain = ctx.createGain()
        lfoGain.gain.value = 25
        lfo.connect(lfoGain)
        lfoGain.connect(o.frequency)
        out.gain.setValueAtTime(0.0001, t)
        out.gain.linearRampToValueAtTime(0.18 * vol, t + 0.1)
        out.gain.setValueAtTime(0.18 * vol, t + 0.5)
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
        o.connect(lp)
        lp.connect(out)
        o.start(t)
        lfo.start(t)
        o.stop(t + 0.92)
        lfo.stop(t + 0.92)
        break
      }
    }
  }

  /** Play an SFX positioned at a tile, panned/attenuated by the party's view. */
  playPositional(name: SfxName, tileX: number, tileY: number, baseVolume = 1) {
    const { playerPosition, playerFacing } = useGameStore.getState()
    const dx = tileX - playerPosition.x
    const dy = tileY - playerPosition.y
    const dist = Math.hypot(dx, dy)

    // Right-axis vector for the current facing (0=N,1=E,2=S,3=W).
    const right = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
    ][playerFacing] ?? { x: 1, y: 0 }
    const pan = dist > 0 ? (dx * right.x + dy * right.y) / dist : 0
    const gain = 1 / (1 + dist * 0.45)
    this.playSound(name, { volume: baseVolume * gain, pan })
  }

  // ─── Music ─────────────────────────────────────────────────────────
  playMusic(track: MusicTrack) {
    if (this.currentTrack === track) return
    this.currentTrack = track

    if (track === 'combat') {
      this.fadeBed(0)
      this.startCombatDrone()
    } else {
      this.stopCombatDrone()
      this.fadeBed(this.muted ? 0 : this.masterVolume * 0.5)
    }
  }

  stopMusic() {
    this.currentTrack = null
    this.fadeBed(0)
    this.stopCombatDrone()
  }

  private ensureBed(): HTMLAudioElement | null {
    if (typeof Audio === 'undefined') return null
    if (!this.bed) {
      this.bed = new Audio(ambienceUrl)
      this.bed.loop = true
      this.bed.volume = 0
    }
    return this.bed
  }

  private fadeBed(target: number) {
    const bed = this.ensureBed()
    if (!bed) return
    if (target > 0) bed.play().catch(() => {})
    const from = bed.volume
    const steps = 12
    let i = 0
    const timer = setInterval(() => {
      i++
      const v = from + (target - from) * (i / steps)
      bed.volume = Math.max(0, Math.min(1, v))
      if (i >= steps) {
        clearInterval(timer)
        if (target <= 0) bed.pause()
      }
    }, 40)
  }

  private startCombatDrone() {
    const ctx = this.ensure()
    if (!ctx || !this.master || this.combatDrone) return
    const g = ctx.createGain()
    g.gain.value = 0
    g.connect(this.master)
    g.gain.linearRampToValueAtTime(this.muted ? 0 : 0.12, ctx.currentTime + 0.6)

    const oscs = [55, 82.5].map((f) => {
      const o = ctx.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = f
      o.connect(g)
      o.start()
      return o
    })
    // Rhythmic pulse on the drone.
    const pulse = ctx.createOscillator()
    pulse.frequency.value = 2
    const pulseGain = ctx.createGain()
    pulseGain.gain.value = 0.05
    pulse.connect(pulseGain)
    pulseGain.connect(g.gain)
    pulse.start()

    this.combatDrone = {
      stop: () => {
        try {
          g.gain.cancelScheduledValues(ctx.currentTime)
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4)
          oscs.forEach((o) => o.stop(ctx.currentTime + 0.45))
          pulse.stop(ctx.currentTime + 0.45)
        } catch {
          /* already stopped */
        }
      },
    }
  }

  private stopCombatDrone() {
    if (this.combatDrone) {
      this.combatDrone.stop()
      this.combatDrone = null
    }
  }
}

export const audio = new AudioManager()

/** Installs a one-time gesture listener that unlocks audio playback. */
export function useAudioManager() {
  useEffect(() => {
    const unlock = () => audio.unlock()
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])
  return audio
}
