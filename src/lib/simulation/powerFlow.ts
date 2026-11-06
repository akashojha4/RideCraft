import { FINAL_RATIO, FRONT_SPROCKET_TEETH, PRIMARY_RATIO, chainSpeed, gearRatio, sprocketRadius } from '@/lib/mechanics/gearbox'
import { EFFICIENCY, WHEEL_RADIUS, type PowertrainInputs, type PowertrainState } from '@/lib/mechanics/powertrain'
import { powertrainRotations, type PowertrainDerived } from './models/powertrain'

/*
 * The power path ENGINE → CLUTCH → GEARBOX → FRONT SPROCKET → CHAIN → REAR SPROCKET → REAR WHEEL
 * at one moment: speed, torque and power at each stage, and the state of each link. Each
 * reduction divides speed and multiplies torque by its ratio, so power stays the same (less
 * the 10 % lost in the drivetrain) — the point the view makes.
 */

export type StageId = 'engine' | 'clutch' | 'gearbox' | 'front-sprocket' | 'chain' | 'rear-sprocket' | 'wheel'
export type LinkState = 'driving' | 'engine-braking' | 'slipping' | 'none'

export interface Stage {
  id: StageId
  label: string
  /** Turning speed, RPM (chain: null — it moves, see `metresPerSecond`). */
  rpm: number | null
  /** Torque, N·m. */
  torque: number
  /** Power, kW (positive = flowing towards the wheel). */
  power: number
  metresPerSecond?: number
  /** A pull instead of a twist: chain tension, or the drive force at the tyre, N. */
  force?: number
}

export interface Link {
  from: StageId
  to: StageId
  state: LinkState
  /** Why no drive passes, when state is 'none'. */
  reason?: string
}

export interface PowerFlow {
  stages: Stage[]
  links: Link[]
  /** Power turned into heat by a slipping clutch, kW. */
  slipLoss: number
}

const kW = (torque: number, rpm: number) => (torque * rpm * 2 * Math.PI) / 60 / 1000
const DRAG_TORQUE = 0.3

export function powerFlow(s: PowertrainState, i: PowertrainInputs, d: PowertrainDerived): PowerFlow {
  const r = powertrainRotations(s, i, d)
  const inGear = i.gear > 0
  const ratio = inGear ? gearRatio(i.gear) : 0
  const hubRpm = r.mainshaft ?? 0
  const outRpm = r.countershaft ?? 0
  const wheelRpm = r.rearWheel ?? 0
  // Torque the clutch passes, at the gearbox input; zero in neutral (the hub drives nothing).
  const atClutch = inGear ? s.clutchTorque * PRIMARY_RATIO : 0
  const atOutput = atClutch * ratio
  const atWheel = atOutput * FINAL_RATIO * EFFICIENCY
  const wheelForce = d.driveForce

  const passing = Math.abs(s.clutchTorque) > DRAG_TORQUE
  const flowing: LinkState = !passing ? 'none' : s.clutchTorque > 0 ? 'driving' : 'engine-braking'
  const reason = !s.running && Math.abs(s.engine) < 1 ? 'engine stopped' : !inGear ? 'neutral — no gear selected' : d.clamp === 0 ? 'clutch pulled in' : s.brakes.rear.locked ? 'rear wheel locked' : 'no torque'
  const downstream: LinkState = !inGear || s.brakes.rear.locked ? 'none' : flowing
  const clutchLink: LinkState = !inGear || d.clamp === 0 ? 'none' : d.slipping && passing ? 'slipping' : flowing

  const stages: Stage[] = [
    { id: 'engine', label: 'Engine', rpm: d.engineRpm, torque: s.engineTorque, power: kW(s.engineTorque, d.engineRpm) },
    { id: 'clutch', label: 'Clutch', rpm: hubRpm, torque: atClutch, power: kW(atClutch, hubRpm) },
    { id: 'gearbox', label: `Gearbox${inGear ? ` · ${i.gear}` : ' · N'}`, rpm: outRpm, torque: atOutput, power: kW(atOutput, outRpm) },
    { id: 'front-sprocket', label: 'Front sprocket', rpm: outRpm, torque: atOutput, power: kW(atOutput, outRpm) },
    // A chain carries a pull, not a twist: tension = sprocket torque ÷ its pitch radius.
    { id: 'chain', label: 'Chain', rpm: null, torque: atOutput, power: kW(atOutput, outRpm), metresPerSecond: chainSpeed(outRpm), force: atOutput / sprocketRadius(FRONT_SPROCKET_TEETH) },
    { id: 'rear-sprocket', label: 'Rear sprocket', rpm: wheelRpm, torque: atWheel, power: kW(atWheel, wheelRpm) },
    { id: 'wheel', label: 'Rear wheel', rpm: wheelRpm, torque: atWheel, power: (wheelForce * s.speed) / 1000, force: wheelForce },
  ]
  const ids = stages.map((st) => st.id)
  const links: Link[] = ids.slice(0, -1).map((from, k) => {
    const to = ids[k + 1]
    const state: LinkState = from === 'engine' ? (s.running ? 'driving' : 'none') : from === 'clutch' || to === 'clutch' ? clutchLink : downstream
    return { from, to, state, ...(state === 'none' ? { reason: from === 'engine' ? 'engine stopped' : reason } : {}) }
  })
  // The engine → clutch link is the crank driving the basket: always turning while the engine runs.
  links[0] = { from: 'engine', to: 'clutch', state: s.running || Math.abs(s.engine) > 1 ? (s.clutchTorque < -DRAG_TORQUE ? 'engine-braking' : 'driving') : 'none', ...(s.running || Math.abs(s.engine) > 1 ? {} : { reason: 'engine stopped' }) }
  return { stages, links, slipLoss: d.slipHeat / 1000 }
}

/** Wheel force from torque at the wheel, N (for checking). */
export const forceFromWheelTorque = (torque: number) => torque / WHEEL_RADIUS
