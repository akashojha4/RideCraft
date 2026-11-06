import type { PartId } from '@/components/motorcycle/parts'
import type { PowertrainPart } from '@/lib/simulation/models/powertrain'
import { sideViewParts } from '@/lib/simulation/models/powertrain'
import type { StageId } from '@/lib/simulation/powerFlow'
import type { CockpitZone } from './RiderCockpit'

/*
 * One cause-and-effect highlight, shown in all three perspectives at once: the parts named by
 * a stage of the chain light up as cockpit controls, as cards and power-flow stages inside the
 * machine, and on the motorcycle seen from the road.
 */

export type MachineCard = 'engine' | 'clutch' | 'gearbox' | 'final-drive' | 'brakes'

const ZONE: Partial<Record<PowertrainPart, CockpitZone>> = {
  clutch: 'clutch',
  basket: 'clutch',
  throttle: 'throttle',
  frontBrake: 'throttle',
  rearBrake: 'rear-brake',
  gearbox: 'gear',
  mainshaft: 'gear',
  countershaft: 'gear',
}
const CARD: Partial<Record<PowertrainPart, MachineCard>> = {
  crank: 'engine',
  throttle: 'engine',
  clutch: 'clutch',
  basket: 'clutch',
  mainshaft: 'gearbox',
  gearbox: 'gearbox',
  countershaft: 'gearbox',
  chain: 'final-drive',
  wheel: 'final-drive',
  rearWheel: 'final-drive',
  frontWheel: 'brakes',
  frontBrake: 'brakes',
  rearBrake: 'brakes',
}
const STAGES: Partial<Record<PowertrainPart, StageId[]>> = {
  crank: ['engine'],
  throttle: ['engine'],
  clutch: ['clutch'],
  basket: ['clutch'],
  mainshaft: ['clutch', 'gearbox'],
  gearbox: ['gearbox'],
  countershaft: ['gearbox', 'front-sprocket'],
  chain: ['front-sprocket', 'chain', 'rear-sprocket'],
  wheel: ['wheel'],
  rearWheel: ['wheel'],
}

const unique = <T>(xs: (T | undefined)[]) => [...new Set(xs.filter((x): x is T => x !== undefined))]

export interface CrossHighlight {
  zones: CockpitZone[]
  cards: MachineCard[]
  stages: StageId[]
  sideView: PartId[]
}

export function crossHighlight(parts: readonly PowertrainPart[]): CrossHighlight {
  return {
    zones: unique(parts.map((p) => ZONE[p])),
    cards: unique(parts.map((p) => CARD[p])),
    stages: unique(parts.flatMap((p) => STAGES[p] ?? [])),
    sideView: sideViewParts(parts),
  }
}

export const NO_HIGHLIGHT: CrossHighlight = { zones: [], cards: [], stages: [], sideView: [] }
