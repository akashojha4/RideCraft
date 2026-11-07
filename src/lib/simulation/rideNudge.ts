/** The rider's controls at one moment, enough to say what just changed. */
export interface NudgeInputs {
  clutch: number
  throttle: number
  front: number
  rear: number
  gear: number
}

/** Which cockpit corner to light up with the nudge. */
export type NudgeZone = 'clutch' | 'throttle' | 'gear' | 'rear-brake'

export interface RideNudge {
  text: string
  zone?: NudgeZone
}

const MOVE = 0.03
const gearName = (g: number) => (g === 0 ? 'neutral' : `gear ${g}`)

/**
 * A short "Now: …" line for a demonstration, from how the controls just moved.
 * Gear changes and the starter come first; clutch, brakes and throttle can share a line.
 */
export function rideNudge(
  prev: NudgeInputs | null,
  next: NudgeInputs,
  extra: { started?: boolean; steer?: boolean } = {},
): RideNudge {
  if (extra.started) return { text: 'Now: pressing Start — the engine fires', zone: 'throttle' }
  if (prev && next.gear !== prev.gear) {
    if (next.gear === 0) return { text: 'Now: a half-lift into neutral', zone: 'gear' }
    // First sits below neutral:  N → 1 is a press down; every other up-change is a lift.
    if (prev.gear === 0 && next.gear === 1) return { text: 'Now: pressing the gear lever down into first', zone: 'gear' }
    if (next.gear > prev.gear) return { text: `Now: lifting the gear lever into ${gearName(next.gear)}`, zone: 'gear' }
    return { text: `Now: pressing the gear lever down into ${gearName(next.gear)}`, zone: 'gear' }
  }
  if (!prev) {
    if (next.clutch > 0.8) return { text: 'Now: clutch held in', zone: 'clutch' }
    if (next.throttle > 0.1) return { text: 'Now: holding the throttle', zone: 'throttle' }
    return { text: 'Now: watch the controls' }
  }

  const bits: string[] = []
  let zone: NudgeZone | undefined
  const dClutch = next.clutch - prev.clutch
  const dTh = next.throttle - prev.throttle
  const dFront = next.front - prev.front
  const dRear = next.rear - prev.rear
  if (dClutch > MOVE) {
    bits.push('pulling the clutch in')
    zone = 'clutch'
  } else if (dClutch < -MOVE) {
    bits.push('easing the clutch out')
    zone = 'clutch'
  }
  if (dFront > MOVE) {
    bits.push('squeezing the front brake')
    zone = zone ?? 'throttle'
  } else if (dFront < -MOVE) {
    bits.push('releasing the front brake')
    zone = zone ?? 'throttle'
  }
  if (dRear > MOVE) {
    bits.push('pressing the rear brake')
    zone = zone ?? 'rear-brake'
  } else if (dRear < -MOVE) {
    bits.push('releasing the rear brake')
    zone = zone ?? 'rear-brake'
  }
  if (dTh > MOVE) {
    bits.push('opening the throttle')
    zone = zone ?? 'throttle'
  } else if (dTh < -MOVE) {
    bits.push('closing the throttle')
    zone = zone ?? 'throttle'
  }
  if (extra.steer) bits.push('turning the handlebars')
  if (bits.length) return { text: `Now: ${bits.join(', and ')}`, zone }

  if (next.clutch >= 0.12 && next.clutch <= 0.4) return { text: 'Now: holding the clutch in the friction zone', zone: 'clutch' }
  if (next.front > 0.15) return { text: 'Now: holding the front brake', zone: 'throttle' }
  if (next.rear > 0.15) return { text: 'Now: holding the rear brake', zone: 'rear-brake' }
  if (next.clutch > 0.8) return { text: 'Now: clutch held in', zone: 'clutch' }
  if (next.throttle > 0.1) return { text: 'Now: holding a little throttle', zone: 'throttle' }
  return { text: 'Now: watching the motorcycle respond' }
}

export const inputsForNudge = (i: { clutch: number; throttle: number; front?: number; rear?: number; gear: number }): NudgeInputs => ({
  clutch: i.clutch,
  throttle: i.throttle,
  front: i.front ?? 0,
  rear: i.rear ?? 0,
  gear: i.gear,
})
