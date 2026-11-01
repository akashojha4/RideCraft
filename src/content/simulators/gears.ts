import { GEARS, REDLINE_RPM, gearRatio } from '@/lib/mechanics/gearbox'
import {
  EFFICIENCY,
  LIMITER_RPM,
  clutchCapacity,
  STALL_RPM,
  drivelineSpeed,
  overallRatioFor,
  radToRpm,
  rpmPerKmh,
  type PowertrainInputs,
  type PowertrainState,
} from '@/lib/mechanics/powertrain'
import type { Exercise, Topic } from '@/lib/simulation/exercises'

/** Content and scoring for the gear shifting simulator. */

const kmh = (s: PowertrainState) => s.speed * 3.6
const atSpeed = (speedKmh: number, gear: number): Partial<PowertrainState> => ({
  speed: speedKmh / 3.6,
  engine: drivelineSpeed(speedKmh / 3.6, gear),
  locked: true,
})
const riding = (gear: number, throttle: number): PowertrainInputs => ({ gear, clutch: 0, throttle, brake: 0, grade: 0 })
export const OVER_REV_RPM = LIMITER_RPM + 300
export const REV_MATCH_LIMIT = 1.8
export const ENGINE_BRAKING_TIME = 13
const ordinal = ['neutral', 'first', 'second', 'third', 'fourth', 'fifth']
const GEAR_NAMES = ['1st', '2nd', '3rd', '4th', '5th']

export const exercises: Exercise[] = [
  {
    id: 'climb',
    title: 'Climb through the gears',
    goal: 'From a standstill, pull away and change up through every gear until you are in fifth at 50 km/h or more.',
    tips: [
      'Pull away with the clutch lever, as in the clutch simulator; the auto-clutch handles each gear change after that.',
      'Change up at around 5,000–7,000 RPM — watch the RPM drop each time.',
      'Keep some throttle on between changes.',
    ],
    setup: { inputs: { gear: 1, clutch: 1, throttle: 0, brake: 0, grade: 0 } },
    evaluate: (c) => {
      if (c.stalled) return { result: 'fail', text: 'Stalled while pulling away. Use a little throttle and release the clutch through the friction zone.' }
      if (c.overRevved) return { result: 'fail', text: 'Over-revved. Change up before the needle reaches the red zone.' }
      if (c.inputs.gear === 5 && kmh(c.state) >= 50 && c.state.locked) return { result: 'pass', text: `Fifth gear at ${Math.round(kmh(c.state))} km/h. Each upshift lowered the RPM by the ratio between the two gears, keeping the engine in its useful range as speed rose.` }
      return null
    },
  },
  {
    id: 'rev-match',
    title: 'Smooth downshift',
    goal: `You are cruising in fourth at about 50 km/h. Change down to third without the motorcycle lurching — felt deceleration must stay under ${REV_MATCH_LIMIT} m/s².`,
    tips: [
      'Try it once with “Blip on downshifts” off, and feel the lurch as the clutch re-engages.',
      'Then turn the blip on: the throttle raises the engine speed to match third gear before the clutch bites.',
    ],
    setup: { inputs: riding(4, 0.3), state: atSpeed(50, 4) },
    evaluate: (c) => {
      if (c.maxDecel > REV_MATCH_LIMIT) return { result: 'fail', text: `Lurch: ${c.maxDecel.toFixed(1)} m/s². When the clutch bit, the engine was turning slower than third gear needed, so the rear wheel had to drag it up to speed. Blip the throttle to match the revs first.` }
      if (c.inputs.gear === 3 && c.state.locked && c.t > 1.5) return { result: 'pass', text: `Smooth: the engine was already near third gear’s speed when the clutch engaged, so it caught with only ${c.maxDecel.toFixed(1)} m/s² of deceleration.` }
      if (c.inputs.gear < 3) return { result: 'fail', text: 'That went past third gear. Change down one gear only.' }
      return null
    },
  },
  {
    id: 'engine-braking',
    title: 'Slow down with engine braking',
    goal: `From 60 km/h in fifth, slow to 20 km/h within ${ENGINE_BRAKING_TIME} seconds without touching the brake.`,
    tips: ['Close the throttle and change down a gear at a time.', 'Lower gears turn the engine faster for the same road speed, so its resistance slows you harder.', 'Watch the RPM: never let it go into the red.'],
    setup: { inputs: riding(5, 0), state: atSpeed(60, 5) },
    evaluate: (c) => {
      if (c.brakeUsed) return { result: 'fail', text: 'You used the brake — this one is engine braking only.' }
      if (c.overRevved) return { result: 'fail', text: 'Over-revved: that downshift came at too high a speed for the lower gear.' }
      if (c.stalled) return { result: 'fail', text: 'Stalled.' }
      if (kmh(c.state) <= 20) return { result: 'pass', text: `Down to 20 km/h in ${c.t.toFixed(1)} s using the engine alone.` }
      if (c.t > ENGINE_BRAKING_TIME) return { result: 'fail', text: `${ENGINE_BRAKING_TIME} seconds and still above 20 km/h. Staying in a high gear gives only gentle engine braking — change down progressively.` }
      return null
    },
  },
  {
    id: 'over-rev',
    title: 'Don’t over-rev on a downshift',
    goal: 'You are riding at 68 km/h in third. Get into second gear without forcing the engine past its rev limit.',
    tips: [
      `In second, every km/h is ${Math.round(rpmPerKmh(2))} RPM — work out the fastest speed second can take before shifting.`,
      'Slow down first (brake or engine braking), then change down.',
    ],
    setup: { inputs: riding(3, 0.4), state: atSpeed(68, 3) },
    evaluate: (c) => {
      if (c.overRevved) return { result: 'fail', text: `Over-rev: the rear wheel forced the engine to about ${Math.round(c.maxRpm).toLocaleString('en')} RPM. The rev limiter can’t prevent this — it only cuts fuel. Slow below about ${Math.round(LIMITER_RPM / rpmPerKmh(2))} km/h before selecting second.` }
      if (c.inputs.gear === 2 && c.state.locked && c.t > 1) return { result: 'pass', text: `Second gear at ${Math.round(kmh(c.state))} km/h — about ${Math.round(radToRpm(c.state.engine)).toLocaleString('en')} RPM, safely below the limit.` }
      return null
    },
  },
  {
    id: 'neutral-stop',
    title: 'Stop and find neutral',
    goal: 'Riding at 15 km/h in second: brake to a stop, then select neutral with the engine still running.',
    tips: ['Brake, and change down to first as you slow.', 'Pull the clutch in before you stop, or the engine stalls.', 'Once stopped, a gentle half-shift from first finds neutral — the green N.'],
    setup: { inputs: riding(2, 0), state: atSpeed(15, 2) },
    evaluate: (c) => {
      if (c.stalled) return { result: 'fail', text: `Stalled — in gear, the wheel drags the engine below ${STALL_RPM} RPM as you stop. The auto-clutch pulls the clutch in when you change gear; otherwise pull it in yourself.` }
      if (c.inputs.gear === 0 && Math.abs(c.state.speed) < 0.05 && c.state.running && c.t > 1) return { result: 'pass', text: 'Stopped in neutral with the engine idling — ready to rest your clutch hand at a long red light.' }
      return null
    },
  },
]

export const topics: Topic[] = [
  { title: 'The gear pattern', text: 'One down, four up: 1–N–2–3–4–5. Press the lever down for first; lift it for each gear above. Neutral is a half-step between first and second.', exercise: 'neutral-stop' },
  { title: 'First gear', text: `The lowest gear multiplies engine torque the most — about ${overallRatioFor(1).toFixed(0)} engine turns per wheel turn — so it is used to pull away, but runs out of revs at around ${Math.round(REDLINE_RPM / rpmPerKmh(1))} km/h.`, exercise: 'climb' },
  { title: 'Upshifting', text: 'Clutch in, throttle closed, lift the lever, clutch out, throttle back on. The engine speed drops to suit the taller gear.', exercise: 'climb' },
  { title: 'Downshifting', text: 'Clutch in, press the lever down, and release the clutch smoothly. The engine has to speed up to suit the lower gear — a blip of throttle does it before the clutch bites.', exercise: 'rev-match' },
  {
    title: 'Gear ratios',
    text: `Each pair of gears has its own ratio: ${GEARS.map((g, i) => `${GEAR_NAMES[i]} ${(g.counter / g.main).toFixed(2)}`).join(' · ')}. Multiply by the primary and final drive to get the overall reduction.`,
    exercise: 'climb',
  },
  { title: 'RPM changes', text: `At a constant road speed, RPM is proportional to the overall ratio. Changing from second to third multiplies RPM by ${(gearRatio(3) / gearRatio(2)).toFixed(2)}; from third back to second, by ${(gearRatio(2) / gearRatio(3)).toFixed(2)}.`, exercise: 'over-rev' },
  { title: 'Engine braking', text: 'With the throttle closed and a gear engaged, the engine’s internal friction and pumping work slow the motorcycle. Lower gears spin the engine faster and slow you harder.', exercise: 'engine-braking' },
  { title: 'Choosing a gear', text: 'Choose a gear that keeps the engine in its useful range: lower for pulling away, climbing and overtaking; higher for steady cruising and economy.' },
]

/** Situations for the gear-choice exercise: speed, and the RPM band that suits the task. */
export const situations: { id: string; title: string; text: string; kmh: number; band: [number, number] }[] = [
  { id: 'pull-away', title: 'Pulling away from a stop', text: 'The motorcycle is stationary at a junction.', kmh: 0, band: [0, 0] },
  { id: 'town', title: 'Riding through town at 30 km/h', text: 'Steady speed, ready to slow down for traffic.', kmh: 30, band: [3000, 6000] },
  { id: 'main-road', title: 'Steady 50 km/h on a main road', text: 'Constant speed — smooth and economical.', kmh: 50, band: [3500, 6000] },
  { id: 'overtake', title: 'Overtaking at 60 km/h', text: 'You need strong acceleration now.', kmh: 60, band: [5500, 8800] },
  { id: 'hill', title: 'Climbing a steep hill at 25 km/h', text: 'The engine needs to make plenty of torque.', kmh: 25, band: [4000, 8500] },
  { id: 'descent', title: 'A long descent at 40 km/h', text: 'Let engine braking help hold your speed.', kmh: 40, band: [4500, 8500] },
  { id: 'cruise', title: 'Cruising at 80 km/h', text: 'Open road, steady speed.', kmh: 80, band: [4000, 8000] },
]

export function judgeGear(situation: (typeof situations)[number], gear: number): { good: boolean; rpm: number; text: string } {
  if (situation.kmh === 0) {
    return gear === 1
      ? { good: true, rpm: 0, text: 'Correct — always pull away in first: it gives the most torque at the rear wheel.' }
      : { good: false, rpm: 0, text: `Pulling away in ${ordinal[gear]} would need a long, hot clutch slip, or stall the engine. Use first.` }
  }
  const rpm = rpmPerKmh(gear) * situation.kmh
  const [lo, hi] = situation.band
  if (rpm > REDLINE_RPM) return { good: false, rpm, text: `${Math.round(rpm).toLocaleString('en')} RPM — past the redline. Far too low a gear for ${situation.kmh} km/h.` }
  if (rpm < lo) return { good: false, rpm, text: `${Math.round(rpm).toLocaleString('en')} RPM — too low for this. The engine would labour; choose a lower gear.` }
  if (rpm > hi) return { good: false, rpm, text: `${Math.round(rpm).toLocaleString('en')} RPM — higher than this needs: noisy and thirsty. Choose a higher gear.` }
  return { good: true, rpm, text: `${Math.round(rpm).toLocaleString('en')} RPM — right in the range this situation needs (${lo.toLocaleString('en')}–${hi.toLocaleString('en')}).` }
}

export interface ShiftRecord {
  from: number
  to: number
  rpmBefore: number
  rpmAfter: number | null
  speedKmh: number
}

/** Plain-language account of the gearbox and engine right now. */
export function explainGears(s: PowertrainState, input: PowertrainInputs, last: ShiftRecord | null): { title: string; text: string; tone: 'ok' | 'caution' | 'danger' | 'info' } {
  const rpm = radToRpm(s.engine)
  if (!s.running) return { title: 'Engine stalled', tone: 'danger', text: `The engine was dragged below ${STALL_RPM} RPM. Pull in the clutch or select neutral, then restart.` }
  if (rpm > OVER_REV_RPM) return { title: 'Over-rev!', tone: 'danger', text: `The rear wheel is forcing the engine to ${Math.round(rpm).toLocaleString('en')} RPM — beyond its limit. The rev limiter only cuts fuel, it can’t stop the wheel turning the engine. Pull in the clutch now; next time slow down before changing down.` }
  if (input.gear === 0) return { title: 'Neutral', tone: 'info', text: 'No gear pair is locked: the engine and the rear wheel are independent. The countershaft is not driven.' }
  if (!s.locked) {
    const capacity = clutchCapacity(input.clutch)
    return capacity === 0
      ? { title: `Clutch disengaged · ${ordinal[input.gear]} selected`, tone: 'info', text: `${ordinal[input.gear][0].toUpperCase()}${ordinal[input.gear].slice(1)} gear is engaged in the gearbox, but the clutch is pulled in, so the engine (${Math.round(rpm).toLocaleString('en')} RPM) is not driving it. Release the clutch to connect them.` }
      : { title: 'Clutch slipping — friction zone', tone: 'caution', text: `The engine is at ${Math.round(rpm).toLocaleString('en')} RPM but the wheel side of the clutch only at ${Math.round(Math.max(0, radToRpm(drivelineSpeed(s.speed, input.gear)))).toLocaleString('en')} RPM. Until they match and the clutch locks, the ${Math.round(rpmPerKmh(input.gear))} RPM-per-km/h relationship of ${ordinal[input.gear]} gear doesn’t apply yet.` }
  }
  if (last && last.to === input.gear && last.rpmAfter !== null && last.from > 0) {
    const expected = gearRatio(last.to) / gearRatio(last.from)
    const actual = last.rpmAfter / last.rpmBefore
    return {
      title: last.to > last.from ? `Upshift ${last.from} → ${last.to}` : `Downshift ${last.from} → ${last.to}`,
      tone: 'ok',
      text: `At the same road speed the engine must turn ${expected.toFixed(2)} times as fast in gear ${last.to} as in gear ${last.from} (ratio ${gearRatio(last.to).toFixed(2)} ÷ ${gearRatio(last.from).toFixed(2)}). RPM went from ${Math.round(last.rpmBefore).toLocaleString('en')} to ${Math.round(last.rpmAfter).toLocaleString('en')} — a factor of ${actual.toFixed(2)}, the small difference being the speed gained or lost during the change.`,
    }
  }
  const overall = overallRatioFor(input.gear)
  if (s.locked && s.engineTorque < 0) {
    return { title: `Engine braking in ${ordinal[input.gear]}`, tone: 'ok', text: `Throttle closed, gear engaged: the engine resists the wheel. Each km/h is ${Math.round(rpmPerKmh(input.gear))} RPM in this gear — the lower the gear, the faster the engine spins and the stronger the braking.` }
  }
  return {
    title: `${ordinal[input.gear][0].toUpperCase()}${ordinal[input.gear].slice(1)} gear`,
    tone: rpm > REDLINE_RPM ? 'caution' : 'ok',
    text: `Overall ratio ${overall.toFixed(1)} : 1 — the engine turns ${overall.toFixed(1)} times for each turn of the rear wheel, and its torque is multiplied about ${(overall * EFFICIENCY).toFixed(1)} times. ${Math.round(rpmPerKmh(input.gear))} RPM per km/h.${rpm > REDLINE_RPM ? ' Near the redline — change up.' : ''}`,
  }
}
