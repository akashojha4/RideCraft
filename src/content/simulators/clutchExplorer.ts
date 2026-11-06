import { CLUTCH, clutchMechanism, leverForClamp, type Actuation, type ClutchMechanism } from '@/lib/mechanics/clutch'
import { PRIMARY_RATIO } from '@/lib/mechanics/gearbox'
import { STALL_RPM, overallRatioFor, type PowertrainInputs, type PowertrainState } from '@/lib/mechanics/powertrain'
import type { Assumption, CausalLink, Explanation, GuidedStep, SimModel } from '@/lib/simulation/model'
import { derivePowertrain, powertrainModel, powertrainRotations, type PowertrainDerived } from '@/lib/simulation/models/powertrain'

/*
 * The clutch explorer: the powertrain model with the clutch mechanism opened up. The lever
 * drives clutchMechanism() (pushrod → clamp load → capacity); the powertrain decides what the
 * engine, gearbox and rear wheel do with that capacity.
 */

export type ExplorerPart =
  | 'lever'
  | 'actuator'
  | 'pushrod'
  | 'springs'
  | 'pressurePlate'
  | 'plates'
  | 'basket'
  | 'hub'
  | 'mainshaft'
  | 'countershaft'
  | 'throttle'
  | 'gearbox'
  | 'chain'
  | 'wheel'

/** What is turning the rear wheel. */
export type DriveSource = 'engine' | 'engine-braking' | 'momentum' | 'stopped'

export interface ExplorerDerived extends PowertrainDerived {
  mech: ClutchMechanism
  /** Clutch basket (driven by the crankshaft) and hub (on the gearbox mainshaft), RPM. */
  basketRpm: number
  hubRpm: number
  /** Speed difference across the plates, RPM at the clutch. */
  slipRpm: number
  /** Torque passing through the plates, and what they could pass now, N·m at the clutch. */
  passingNm: number
  capacityNm: number
  source: DriveSource
}

const MOVING = 0.3 // m/s

export function deriveExplorer(s: PowertrainState, i: PowertrainInputs): ExplorerDerived {
  const d = derivePowertrain(s, i)
  const mech = clutchMechanism(i.clutch, i.actuation)
  const r = powertrainRotations(s, i, d)
  const basketRpm = r.basket ?? 0
  const hubRpm = r.mainshaft ?? 0
  const passingNm = i.gear ? s.clutchTorque * PRIMARY_RATIO : 0
  const torque = s.clutchTorque
  const source: DriveSource =
    Math.abs(s.speed) < MOVING ? 'stopped' : i.gear === 0 || mech.clamp === 0 || !s.running ? 'momentum' : torque > 0.3 ? 'engine' : torque < -0.3 ? 'engine-braking' : 'momentum'
  return {
    ...d,
    mech,
    basketRpm,
    hubRpm,
    slipRpm: i.gear ? Math.abs(basketRpm - hubRpm) : 0,
    passingNm,
    capacityNm: d.capacity * PRIMARY_RATIO,
    source,
  }
}

export const sourceText: Record<DriveSource, { title: string; text: string }> = {
  engine: { title: 'The engine is driving the wheel', text: 'Torque flows from the crankshaft through the clutch, gearbox and chain to the rear tyre.' },
  'engine-braking': { title: 'The wheel is driving the engine', text: 'Throttle closed in gear: the rear wheel turns the engine against its friction and intake vacuum — engine braking.' },
  momentum: { title: 'Rolling on momentum', text: 'Nothing is driving the rear wheel: the engine is disconnected, and the motorcycle’s own momentum keeps it turning while drag and rolling resistance slow it.' },
  stopped: { title: 'Stationary', text: 'The rear wheel isn’t turning.' },
}

const mm = (x: number) => `${x.toFixed(2)} mm`
const nm = (x: number) => `${Math.abs(x).toFixed(1)} N·m`

export function explorerChain(_s: PowertrainState, i: PowertrainInputs, d: ExplorerDerived): CausalLink<ExplorerPart>[] {
  return [
    { stage: 'input', label: 'Clutch lever', value: `${Math.round(i.clutch * 100)} %`, components: ['lever'] },
    { stage: 'input', label: 'Throttle', value: `${Math.round(i.throttle * 100)} %`, components: ['throttle'] },
    { stage: 'mechanism', label: 'Pushrod travel', value: mm(d.mech.travel), components: ['actuator', 'pushrod'] },
    { stage: 'mechanism', label: 'Clamp load', value: `${Math.round(d.mech.clampN)} N`, components: ['springs', 'pressurePlate', 'plates'] },
    { stage: 'transmission', label: 'Plates passing', value: i.gear ? `${nm(d.passingNm)} of ${nm(d.capacityNm)}` : 'no drive path', components: ['plates', 'basket', 'hub'] },
    { stage: 'transmission', label: 'Slip', value: i.gear ? `${Math.round(d.slipRpm)} RPM` : '—', components: ['basket', 'hub'] },
    { stage: 'transmission', label: 'Gear', value: i.gear ? `${i.gear} · ${overallRatioFor(i.gear).toFixed(1)} : 1` : 'neutral', components: ['gearbox', 'chain'] },
    { stage: 'response', label: 'Rear wheel', value: `${d.kmh.toFixed(1)} km/h`, components: ['wheel'] },
    { stage: 'response', label: 'Driven by', value: d.source === 'engine' ? 'engine' : d.source === 'engine-braking' ? 'wheel → engine' : d.source === 'momentum' ? 'momentum' : '—', components: ['wheel', 'chain'] },
  ]
}

export function explainExplorer(s: PowertrainState, i: PowertrainInputs, d: ExplorerDerived): Explanation<ExplorerPart> {
  const chain = explorerChain(s, i, d)
  const m = d.mech
  if (!s.running) return { tone: 'danger', title: 'Engine stalled', text: `The clutch connected the engine to a load it couldn’t turn, and dragged it below ${STALL_RPM} RPM. Pull the clutch in (or select neutral) and restart.`, chain }
  if (m.stage === 'freeplay')
    return { tone: 'info', title: 'Freeplay', text: `The lever is moving but the pushrod isn’t yet: this slack (${Math.round(CLUTCH.freeplay[i.actuation ?? 'cable'] * 100)} % of the lever’s travel on a ${i.actuation ?? 'cable'} clutch) makes sure the springs always clamp fully when you let go.`, chain }
  if (m.stage === 'disengaged') {
    const drag = i.gear > 0 && s.speed < MOVING ? ' Only a little oil drag reaches the hub — the reason first gear goes in with a clunk.' : ''
    return { tone: 'info', title: 'Disengaged', text: `The pushrod has lifted the pressure plate ${mm(m.travel)}, the clamp load is gone and the plates have ${mm(m.gap)} of clearance. The basket turns with the engine; the hub is free.${drag}`, chain }
  }
  if (m.stage === 'friction') {
    if (i.gear === 0) return { tone: 'info', title: 'Friction zone — in neutral', text: `The plates are clamped with ${Math.round(m.clampN)} N, but in neutral the hub drives nothing, so there is nothing to slip against.`, chain }
    if (s.locked) return { tone: 'ok', title: 'Partly clamped, not slipping', text: `Clamp is down to ${Math.round(m.clampN)} N, but the plates can still grip ${nm(d.capacityNm)} — more than the ${nm(d.passingNm)} needed now — so engine and wheel turn together.`, chain }
    return { tone: 'caution', title: 'Friction zone — the plates are slipping', text: `Clamped with ${Math.round(m.clampN)} N, the plates pass ${nm(d.passingNm)} while the basket and hub turn ${Math.round(d.slipRpm)} RPM apart. The difference becomes heat: ${Math.round(d.slipHeat)} W.`, chain }
  }
  if (i.gear === 0) return { tone: 'info', title: 'Engaged — in neutral', text: 'The plates are clamped and the hub turns with the basket, but no gear is selected, so the gearbox output and the rear wheel are not driven.', chain }
  if (s.locked) return { tone: 'ok', title: 'Engaged and locked', text: `Full clamp load (${Math.round(m.clampN)} N): basket and hub turn as one. Engine speed is tied to road speed through ${overallRatioFor(i.gear).toFixed(1)} : 1.`, chain }
  return { tone: 'caution', title: 'Engaged, still slipping', text: 'The springs are clamping fully but the engine and wheel side haven’t matched yet; the plates will grip in a moment.', chain }
}

export const assumptions: readonly Assumption[] = [
  { id: 'clutch', text: `A representative wet multi-plate clutch: ${CLUTCH.surfaces} friction surfaces, ${CLUTCH.springPreload} N of spring clamp, ${CLUTCH.radius * 1000} mm mean radius, friction coefficient ${CLUTCH.muStatic} gripping and ${CLUTCH.muKinetic} slipping.`, effect: 'Real values depend on the motorcycle, the oil, its temperature and wear.' },
  { id: 'cushion', text: `After the freeplay the pushrod moves in proportion to the lever (${CLUTCH.pushrodTravel} mm at the grip). The clamp load falls as (1 − travel ÷ ${CLUTCH.engagementTravel} mm)^${CLUTCH.cushionExponent}, standing in for the cushion plate.`, effect: 'The exponent is a model choice that gives the right shape — fast drop, gentle tail — not a measured value.' },
  { id: 'actuation', text: `Cable and hydraulic clutches differ here only in freeplay (${CLUTCH.freeplay.cable * 100} % vs ${CLUTCH.freeplay.hydraulic * 100} %).`, effect: 'Real cables also stretch and add friction; hydraulic systems feel smoother and adjust for wear.' },
  { id: 'drag', text: `With the plates apart, oil drag passes a fixed ${CLUTCH.drag} N·m.`, effect: 'Real drag is higher with cold, thick oil.' },
  { id: 'vehicle', text: 'The engine, gearbox and motorcycle are the same simplified 125 cc model as the other simulators.' },
  { id: 'views', text: 'Plate gaps and pushrod travel are drawn enlarged so they can be seen; rotations are drawn 28 times slower than real.' },
]

export const clutchExplorerModel: SimModel<PowertrainInputs, PowertrainState, ExplorerDerived, ExplorerPart> = {
  id: 'clutch-explorer',
  initial: powertrainModel.initial,
  step: powertrainModel.step,
  derive: deriveExplorer,
  rotations: (s, i, d) => {
    const r = powertrainRotations(s, i, d)
    return { basket: r.basket, hub: r.mainshaft, mainshaft: r.mainshaft, countershaft: r.countershaft, wheel: r.wheel }
  },
  explain: explainExplorer,
  assumptions,
}

export const START: PowertrainInputs = { clutch: 0, throttle: 0, brake: 0, gear: 0, grade: 0, actuation: 'cable' }

/** Lever position of the biting point (5 % of full clamp) for a clutch type, %. */
export const bitingPoint = (a: Actuation) => Math.round(leverForClamp(0.05, a) * 100)

type Step = GuidedStep<PowertrainInputs, PowertrainState, ExplorerDerived, ExplorerPart>

export const guidedSteps: readonly Step[] = [
  {
    id: 'pull-in',
    title: 'Pull the clutch in',
    instruction: 'The engine is idling in neutral. Pull the clutch lever all the way to the grip and watch the pushrod and pressure plate.',
    highlight: ['lever', 'actuator', 'pushrod', 'pressurePlate', 'springs'],
    setup: { inputs: { clutch: 0, throttle: 0, brake: 0, gear: 0 }, state: {} },
    done: (s, i, d) => s.running && d.mech.stage === 'disengaged' && i.clutch > 0.9,
    explanation: 'First the freeplay is taken up; then the pushrod lifts the pressure plate. The clamp load collapses within the first 0.65 mm, the plates separate, and the springs are squeezed even harder — which is why the lever feels heavier the further you pull.',
  },
  {
    id: 'first-gear',
    title: 'Select first gear',
    instruction: 'With the lever still pulled in, select first gear.',
    highlight: ['gearbox', 'hub'],
    done: (s, i) => i.gear === 1 && s.running,
    explanation: 'The gearbox now ties the clutch hub to the stationary rear wheel, so the hub stops while the basket keeps turning with the engine. The plates are apart, so only a little oil drag passes between them — the clunk you hear on a real motorcycle.',
  },
  {
    id: 'bite',
    title: 'Find the biting point',
    instruction: 'Let the lever out slowly until the motorcycle just starts to creep, then hold it there.',
    highlight: ['plates', 'basket', 'hub'],
    done: (s, i, d) => s.running && i.gear > 0 && d.mech.stage === 'friction' && !s.locked && s.speed > 0.2,
    explanation: 'This is the biting point: a small clamp load lets the slipping plates pass just enough torque to overcome rolling resistance. Basket and hub still turn at very different speeds — the difference is turned into heat.',
  },
  {
    id: 'engage',
    title: 'Feed in the drive',
    instruction: 'Add a little throttle and keep easing the lever out until the basket and hub turn together.',
    highlight: ['throttle', 'plates', 'basket', 'hub'],
    done: (s, i) => s.running && i.gear > 0 && s.locked,
    explanation: 'As the clamp load rose, the plates passed more torque and the motorcycle sped up until the hub caught up with the basket. With no slip left, the plates grip (static friction, about 15 % stronger than slipping) and engine and wheel turn as one.',
  },
  {
    id: 'momentum',
    title: 'Roll on momentum',
    instruction: 'Ride up to about 15 km/h, then pull the clutch in fully.',
    highlight: ['plates', 'wheel', 'chain'],
    done: (s, _i, d) => s.running && d.mech.stage === 'disengaged' && s.speed > 8 / 3.6,
    explanation: 'The engine drops back to idle, but the rear wheel keeps turning: nothing is driving it now. The motorcycle is rolling on its own momentum, slowed only by drag and rolling resistance.',
  },
  {
    id: 'stop',
    title: 'Stop without stalling',
    instruction: 'Keep the clutch in and brake to a stop.',
    highlight: ['lever', 'plates', 'wheel'],
    done: (s, i) => s.running && i.gear > 0 && Math.abs(s.speed) < 0.05 && i.clutch > 0.5,
    explanation: 'With the plates apart, the stopping wheel couldn’t drag the engine down, so it kept idling. Let the clutch out in gear at a standstill and it would stall.',
  },
]
