import { G, STATIC_FRONT, frontShare } from '@/lib/mechanics/braking'
import { MASS, overallRatioFor, type PowertrainInputs, type PowertrainState } from '@/lib/mechanics/powertrain'
import type { PowertrainDerived } from './models/powertrain'

/*
 * What the motorcycle is physically doing on the road, from the shared simulation state:
 * how far each end of the suspension has moved with the load transfer, and which riding
 * situation the rider is in, explained.
 *
 * Suspension: the load each tyre gains or loses compresses or extends its spring at the
 * wheel rate — the fork 14 kN/m with 110 mm of travel (the same fork as the speed-breaker
 * scenario), the rear 20 kN/m with 90 mm (a representative pair of rear shocks). Both sit at
 * about 30 % sag at rest. Damping is not modelled here: the movement follows the load
 * directly, which already lags the deceleration by the braking model's 0.15 s.
 */

export const FORK_RATE = 14000
export const FORK_TRAVEL = 0.11
export const REAR_RATE = 20000
export const REAR_TRAVEL = 0.09
export const SAG = 0.3

const WEIGHT = MASS * G

export interface Suspension {
  /** Fork compression beyond its sag, mm (negative = extended under acceleration). */
  dive: number
  /** Rear compression beyond its sag, mm (negative = extended under braking). */
  squat: number
  /** Each end's position in its travel, 0 (fully extended) – 1 (bottomed out). */
  front: number
  rear: number
  bottomed: boolean
}

export function suspension(s: PowertrainState): Suspension {
  const extraFront = (frontShare(s.loadAccel) - STATIC_FRONT) * WEIGHT
  const position = (extra: number, rate: number, travel: number) => Math.min(1, Math.max(0, SAG + extra / rate / travel))
  const front = position(extraFront, FORK_RATE, FORK_TRAVEL)
  const rear = position(-extraFront, REAR_RATE, REAR_TRAVEL)
  return {
    dive: (front - SAG) * FORK_TRAVEL * 1000,
    squat: (rear - SAG) * REAR_TRAVEL * 1000,
    front,
    rear,
    bottomed: front >= 1 || rear >= 1,
  }
}

export type SituationId = 'stationary' | 'front-brake' | 'rear-brake' | 'both-brakes' | 'momentum' | 'pulling-in-first' | 'downshift' | 'accelerating' | 'engine-braking' | 'steady' | 'stalled'

export interface Situation {
  id: SituationId
  title: string
  text: string
}

const MOVING = 0.5
const pct = (x: number) => `${Math.round(x * 100)} %`
const g = (a: number) => `${Math.abs(a / G).toFixed(2)} g`

/**
 * The riding situation, in priority order. `downshiftAge` is the seconds since the last
 * change down (Infinity if none recently).
 */
export function situation(s: PowertrainState, i: PowertrainInputs, d: PowertrainDerived, downshiftAge = Infinity): Situation {
  const moving = Math.abs(s.speed) > MOVING
  const share = frontShare(s.loadAccel)
  const sus = suspension(s)
  const front = (i.front ?? 0) > 0
  const rear = (i.rear ?? 0) > 0
  if (!moving) {
    if (!s.running && s.stallCause) return { id: 'stalled', title: 'Stalled', text: 'The motorcycle has stopped and so has the engine: the wheel dragged it below its minimum speed.' }
    return { id: 'stationary', title: 'Standing still', text: `Load split ${pct(STATIC_FRONT)} front, ${pct(1 - STATIC_FRONT)} rear — the motorcycle and rider at rest on their suspension.` }
  }
  if (front && rear)
    return { id: 'both-brakes', title: 'Both brakes', text: `Slowing at ${g(s.acceleration)}. ${pct(share)} of the load is on the front tyre and the fork has dived ${Math.round(sus.dive)} mm, so the front does most of the work while the lightly loaded rear adds a little.` }
  if (front)
    return {
      id: 'front-brake',
      title: 'Front brake only',
      text: `Slowing at ${g(s.acceleration)}. The braking force acts at the road, below the centre of mass, so load transfers forward: ${pct(share)} is now on the front tyre and the fork has compressed ${Math.round(sus.dive)} mm${sus.bottomed ? ' — bottomed out' : ''}. The extra load lets the front tyre grip harder.${s.brakes.front.locked ? ' But the front wheel has locked: it can no longer steer or balance the motorcycle.' : ''}`,
    }
  if (rear)
    return {
      id: 'rear-brake',
      title: 'Rear brake only',
      text: `Slowing at only ${g(s.acceleration)}. Braking takes load off the rear tyre (${pct(1 - share)} left on it), so it can't stop the motorcycle quickly${s.brakes.rear.locked ? ' — and it has locked and is skidding' : ' and locks easily if pressed harder'}.`,
    }
  if (!s.running) return { id: 'momentum', title: 'Rolling with the engine stopped', text: 'Nothing is driving the rear wheel; momentum carries the motorcycle while drag and rolling resistance slow it.' }
  if (i.gear === 0 || d.clamp === 0)
    return {
      id: 'momentum',
      title: 'Rolling on momentum',
      text: `${i.gear === 0 ? 'In neutral' : 'With the clutch pulled in'}, the engine is disconnected: it idles at ${Math.round(d.engineRpm)} RPM while the wheels keep turning on the motorcycle's own momentum, slowing gently (${g(s.acceleration)}).`,
    }
  if (downshiftAge < 3 && s.clutchTorque < 0)
    return {
      id: 'downshift',
      title: 'After a downshift: engine braking',
      text: `The lower gear makes the engine turn faster for the same road speed (${Math.round(d.engineRpm)} RPM now), and the rear wheel has to drive it round against its friction and intake vacuum — slowing the motorcycle at ${g(s.acceleration)}. The fork dips slightly as load moves forward.`,
    }
  if (i.gear === 1 && s.acceleration > 0.2)
    return {
      id: 'pulling-in-first',
      title: 'Accelerating in first gear',
      text: `First gear multiplies the engine's torque about ${Math.round(overallRatioFor(1))} times at the rear wheel: ${Math.round(d.driveForce)} N of push. Accelerating at ${g(s.acceleration)} transfers load to the rear: the rear squats ${Math.round(sus.squat)} mm and the fork extends.`,
    }
  if (s.acceleration > 0.2)
    return { id: 'accelerating', title: 'Accelerating', text: `${Math.round(d.driveForce)} N of push at the rear tyre, accelerating at ${g(s.acceleration)}: the rear squats ${Math.round(sus.squat)} mm.` }
  if (s.clutchTorque < 0 && s.acceleration < -0.2)
    return { id: 'engine-braking', title: 'Engine braking', text: `Throttle closed in gear: the wheel turns the engine, slowing the motorcycle at ${g(s.acceleration)} without touching the brakes. The brake light stays off.` }
  return { id: 'steady', title: 'Holding speed', text: `The push at the tyre (${Math.round(d.driveForce)} N) roughly balances rolling resistance and air drag, so speed stays about the same.` }
}
