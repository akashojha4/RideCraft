import { useAnimationFrame, useMotionValue, type MotionValue } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import type { SimulationSpeed } from '@/lib/motion'

export interface SimulationClock {
  /** Simulated time in seconds. Drive mechanical transforms from this with `useTransform`. */
  time: MotionValue<number>
  playing: boolean
  speed: SimulationSpeed
  play: () => void
  pause: () => void
  toggle: () => void
  reset: () => void
  setSpeed: (speed: SimulationSpeed) => void
}

/** Longest frame step we accept, so a backgrounded tab doesn't make the simulation jump. */
const MAX_FRAME_SECONDS = 0.1

/**
 * A pausable, scalable clock for mechanical animations.
 *
 * Time is held in a MotionValue rather than React state so that components can derive
 * per-frame transforms (crank angle, wheel rotation…) without re-rendering every frame.
 * Every view of one simulation should share a single clock to stay in sync.
 */
export function useSimulationClock({
  autoPlay = false,
  initialSpeed = 1,
}: { autoPlay?: boolean; initialSpeed?: SimulationSpeed } = {}): SimulationClock {
  const time = useMotionValue(0)
  const [playing, setPlaying] = useState(autoPlay)
  const [speed, setSpeedState] = useState<SimulationSpeed>(initialSpeed)
  const playingRef = useRef(playing)
  const speedRef = useRef(speed)

  useAnimationFrame((_, deltaMs) => {
    if (!playingRef.current) return
    const step = Math.min(deltaMs / 1000, MAX_FRAME_SECONDS) * speedRef.current
    time.set(time.get() + step)
  })

  const setPlayingBoth = useCallback((value: boolean) => {
    playingRef.current = value
    setPlaying(value)
  }, [])

  const play = useCallback(() => setPlayingBoth(true), [setPlayingBoth])
  const pause = useCallback(() => setPlayingBoth(false), [setPlayingBoth])
  const toggle = useCallback(() => setPlayingBoth(!playingRef.current), [setPlayingBoth])
  const reset = useCallback(() => {
    setPlayingBoth(false)
    time.set(0)
  }, [setPlayingBoth, time])
  const setSpeed = useCallback((value: SimulationSpeed) => {
    speedRef.current = value
    setSpeedState(value)
  }, [])

  return { time, playing, speed, play, pause, toggle, reset, setSpeed }
}
