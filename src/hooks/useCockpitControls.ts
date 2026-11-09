import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { STANDARD_PATTERN, shiftInPattern, type GearPattern, type LeverAction } from '@/lib/mechanics/gearbox'

/*
 * The rider's five inputs in the cockpit: four continuous controls and the gear lever.
 *
 * On a real motorcycle every lever and the twist grip spring back when let go. A mouse can
 * only hold one control at a time, though, so by default each control stays where it is left;
 * with `springBack` on, letting go of a drag or a held key returns it to rest, as on the road.
 *
 * Keyboard (while the cockpit has focus): hold A / Z to pull / let out the clutch, ↑ / ↓ to
 * open / close the throttle, Space for the front brake, S for the rear brake; E / D shift up
 * / down (lift / press), N finds neutral. Several keys work at once — one per hand — and
 * holding Shift moves a control slowly, for finding the biting point.
 */

export type Axis = 'clutch' | 'throttle' | 'front' | 'rear'
export type Axes = Record<Axis, number>

const REST: Axes = { clutch: 0, throttle: 0, front: 0, rear: 0 }
/** Full travel per second while a key is held, and while Shift is held for fine control. */
const RATE: Axes = { clutch: 1.6, throttle: 1, front: 1.2, rear: 1.2 }
const FINE_RATE = 0.3
/** How far one tap of a key moves its control (with Shift: a fine step, for the biting point). */
const TAP_STEP = 0.1
const TAP_STEP_FINE = 0.02
const SPRING_MS = 120

/** Held keys: which axis they move and in which direction. */
const KEYS: Record<string, { axis: Axis; dir: 1 | -1 }> = {
  a: { axis: 'clutch', dir: 1 },
  z: { axis: 'clutch', dir: -1 },
  ArrowUp: { axis: 'throttle', dir: 1 },
  ArrowDown: { axis: 'throttle', dir: -1 },
  ' ': { axis: 'front', dir: 1 },
  s: { axis: 'rear', dir: 1 },
}
const SHIFT_KEYS: Record<string, LeverAction> = { e: 'up', d: 'down', n: 'half' }
/** ← / → move the handlebar one position: full lock left (−1), straight (0), full lock right (1). */
const STEER_KEYS: Record<string, -1 | 1> = { ArrowLeft: -1, ArrowRight: 1 }
export type Steer = -1 | 0 | 1

export function useCockpitControls({
  initialPattern = STANDARD_PATTERN,
  initialGear = 0,
  initialAxes = {},
  canShift,
}: {
  initialPattern?: GearPattern
  /** How the controls are found (a scenario may start in gear with some throttle). */
  initialGear?: number
  initialAxes?: Partial<Axes>
  /** Return a reason to refuse a gear change (e.g. the clutch isn't in), or null to allow it. */
  canShift?: (action: LeverAction) => string | null
} = {}) {
  const [axes, setAxes] = useState<Axes>(() => ({ ...REST, ...initialAxes }))
  const [gear, setGear] = useState(initialGear)
  const [steer, setSteerState] = useState<Steer>(0)
  const [pattern, setPatternState] = useState<GearPattern>(initialPattern)
  const [springBack, setSpringBack] = useState(false)
  const [shift, setShift] = useState<{ note: string; moved: boolean; dir: LeverAction; at: number } | null>(null)
  // Was the gear lever the rider's most recent action? (Its message stays until they do something else.)
  const [shiftIsLatest, setShiftIsLatest] = useState(false)
  const held = useRef(new Set<string>())
  const fine = useRef(false)
  const springing = useRef<Partial<Record<Axis, number>>>({})
  const frame = useRef(0)

  /** Something other than the gear lever happened. */
  const touch = useCallback(() => setShiftIsLatest(false), [])

  const setSteer = useCallback((v: Steer | ((s: Steer) => Steer)) => {
    setShiftIsLatest(false)
    setSteerState(v)
  }, [])

  const set = useCallback((axis: Axis, v: number) => {
    setShiftIsLatest(false)
    cancelAnimationFrame(springing.current[axis] ?? 0)
    setAxes((a) => (a[axis] === v ? a : { ...a, [axis]: v }))
  }, [])

  /** The rider let go of a control: spring it back to rest if that is on. */
  const release = useCallback(
    (axis: Axis) => {
      if (!springBack) return
      const from = performance.now()
      const step = (now: number) => {
        const k = Math.min(1, (now - from) / SPRING_MS)
        setAxes((a) => ({ ...a, [axis]: a[axis] * (1 - k) }))
        if (k < 1) springing.current[axis] = requestAnimationFrame(step)
      }
      springing.current[axis] = requestAnimationFrame(step)
    },
    [springBack],
  )

  const lever = useCallback(
    (action: LeverAction) => {
      setShiftIsLatest(true)
      const veto = canShift?.(action)
      if (veto) return setShift({ note: veto, moved: false, dir: action, at: performance.now() })
      const r = shiftInPattern(pattern, gear, action)
      setGear(r.gear)
      setShift({ note: r.note, moved: r.moved, dir: action, at: performance.now() })
    },
    [pattern, gear, canShift],
  )

  const setPattern = useCallback((p: GearPattern) => {
    setPatternState(p)
    setGear(0)
    setShift(null)
  }, [])

  // Held keys move their axis continuously.
  const tick = useCallback(() => {
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (held.current.size === 0) return
      setAxes((a) => {
        const next = { ...a }
        for (const k of held.current) {
          const m = KEYS[k]
          if (m) next[m.axis] = Math.min(1, Math.max(0, next[m.axis] + m.dir * RATE[m.axis] * (fine.current ? FINE_RATE : 1) * dt))
        }
        return next
      })
      frame.current = requestAnimationFrame(loop)
    }
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(loop)
  }, [])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        fine.current = true
        return
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (SHIFT_KEYS[k]) {
        e.preventDefault()
        if (!e.repeat) lever(SHIFT_KEYS[k])
        return
      }
      if (STEER_KEYS[k]) {
        e.preventDefault()
        const dir = STEER_KEYS[k]
        if (!e.repeat) setSteer((s: Steer) => Math.max(-1, Math.min(1, s + dir)) as Steer)
        return
      }
      if (!KEYS[k]) return
      e.preventDefault()
      if (held.current.has(k)) return
      held.current.add(k)
      setShiftIsLatest(false)
      const m = KEYS[k]
      cancelAnimationFrame(springing.current[m.axis] ?? 0)
      // A tap moves the control a visible step; holding the key keeps it moving smoothly.
      const step = (fine.current ? TAP_STEP_FINE : TAP_STEP) * m.dir
      setAxes((a) => ({ ...a, [m.axis]: Math.min(1, Math.max(0, a[m.axis] + step)) }))
      tick()
    },
    [lever, tick, setSteer],
  )

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        fine.current = false
        return
      }
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (!held.current.delete(k)) return
      const m = KEYS[k]
      // Letting go of a key that applies a control springs it back; Z and ↓ only ease off.
      if (m.dir > 0) release(m.axis)
    },
    [release],
  )

  // Let go of everything if the cockpit loses focus mid-press.
  const onBlur = useCallback(() => {
    for (const k of held.current) if (KEYS[k].dir > 0) release(KEYS[k].axis)
    held.current.clear()
    fine.current = false
  }, [release])

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
      for (const id of Object.values(springing.current)) cancelAnimationFrame(id ?? 0)
    },
    [],
  )

  /** Controls at rest (or as given) with a gear selected — how a scenario finds the motorcycle. */
  const reset = useCallback((startGear = 0, start: Partial<Axes> = {}) => {
    held.current.clear()
    setAxes({ ...REST, ...start })
    setGear(startGear)
    setSteerState(0)
    setShift(null)
    setShiftIsLatest(false)
  }, [])

  return { axes, gear, steer, setSteer, pattern, springBack, shift, shiftIsLatest, set, release, lever, touch, setPattern, setSpringBack, reset, keyHandlers: { onKeyDown, onKeyUp, onBlur } }
}

export type CockpitControls = ReturnType<typeof useCockpitControls>
