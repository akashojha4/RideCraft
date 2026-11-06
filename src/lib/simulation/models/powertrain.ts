import { clampingForce } from '@/lib/mechanics/clutch'
import { FINAL_RATIO, PRIMARY_RATIO, TYRE_CIRCUMFERENCE } from '@/lib/mechanics/gearbox'
import {
  DRAG_AT_CRANK,
  EFFICIENCY,
  WHEEL_RADIUS,
  clutchCapacity,
  drivelineSpeed,
  initialPowertrain,
  overallRatioFor,
  radToRpm,
  stepPowertrain,
  type PowertrainInputs,
  type PowertrainState,
} from '@/lib/mechanics/powertrain'
import type { PartId } from '@/components/motorcycle/parts'
import type { Assumption, CausalLink, Explanation, SimModel } from '../model'

/*
 * The real-time powertrain (lib/mechanics/powertrain.ts) as a SimModel: the clutch–throttle,
 * gear-shifting and riding-and-stopping simulators all run on it.
 */

export type PowertrainPart = 'crank' | 'basket' | 'mainshaft' | 'countershaft' | 'wheel' | 'frontWheel' | 'rearWheel' | 'clutch' | 'throttle' | 'gearbox' | 'chain' | 'frontBrake' | 'rearBrake'

export interface PowertrainDerived {
  engineRpm: number
  /** Crankshaft-equivalent speed of the wheel side of the clutch, RPM. */
  wheelSideRpm: number
  /** Rear wheel speed, RPM. */
  wheelRpm: number
  kmh: number
  /** Clamping force on the clutch plates, 0–1. */
  clamp: number
  /** Torque the clutch can pass in its current state (gripping when locked, sliding otherwise), N·m at the crank. */
  capacity: number
  /** In gear, engine running, clutch partly engaged and not locked. */
  slipping: boolean
  /** Heat made by the slipping plates, W. */
  slipHeat: number
  /** Drive force at the rear tyre, N (negative = engine braking). */
  driveForce: number
}

export function derivePowertrain(s: PowertrainState, i: PowertrainInputs): PowertrainDerived {
  const engineRpm = Math.max(0, radToRpm(s.engine))
  const wheelSide = drivelineSpeed(s.speed, i.gear)
  const clamp = clampingForce(i.clutch, i.actuation)
  const slipping = s.running && i.gear > 0 && !s.locked && clamp > 0
  const ratio = overallRatioFor(i.gear)
  return {
    engineRpm,
    wheelSideRpm: Math.max(0, radToRpm(wheelSide)),
    wheelRpm: (s.speed / TYRE_CIRCUMFERENCE) * 60,
    kmh: Math.abs(s.speed) < 0.01 ? 0 : s.speed * 3.6,
    clamp,
    // Never below the oil drag, which a disengaged clutch still passes.
    capacity: i.gear ? Math.max(clutchCapacity(i.clutch, i.actuation, !s.locked), DRAG_AT_CRANK) : 0,
    slipping,
    slipHeat: slipping ? Math.abs(s.clutchTorque * (s.engine - wheelSide)) : 0,
    driveForce: i.gear > 0 ? (s.clutchTorque * ratio * EFFICIENCY) / WHEEL_RADIUS : 0,
  }
}

/** Speeds of the moving parts, RPM. Gear meshes reverse direction; the drawings handle that. */
export function powertrainRotations(s: PowertrainState, i: PowertrainInputs, d: PowertrainDerived): Partial<Record<PowertrainPart, number>> {
  const countershaft = i.gear > 0 ? d.wheelRpm * FINAL_RATIO : 0
  // In gear the mainshaft follows the wheel; in neutral it turns with the clutch hub when the clutch is engaged.
  const mainshaft = i.gear > 0 ? d.wheelSideRpm / PRIMARY_RATIO : d.clamp > 0 ? d.engineRpm / PRIMARY_RATIO : 0
  return {
    crank: d.engineRpm,
    basket: d.engineRpm / PRIMARY_RATIO,
    mainshaft,
    countershaft,
    wheel: d.wheelRpm,
    // A locked wheel stops turning while the motorcycle slides on.
    frontWheel: s.brakes.front.locked ? 0 : d.wheelRpm,
    rearWheel: s.brakes.rear.locked ? 0 : d.wheelRpm,
  }
}

const SIDE_VIEW: Partial<Record<PowertrainPart, PartId>> = {
  crank: 'engine',
  basket: 'clutch',
  clutch: 'clutch',
  throttle: 'throttle',
  mainshaft: 'gearbox',
  countershaft: 'gearbox',
  gearbox: 'gearbox',
  chain: 'chain',
  wheel: 'wheels',
  frontWheel: 'wheels',
  rearWheel: 'wheels',
  frontBrake: 'front-brake',
  rearBrake: 'rear-brake',
}

/** The parts on the motorcycle side view that correspond to powertrain parts. */
export function sideViewParts(parts: readonly PowertrainPart[]): PartId[] {
  return [...new Set(parts.map((p) => SIDE_VIEW[p]).filter((p): p is PartId => !!p))]
}

const pct = (x: number) => `${Math.round(x * 100)} %`

/** The cause-and-effect chain for the current moment. */
export function powertrainChain(s: PowertrainState, i: PowertrainInputs, d: PowertrainDerived): CausalLink<PowertrainPart>[] {
  const clutchState = i.gear === 0 ? 'neutral — no drive path' : d.clamp === 0 ? 'disengaged' : s.locked ? 'locked (no slip)' : d.clamp < 1 ? 'slipping' : 'engaging'
  const braking = (i.front ?? 0) + (i.rear ?? 0) + i.brake > 0
  return [
    { stage: 'input', label: 'Clutch lever', value: pct(i.clutch), components: ['clutch'] },
    { stage: 'input', label: 'Throttle', value: pct(i.throttle), components: ['throttle'] },
    ...(braking ? [{ stage: 'input' as const, label: 'Brakes', value: `front ${pct((i.front ?? 0) + i.brake)} · rear ${pct((i.rear ?? 0) + i.brake)}`, components: ['frontBrake', 'rearBrake'] as PowertrainPart[] }] : []),
    { stage: 'mechanism', label: 'Clamping force', value: pct(d.clamp), components: ['clutch'] },
    { stage: 'mechanism', label: 'Clutch', value: clutchState, components: ['clutch', 'basket'] },
    { stage: 'transmission', label: 'Clutch passing', value: `${Math.abs(s.clutchTorque).toFixed(1)} of ${d.capacity.toFixed(1)} N·m`, components: ['clutch', 'mainshaft'] },
    { stage: 'transmission', label: 'Gear', value: i.gear ? `${i.gear} · ${overallRatioFor(i.gear).toFixed(1)} : 1 overall` : 'neutral', components: ['gearbox', 'countershaft', 'chain'] },
    { stage: 'response', label: 'Force at the tyre', value: `${Math.round(d.driveForce)} N`, components: ['wheel', 'rearWheel'] },
    { stage: 'response', label: 'Speed', value: `${d.kmh.toFixed(1)} km/h`, components: ['wheel'] },
  ]
}

/** Generic narrative; each simulator's content supplies its own, more specific text. */
export function explainPowertrain(s: PowertrainState, i: PowertrainInputs, d: PowertrainDerived): Explanation<PowertrainPart> {
  const chain = powertrainChain(s, i, d)
  if (!s.running) return { tone: 'danger', title: 'Engine stalled', text: 'The engine was dragged below its minimum speed.', chain }
  if (i.gear === 0) return { tone: 'info', title: 'Neutral', text: 'No gear is engaged, so the engine and rear wheel turn independently.', chain }
  if (d.slipping) return { tone: 'caution', title: 'Clutch slipping', text: 'Engine and wheel side turn at different speeds; the clutch passes only part of the engine’s torque and turns the difference into heat.', chain }
  if (s.locked) return { tone: 'ok', title: 'Clutch locked', text: 'Engine and rear wheel turn together through the gears.', chain }
  return { tone: 'info', title: 'Clutch disengaged', text: 'The engine is disconnected from the gearbox.', chain }
}

/** What the powertrain model simplifies. */
export const powertrainAssumptions: readonly Assumption[] = [
  { id: 'vehicle', text: 'A representative 125 cc single-cylinder commuter with rider (225 kg), not a specific model.' },
  { id: 'clutch', text: 'The clutch is a representative cable-operated wet clutch: after the lever’s freeplay, the clamp load falls along a smooth curve set by the cushion plate (its shape is a model choice), gripping plates carry about 15 % more torque than slipping ones, and oil drag is a fixed 0.8 N·m.', effect: 'Real clutches differ in spring load, friction material, oil temperature and wear.' },
  { id: 'inertia', text: 'The spinning wheels count as about 10 kg of extra mass to accelerate and brake; the gearbox shafts and chain add nothing.', effect: 'A real drivetrain adds a little more.' },
  { id: 'load', text: 'Under braking, the load on each tyre follows the deceleration with a 0.15 s lag, standing in for suspension pitch.' },
  { id: 'grip', text: 'Tyre grip is a fixed friction coefficient (0.9 dry, 0.5 wet) times the load on the tyre.', effect: 'Real grip depends on the tyre, its temperature and the surface.' },
]

export const powertrainModel: SimModel<PowertrainInputs, PowertrainState, PowertrainDerived, PowertrainPart> = {
  id: 'powertrain',
  initial: initialPowertrain,
  step: stepPowertrain,
  derive: derivePowertrain,
  rotations: powertrainRotations,
  explain: explainPowertrain,
  assumptions: powertrainAssumptions,
}
