import { useMotionValue, useMotionValueEvent, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import type { RoadMotion } from '@/components/cockpit/RoadAhead'
import type { SimulationClock } from './useSimulationClock'

/** Longest step integrated at once, so a backgrounded tab doesn't make the scene jump. */
const MAX_STEP = 0.1

/**
 * Moves the first-person road on a simulation clock (so pause and slow motion apply): distance
 * grows at road speed, the heading turns at speed × curvature, and a car ahead closes or opens
 * the gap at the speed difference. Inputs are read every frame, in m/s and 1/m.
 */
export function useRoadMotion(
  clock: SimulationClock,
  { speed, curvature, carSpeed }: { speed: () => number; curvature: () => number; carSpeed?: () => number | null },
): RoadMotion & { carGap: MotionValue<number | null>; reset: (carGap?: number | null) => void } {
  const distance = useMotionValue(0)
  const heading = useMotionValue(0)
  const carGap = useMotionValue<number | null>(null) as MotionValue<number | null>
  const last = useRef(0)

  useMotionValueEvent(clock.time, 'change', (t) => {
    const dt = Math.min(MAX_STEP, Math.max(0, t - last.current))
    last.current = t
    if (dt === 0) return
    const v = speed()
    distance.set(distance.get() + v * dt)
    heading.set(heading.get() + v * curvature() * dt)
    const gap = carGap.get()
    const vc = carSpeed?.()
    if (gap != null && vc != null) carGap.set(Math.max(4, gap + (vc - v) * dt))
  })

  return {
    distance,
    heading,
    time: clock.time,
    carGap,
    reset: (gap = null) => {
      distance.set(0)
      heading.set(0)
      carGap.set(gap)
    },
  }
}
