import { useMotionValueEvent, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { useSimulationClock } from '@/hooks/useSimulationClock'

/**
 * A playable clock that loops over an animation `duration` seconds long (with a short hold
 * at the end). Plays automatically unless the reader prefers reduced motion.
 */
export function useLoopTime(duration: number, hold = 1.5) {
  const reduceMotion = useReducedMotion()
  const clock = useSimulationClock({ autoPlay: !reduceMotion })
  const [time, setTime] = useState(0)
  useMotionValueEvent(clock.time, 'change', (v) => setTime(v))
  const t = Math.min(duration, time % (duration + hold))
  return { clock, t }
}
