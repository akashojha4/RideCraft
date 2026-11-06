import type { PowertrainInputs, PowertrainState } from '@/lib/mechanics/powertrain'
import type { PowertrainDerived } from './models/powertrain'

/*
 * The next sensible thing for a learner to do in the cockpit, from the shared state — a
 * prompt, not a rule: exploration is always allowed.
 */

const MOVING = 0.5 // m/s

export function nextHint(s: PowertrainState, i: PowertrainInputs, d: PowertrainDerived): string | null {
  const moving = Math.abs(s.speed) > MOVING
  if (s.brakes.front.locked) return 'Ease the front brake off: a locked front wheel can’t steer or keep the motorcycle upright.'
  if (s.brakes.rear.locked) return 'Ease the rear brake off until the wheel turns again.'
  if (!s.running) return i.gear > 0 && d.clamp > 0 ? 'Pull the clutch in (or select neutral), then press Start.' : 'Press Start (or I) to start the engine.'
  if (!moving) {
    if (i.gear === 0) return 'Pull the clutch in fully, then press the gear lever down for first gear.'
    if (d.clamp === 0) return (i.throttle ?? 0) < 0.05 ? 'Open the throttle a little, then ease the clutch out slowly to the biting point.' : 'Ease the clutch out slowly until you feel it bite.'
    if (d.slipping) return 'Keep easing the clutch out as the motorcycle starts to move.'
  }
  if (moving && d.slipping) return 'Keep easing the clutch out until it is fully released.'
  if (moving && i.gear > 0 && d.clamp === 0 && Math.abs(s.speed) < 2) return 'Keep the clutch in as you stop, then select neutral.'
  if (moving && s.locked && i.gear > 0 && i.gear < 5 && d.engineRpm > 6500) return 'The engine is revving hard: clutch in, close the throttle, lift the lever for the next gear, and ease the clutch out.'
  if (moving && s.locked && i.gear > 1 && d.engineRpm < 2200 && i.throttle > 0.2) return 'The engine is labouring: change down for more pull.'
  return null
}
