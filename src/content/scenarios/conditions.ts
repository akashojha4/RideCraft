import { buildPath, timeline, type PathSample, type TimedSample } from '@/components/handling/path'
import { G, GRIP } from '@/lib/mechanics/braking'
import { gripLean, lateralG, leanFor } from '@/lib/mechanics/cornering'
import { fmt, goodBraking, kmh, ms, REACTION, ride, riding } from '@/lib/scenarios/sim'
import type { Actor, Frame, Scenario, TopScene } from '@/lib/scenarios/types'
import { LANE, MY_LANE, ONCOMING_LANE, framesFromRide, hold, slideFrames, speedAt, straightRoad } from './helpers'

const base = { gear: 3, clutch: 0, throttle: 0, brake: 0, grade: 0, front: 0, rear: 0 }
const toFrames = (samples: TimedSample[], actors: (t: number) => Actor[] = () => []): Frame[] =>
  samples.map((p) => ({ t: p.t, bike: { x: p.x, y: p.y, heading: p.heading, lean: p.lean, v: p.v }, actors: actors(p.t) }))

/** A right-hand bend: road centre line and your lane's line (left of centre, so on the outside). */
function bend(radius: number, approach: number, exit = 40) {
  const road = buildPath({ x: 0, y: 0, heading: 0 }, [
    { type: 'straight', length: approach + 60 },
    { type: 'arc', radius: radius - LANE / 2, angle: 90 },
    { type: 'straight', length: exit },
  ]).map((p) => ({ x: p.x, y: p.y - 60 }))
  const lane = buildPath({ x: MY_LANE, y: -60, heading: 0 }, [
    { type: 'straight', length: approach + 60, tag: 'straight' },
    { type: 'arc', radius, angle: 90, tag: 'arc' },
    { type: 'straight', length: exit, tag: 'exit' },
  ]).filter((p) => p.y >= -1 || p.tag !== 'straight')
  return { road, lane }
}
const bendScene = (radius: number, approach: number, extra: Partial<TopScene> = {}): TopScene => ({ view: 'top', road: bend(radius, approach).road, edges: [-LANE, LANE], dividers: [{ offset: 0, style: 'dashed' }], span: 28, ...extra })

/** Run along a bend at a speed profile; if `limit(p)` reports the tyres overloaded, the motorcycle slides from there. */
function bendRun(lane: PathSample[], speed: (p: PathSample) => number, overloaded: (p: TimedSample) => boolean, slideDecel: number) {
  const samples = timeline(lane, speed)
  const at = samples.findIndex(overloaded)
  if (at < 0) return { frames: toFrames(samples), slid: null as TimedSample | null }
  const frames = toFrames(samples.slice(0, at + 1))
  return { frames: [...frames, ...slideFrames(frames[frames.length - 1], slideDecel)], slid: samples[at] }
}

// ─── 7. Wet roads ────────────────────────────────────────────────────────────
const WET_R = 40
const WET_APPROACH = 35
export const wetRoad: Scenario = {
  id: 'wet-road',
  number: 7,
  title: 'Wet roads',
  summary: 'A familiar bend, in the rain.',
  situation: `It is raining. Ahead is a right-hand bend of ${WET_R} m radius that you usually take at 60 km/h in the dry. Wet asphalt gives about half the grip (μ ≈ 0.5), so the most the tyres can hold is about ${Math.round(gripLean(GRIP.wet))}° of lean.`,
  question: 'At what speed do you take the bend?',
  scene: bendScene(WET_R, WET_APPROACH, { weather: 'rain' }),
  choices: [
    { id: '60', label: '60 km/h, as usual' },
    { id: '45', label: '45 km/h' },
    { id: '35', label: '35 km/h, slowing on the straight before the bend' },
  ],
  intro: [],
  run(choice) {
    const kmhV = Number(choice)
    const v = ms(kmhV)
    const { lane } = bend(WET_R, WET_APPROACH)
    const need = leanFor(v, WET_R)
    const use = lateralG(need) / GRIP.wet
    const { frames, slid } = bendRun(lane, () => v, (p) => Math.abs(p.lean) > gripLean(GRIP.wet), 0.4 * G)
    const verdict = slid ? 'crash' : use > 0.7 ? 'risky' : 'safe'
    return {
      verdict,
      rider: kmhV === 35 ? 'Brakes gently on the straight, upright, then rides the bend smoothly with a steady throttle.' : `Enters the bend at ${kmhV} km/h.`,
      motorcycle: `The bend needs ${fmt(need)}° of lean at ${kmhV} km/h — ${Math.round(use * 100)} % of the grip the wet road can give.${slid ? ' Past about 27° the tyres give way.' : ''}`,
      explanation: slid
        ? 'The same bend at the same speed needs the same sideways grip, rain or shine — but the wet road has only half as much to give. The tyres slide out from under the motorcycle.'
        : use > 0.7
          ? 'You make it, but with little in reserve. A painted line, a manhole cover or a patch of diesel in the bend has even less grip — touch one and the tyres slide.'
          : 'Slowing down on the straight keeps the lean small, leaving half of the wet grip in reserve for surprises.',
      consequence: verdict === 'crash' ? 'Crash: the tyres slide out and the motorcycle falls on its side (a “low-side”).' : verdict === 'risky' ? 'Risky: no margin left for anything unexpected.' : 'Safe: plenty of grip in reserve.',
      metrics: [
        { label: 'Lean needed', value: `${fmt(need)}°`, tone: need > gripLean(GRIP.wet) ? 'danger' : 'ink' },
        { label: 'Wet grip used', value: `${Math.round(use * 100)} %`, tone: use > 1 ? 'danger' : use > 0.7 ? 'caution' : 'ok' },
        { label: 'Wet-road lean limit', value: `${Math.round(gripLean(GRIP.wet))}°` },
      ],
      frames,
    }
  },
  takeaway: 'In the wet, grip roughly halves: slow down before bends, keep the lean small and every input smooth, and avoid painted lines and covers.',
}

// ─── 8. Gravel ───────────────────────────────────────────────────────────────
const GRAVEL_R = 30
const GRAVEL_APPROACH = 30
const GRAVEL_MU = 0.35
const GRAVEL_FROM = 25
const GRAVEL_TO = 55
function gravelPatch() {
  const c = { x: MY_LANE + GRAVEL_R, y: GRAVEL_APPROACH }
  const pts: { x: number; y: number }[] = []
  for (let a = GRAVEL_FROM; a <= GRAVEL_TO; a += 5) pts.push({ x: c.x - (GRAVEL_R + 1.7) * Math.cos((a * Math.PI) / 180), y: c.y + (GRAVEL_R + 1.7) * Math.sin((a * Math.PI) / 180) })
  for (let a = GRAVEL_TO; a >= GRAVEL_FROM; a -= 5) pts.push({ x: c.x - (GRAVEL_R - 1.7) * Math.cos((a * Math.PI) / 180), y: c.y + (GRAVEL_R - 1.7) * Math.sin((a * Math.PI) / 180) })
  return pts
}
export const gravel: Scenario = {
  id: 'gravel',
  number: 8,
  title: 'Gravel',
  summary: 'Loose gravel spread across a bend.',
  situation: `You are approaching a right-hand bend (${GRAVEL_R} m radius) at 40 km/h. As you get closer you see loose gravel spread across your lane in the middle of the bend. Gravel gives only about a third of normal grip (μ ≈ ${GRAVEL_MU}).`,
  question: 'What do you do?',
  scene: bendScene(GRAVEL_R, GRAVEL_APPROACH, { features: [{ type: 'patch', kind: 'gravel', points: gravelPatch() }] }),
  choices: [
    { id: 'brake', label: 'Keep your speed and brake hard when you reach the gravel' },
    { id: 'carry', label: 'Carry on at 40 km/h, holding the same line' },
    { id: 'slow', label: 'Slow down on the straight, then cross the gravel smoothly — no braking, steady throttle' },
  ],
  intro: [],
  run(choice) {
    const { lane } = bend(GRAVEL_R, GRAVEL_APPROACH)
    const arcStart = lane.find((p) => p.tag === 'arc')!.s
    const sFrom = arcStart + (GRAVEL_FROM * Math.PI * GRAVEL_R) / 180
    const sTo = arcStart + (GRAVEL_TO * Math.PI * GRAVEL_R) / 180
    const v40 = ms(40)
    const v25 = ms(25)
    const onGravel = (p: PathSample) => p.s >= sFrom && p.s <= sTo
    const speed = choice === 'slow' ? (p: PathSample) => (p.s < arcStart - 25 ? v40 : Math.max(v25, Math.sqrt(Math.max(0, v40 * v40 - 2 * 0.25 * G * (p.s - (arcStart - 25)))))) : () => v40
    const brakeG = choice === 'brake' ? 0.5 : 0
    const demand = (p: TimedSample) => Math.hypot(lateralG(Math.abs(leanFor(p.v, GRAVEL_R))), onGravel(p) ? brakeG : 0)
    const { frames, slid } = bendRun(lane, speed, (p) => onGravel(p) && demand(p) > GRAVEL_MU, GRAVEL_MU * G)
    const vIn = choice === 'slow' ? v25 : v40
    const ay = lateralG(leanFor(vIn, GRAVEL_R))
    const total = Math.hypot(ay, brakeG)
    return {
      verdict: slid ? 'crash' : 'safe',
      rider: choice === 'slow' ? 'Brakes on the straight to 25 km/h, upright, then keeps a steady throttle and a gentle lean across the gravel, looking at the clean road beyond it.' : choice === 'brake' ? 'Rides into the bend at 40 km/h and brakes hard on reaching the gravel.' : 'Carries 40 km/h into the bend on the same line.',
      motorcycle: `On the gravel the tyres are asked for ${fmt(total, 2)} g (${fmt(ay, 2)} g to turn${brakeG ? ` + ${brakeG} g of braking` : ''}) — ${Math.round((total / GRAVEL_MU) * 100)} % of what gravel can give.`,
      explanation: slid
        ? choice === 'brake'
          ? 'Braking on top of turning, on a surface with a third of the grip: far outside the friction circle. The front tyre slides at once.'
          : 'At 40 km/h this bend needs 0.42 g of sideways grip; gravel can give only 0.35 g. The tyres slide even without braking.'
        : 'All the slowing was done on clean asphalt, upright. On the gravel the motorcycle only has to turn gently at a steady speed — under half of the little grip available.',
      consequence: slid ? 'Crash: the front tyre washes out on the gravel and the motorcycle slides off the road.' : 'Safe: across the gravel with grip to spare.',
      metrics: [
        { label: 'Speed on the gravel', value: `${Math.round(kmh(vIn))} km/h` },
        { label: 'Grip asked for', value: `${fmt(total, 2)} g` },
        { label: 'Gravel grip used', value: `${Math.round((total / GRAVEL_MU) * 100)} %`, tone: total > GRAVEL_MU ? 'danger' : 'ok' },
      ],
      frames,
    }
  },
  takeaway: 'On loose surfaces, do your slowing beforehand on good tarmac, then cross smoothly — no braking, gentle steady throttle, eyes on where you want to go.',
}

// ─── 13. Night riding ────────────────────────────────────────────────────────
const TRACTOR = 100
const LOW_BEAM = 40
const HIGH_BEAM = 100
export const nightRiding: Scenario = {
  id: 'night-riding',
  number: 13,
  title: 'Night riding',
  summary: 'An unlit road, low beam, an oncoming car.',
  situation: `You are riding at night on an unlit country road at 70 km/h. Your low beam lights the road about ${LOW_BEAM} m ahead; high beam reaches about ${HIGH_BEAM} m. A car is approaching in the other lane. Somewhere ahead, a broken-down tractor with no lights sits in your lane.`,
  question: 'How do you ride?',
  scene: straightRoad({ weather: 'night', beam: LOW_BEAM }),
  choices: [
    { id: 'low70', label: 'Keep 70 km/h on low beam' },
    { id: 'high70', label: 'Keep 70 km/h with high beam on' },
    { id: 'slow50', label: 'Slow to 50 km/h on low beam' },
  ],
  intro: [],
  run(choice) {
    const kmhV = choice === 'slow50' ? 50 : 70
    const beam = choice === 'high70' ? HIGH_BEAM : LOW_BEAM
    const tractor = (): Actor => ({ id: 'tractor', kind: 'tractor', x: MY_LANE, y: TRACTOR + 4, heading: 0, unlit: true })
    const car = (t: number): Actor => ({ id: 'car', kind: 'car', x: ONCOMING_LANE, y: 150 - ms(60) * t, heading: 180 })
    let seen: number | null = null
    let impact: number | null = null
    const r = ride({ state: riding(kmhV, kmhV > 60 ? 4 : 3), inputs: { ...base, gear: kmhV > 60 ? 4 : 3, throttle: 0.3 } }, (t, s) => {
      if (seen === null && TRACTOR - s.distance <= beam) seen = t
      if (impact === null && s.distance >= TRACTOR) impact = t
      if (impact !== null || (seen !== null && s.speed < 0.01)) return 'end'
      return seen === null || t < seen + REACTION ? {} : goodBraking(t - seen - REACTION)
    })
    const end = r[r.length - 1]
    const vHit = impact !== null ? end.s.speed : 0
    // Distance needed to stop from the moment the tractor is seen, as if nothing were in the way.
    const atSeen = r.find((x) => x.t >= (seen ?? 0)) ?? r[0]
    const free = ride({ state: { ...atSeen.s, distance: 0 }, inputs: atSeen.inputs }, (t, s) => (t > REACTION && s.speed < 0.01 ? 'end' : t < REACTION ? {} : goodBraking(t - REACTION)))
    const stopDist = free[free.length - 1].s.distance
    const frames = framesFromRide(r, { actors: (t) => [tractor(), car(t)] }).map((f) => ({ ...f, beam }))
    const dazzle = choice === 'high70'
    const verdict = impact !== null ? 'crash' : dazzle ? 'risky' : 'safe'
    return {
      verdict,
      rider: dazzle ? 'Switches to high beam and keeps 70 km/h.' : `Rides at ${kmhV} km/h on low beam.`,
      motorcycle: `The tractor appears in the headlight at ${beam} m. After a ${REACTION} s reaction and hard braking, the motorcycle needs ${fmt(stopDist)} m to stop${impact !== null ? ` — it hits the tractor at ${Math.round(kmh(vHit))} km/h` : ` and stops ${fmt(TRACTOR - end.s.distance)} m short`}.`,
      explanation: impact !== null
        ? `At 70 km/h you need about ${Math.round(stopDist)} m to stop, but low beam shows only ${LOW_BEAM} m. You are “out-riding your headlight”: by the time you can see a hazard, it is too late to stop for it.`
        : dazzle
          ? 'High beam shows the tractor in time — but it also dazzles the oncoming driver, who may drift towards you or fail to see you at all.'
          : `At 50 km/h the motorcycle stops in about ${Math.round(stopDist)} m, within the ${LOW_BEAM} m the headlight shows. Ride at a speed that lets you stop within the distance you can see.`,
      consequence: verdict === 'crash' ? `Crash into the unlit tractor at ${Math.round(kmh(vHit))} km/h.` : verdict === 'risky' ? 'Risky: you stop in time, but the dazzled oncoming driver is a hazard to you and others. Dip the beam for oncoming traffic.' : 'Safe: stopped in time without dazzling anyone.',
      metrics: [
        { label: 'Can see', value: `${beam} m` },
        { label: 'Needs to stop', value: `${fmt(stopDist)} m`, tone: stopDist > beam ? 'danger' : 'ok' },
        { label: impact !== null ? 'Impact speed' : 'Stopped short by', value: impact !== null ? `${Math.round(kmh(vHit))} km/h` : `${fmt(TRACTOR - end.s.distance)} m`, tone: impact !== null ? 'danger' : 'ok' },
      ],
      frames: impact !== null ? [...frames, ...slideFrames(frames[frames.length - 1], 8, (t) => [tractor(), car(t)], 0.8).map((f) => ({ ...f, beam }))] : hold(frames, 1, (t) => [tractor(), car(t)]).map((f) => ({ ...f, beam })),
    }
  },
  takeaway: 'At night, ride at a speed that lets you stop within the distance your headlight shows — and dip your beam for oncoming traffic.',
}

// ─── 14. Riding with a pillion ───────────────────────────────────────────────
const P_LINE = 40
const USUAL = 15
const EARLY = 22
const PASSENGER = 70
export const pillion: Scenario = {
  id: 'pillion',
  number: 14,
  title: 'Riding with a pillion',
  summary: 'A passenger on the back, a red light ahead.',
  situation: `You are carrying a ${PASSENGER} kg passenger for the first time, riding at 40 km/h towards a red light. Riding alone, you would start braking about ${USUAL} m before the line with a normal squeeze.`,
  question: 'How do you stop?',
  scene: straightRoad({ features: [{ type: 'stopLine', y: P_LINE, x0: -LANE, x1: 0 }, { type: 'crossRoad', y: P_LINE + 2 + LANE, width: LANE * 2 }, { type: 'signal', y: P_LINE, x: -LANE - 1 }] }),
  choices: [
    { id: 'usual', label: `Brake at the usual point, ${USUAL} m before the line, with the usual effort` },
    { id: 'harder', label: 'Brake at the usual point, but squeeze much harder' },
    { id: 'early', label: `Brake earlier (${EARLY} m before) and progressively` },
  ],
  intro: [],
  run(choice) {
    const startAt = P_LINE - (choice === 'early' ? EARLY : USUAL)
    const [F, R] = choice === 'harder' ? [0.8, 0.2] : [0.35, 0.1]
    let started: number | null = null
    let peak = 0
    let felt = 0
    let lock: string | null = null
    const r = ride({ state: riding(40, 2), inputs: { ...base, gear: 2, throttle: 0.15, extraMass: PASSENGER } }, (t, s) => {
      if (started === null && s.distance >= startAt) started = t
      if (started === null) return {}
      felt += (-s.acceleration - felt) * 0.1
      peak = Math.max(peak, felt)
      if (s.brakes.front.locked) lock ??= 'front'
      if (s.brakes.rear.locked) lock ??= 'rear'
      if (s.speed < 0.01) return t > started + 4 ? 'end' : { clutch: 1 }
      const e = t - started
      return { throttle: 0, clutch: s.speed < 4 ? 1 : 0, front: Math.min(F, e * 1.2), rear: R }
    })
    const end = r[r.length - 1]
    const over = end.s.distance - P_LINE
    const stopIn = end.s.distance - startAt
    const frames = framesFromRide(r, { pose: () => ({ pillion: true }) }).map((f) => ({ ...f, signal: 'red' as const }))
    const verdict = lock ? 'crash' : over > 0 ? 'risky' : peak > 0.55 * G ? 'risky' : 'safe'
    return {
      verdict,
      rider: choice === 'early' ? `Starts braking ${EARLY} m before the line, squeezing gently and then firmly, and warns the passenger with a smooth, early stop.` : choice === 'harder' ? 'Leaves braking to the usual point, then grabs the brakes hard.' : 'Brakes at the usual point with the usual squeeze.',
      motorcycle: `With ${PASSENGER} kg more on board the same brakes have ${Math.round(PASSENGER / 225 * 100)} % more mass to stop. The motorcycle needs ${fmt(stopIn)} m and ${over > 0 ? `stops ${fmt(over)} m past the line` : `stops ${fmt(-over)} m before the line`}, with a peak deceleration of ${fmt(peak / G, 2)} g.${speedAt(r, P_LINE) > 0 ? ` It crosses the line at ${Math.round(kmh(speedAt(r, P_LINE)))} km/h.` : ''}`,
      explanation:
        choice === 'early'
          ? 'Extra mass means longer stopping distances for the same squeeze. Braking earlier and progressively gives the distance back — and a smooth stop keeps the passenger from sliding into you.'
          : choice === 'harder'
            ? 'The motorcycle can stop in time, but a sudden hard stop throws the passenger forward into your back, pushing you onto the tank and the handlebar — just when you need a light, precise touch on the controls.'
            : 'The brakes are as strong as ever, but there is a third more mass to stop: the usual squeeze at the usual point is no longer enough.',
      consequence: verdict === 'crash' ? 'Crash: a wheel locks.' : over > 0 ? `Risky: the motorcycle stops ${fmt(over)} m into the junction, on red.` : verdict === 'risky' ? 'Risky: you stop, but the passenger slams into you — loss of control is a real danger.' : 'Safe: a smooth, controlled stop before the line.',
      metrics: [
        { label: 'Stopping distance', value: `${fmt(stopIn)} m` },
        { label: 'Position at stop', value: over > 0 ? `${fmt(over)} m over the line` : `${fmt(-over)} m before the line`, tone: over > 0 ? 'danger' : 'ok' },
        { label: 'Peak deceleration', value: `${fmt(peak / G, 2)} g`, tone: peak > 0.55 * G ? 'caution' : 'ink' },
      ],
      frames: hold(frames, 1).map((f) => ({ ...f, signal: 'red' as const })),
    }
  },
  takeaway: 'With a passenger, brake earlier and more gently, leave bigger gaps, and agree beforehand that they sit still and lean with you.',
}
