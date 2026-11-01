import { drivelineSpeed, initialPowertrain, stepPowertrain } from '@/lib/mechanics/powertrain'

export type BrakeTechnique = 'rear' | 'front' | 'both'
export const REACTION_TIME = 1

/**
 * Stopping distance from `kmh`, run on the same model as the simulator: the rider reacts for
 * one second, then applies the chosen brake(s) hard, held right at the grip limit (as ABS
 * would hold them), with the clutch in.
 */
export function stoppingDistance(kmh: number, grip: number, technique: BrakeTechnique) {
  const speed = kmh / 3.6
  let s = initialPowertrain({ speed, engine: drivelineSpeed(speed, 3), locked: true })
  const inputs = { gear: 3, clutch: 1, throttle: 0, brake: 0, grade: 0, grip, abs: true, front: technique === 'rear' ? 0 : 1, rear: technique === 'front' ? 0 : 1 }
  const dt = 1 / 120
  for (let t = 0; s.speed > 0.01 && t < 30; t += dt) s = stepPowertrain(s, inputs, dt)
  return { reaction: speed * REACTION_TIME, braking: s.distance }
}
