import { buildPath, timeline, type PathSample, type TimedSample } from '@/components/handling/path'
import { G, GRIP } from '@/lib/mechanics/braking'
import { gripLean, lateralG, leanFor } from '@/lib/mechanics/cornering'
import { MASS } from '@/lib/mechanics/powertrain'
import { fmt, goodBraking, kmh, ms, REACTION, ride, riding, swerve } from '@/lib/scenarios/sim'
import type { Actor, Frame, Scenario, TopScene } from '@/lib/scenarios/types'
import { LANE, MY_LANE, ONCOMING_LANE, framesFromRide, hold, slideFrames, speedAt, straightRoad } from './helpers'

const base = { gear: 3, clutch: 0, throttle: 0, brake: 0, grade: 0, front: 0, rear: 0 }
const wetIn = { ...base, grip: GRIP.wet }
const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))
const personAt = (y: number, x = MY_LANE): Actor => ({ id: 'person', kind: 'person', x, y, heading: 90 })
const toFrames = (samples: TimedSample[], actors: (t: number) => Actor[] = () => []): Frame[] =>
  samples.map((p) => ({ t: p.t, bike: { x: p.x, y: p.y, heading: p.heading, lean: p.lean, v: p.v }, actors: actors(p.t) }))

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

const bendScene = (radius: number, approach: number, extra: Partial<TopScene> = {}): TopScene => ({
  view: 'top',
  road: bend(radius, approach).road,
  edges: [-LANE, LANE],
  dividers: [{ offset: 0, style: 'dashed' }],
  span: 28,
  ...extra,
})

function bendRun(lane: PathSample[], speed: (p: PathSample) => number, overloaded: (p: TimedSample) => boolean, slideDecel: number) {
  const samples = timeline(lane, speed)
  const at = samples.findIndex(overloaded)
  if (at < 0) return { frames: toFrames(samples), slid: null as TimedSample | null }
  const frames = toFrames(samples.slice(0, at + 1))
  return { frames: [...frames, ...slideFrames(frames[frames.length - 1], slideDecel)], slid: samples[at] }
}

function carDecel(gap0: number, v0: number, brakeAt: number, decel: number) {
  const stopT = v0 / decel
  const pos = (t: number) => {
    const e = Math.max(0, t - brakeAt)
    const d = e < stopT ? v0 * e - 0.5 * decel * e * e : (v0 * v0) / (2 * decel)
    return gap0 + 2 + v0 * Math.min(t, brakeAt) + d
  }
  const v = (t: number) => Math.max(0, v0 - decel * Math.max(0, t - brakeAt))
  return { pos, v }
}

function followCar(gap0: number, v0: number, brakeAt: number, decel: number, x = MY_LANE) {
  const c = carDecel(gap0, v0, brakeAt, decel)
  return (t: number): Actor => ({ id: 'car', kind: 'car', x, y: c.pos(t) + 4.2, heading: 0, braking: t >= brakeAt })
}

// ─── 15. Pedestrian ahead ────────────────────────────────────────────────────
const CROSS = 70
export const pedestrianAhead: Scenario = {
  id: 'pedestrian-ahead',
  number: 15,
  title: 'A person on the crossing',
  summary: 'Someone is already on a crossing, well ahead, in daylight.',
  situation: `You are riding at 50 km/h on a dry straight. A person is on the crossing, ${CROSS} m ahead, still in your wheel track. There is room to stop comfortably, and the other lane is empty.`,
  question: 'How do you adjust?',
  scene: straightRoad({ features: [{ type: 'stopLine', y: CROSS, x0: -LANE, x1: 0 }, { type: 'sign', x: -LANE - 1.6, y: CROSS, text: 'Crossing' }] }),
  choices: [
    { id: 'ease', label: 'Close the throttle and brake progressively, ready to stop' },
    { id: 'hold', label: 'Hold 50 km/h — they will be gone by the time you get there' },
    { id: 'swerve', label: 'Keep speed and swerve around them at the last moment' },
  ],
  intro: [],
  run(choice) {
    const walker = (): Actor => personAt(CROSS)
    if (choice === 'hold') {
      const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.3 } }, (_t, s) => (s.distance > CROSS + 8 ? 'end' : undefined))
      const vHit = speedAt(r, CROSS)
      const frames = framesFromRide(r, { actors: () => [walker()] })
      return {
        verdict: 'crash',
        rider: 'Holds 50 km/h and rides on, assuming the crossing will be empty.',
        motorcycle: `At 50 km/h the crossing is ${fmt(CROSS / ms(50), 1)} s away. The person is still in the wheel track: the motorcycle reaches them at ${Math.round(kmh(vHit))} km/h.`,
        explanation: 'A person on a crossing is not a gap to thread. They can freeze, turn back or step the other way. Speed you still have is speed you will hit them with.',
        consequence: `Crash: hitting a person at ${Math.round(kmh(vHit))} km/h.`,
        metrics: [
          { label: 'Speed at the crossing', value: `${Math.round(kmh(vHit))} km/h`, tone: 'danger' },
          { label: 'Time to the crossing', value: `${fmt(CROSS / ms(50), 1)} s` },
        ],
        frames: [...frames.filter((f) => f.bike.y <= CROSS), ...slideFrames(frames.find((f) => f.bike.y >= CROSS) ?? frames[frames.length - 1], 7, () => [walker()], 0.8)],
      }
    }
    if (choice === 'swerve') {
      const v = ms(50)
      const sw = swerve(v, { startAt: (CROSS - 10) / v, lean: 28, hold: 0.35, side: 1, urgency: 7 }, 6)
      const at = sw.find((q) => q.y >= CROSS)!
      const maxLean = Math.max(...sw.map((q) => Math.abs(q.lean)))
      const frames: Frame[] = sw.map((q) => ({ t: q.t, bike: { x: MY_LANE + q.x, y: q.y, heading: q.heading, lean: q.lean, v }, actors: [walker()] }))
      return {
        verdict: 'risky',
        rider: 'Keeps 50 km/h and shoves the bar at the last 10 m to go round the person.',
        motorcycle: `A late countersteer leans the motorcycle ${Math.round(maxLean)}° and has only moved ${fmt(at.x)} m sideways by the crossing. The person is still in the lane, and the motorcycle is now pointed at the centre line.`,
        explanation: 'A last-moment swerve around a person uses up the space you needed to stop, and sends you toward whatever is in the other lane. Seen this early, the crossing only needed a smooth slow-down.',
        consequence: 'Risky: you may miss them this time, leaned over and off line, with no idea what they will do next.',
        metrics: [
          { label: 'Peak lean', value: `${Math.round(maxLean)}°`, tone: 'caution' },
          { label: 'Sideways at the crossing', value: `${fmt(at.x)} m` },
        ],
        frames,
      }
    }
    const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.3 } }, (t, s) => (t > REACTION && s.speed < 0.01 ? 'end' : t < REACTION ? { throttle: 0 } : goodBraking(t - REACTION)))
    const stop = r[r.length - 1].s.distance
    return {
      verdict: 'safe',
      rider: 'Closes the throttle, covers the brakes, then squeezes progressively and is ready to stop before the crossing.',
      motorcycle: `Stops ${fmt(CROSS - stop)} m short of the person. No wheel locks.`,
      explanation: 'Seen well ahead, a person on a crossing is a speed problem, not a swerve. Rolling off and braking early leaves you upright, in your lane, and able to wait if they freeze.',
      consequence: `Safe: stopped with ${fmt(CROSS - stop)} m to spare.`,
      metrics: [
        { label: 'Stopped short by', value: `${fmt(CROSS - stop)} m`, tone: 'ok' },
        { label: 'Speed at the crossing', value: '0 km/h', tone: 'ok' },
      ],
      frames: hold(framesFromRide(r, { actors: () => [walker()] }), 1, () => [walker()]),
    }
  },
  takeaway: 'A person on a crossing, seen early, is a reason to lose speed in a straight line — not to hold it or swerve late.',
}

// ─── 16. Pedestrian, wet, someone behind ─────────────────────────────────────
const STEP = 48
const TAIL = 8
export const pedestrianWetBehind: Scenario = {
  id: 'pedestrian-wet-behind',
  number: 16,
  title: 'They step out — wet, traffic behind',
  summary: 'A person steps out on a wet road; a car is close behind; the other lane is busy.',
  situation: `It is raining. You are at 50 km/h. A person steps from the kerb ${STEP} m ahead. A car is about ${TAIL} m behind you. An oncoming car occupies the other lane.`,
  question: 'What do you protect first?',
  scene: straightRoad({ weather: 'rain' }),
  choices: [
    { id: 'brake', label: 'Brake as hard as the wet road allows, in a straight line' },
    { id: 'swerve', label: 'Swerve around them into the other lane' },
    { id: 'grab', label: 'Grab the front brake fully to stop in the shortest distance' },
  ],
  intro: [],
  run(choice) {
    const walker = (): Actor => personAt(STEP)
    const oncoming = (t: number): Actor => ({ id: 'oncoming', kind: 'car', x: ONCOMING_LANE, y: 90 - ms(50) * t, heading: 180 })
    const behind = (_t: number, bike: { y: number }): Actor => ({ id: 'tail', kind: 'car', x: MY_LANE, y: bike.y - TAIL, heading: 0 })
    const actors = (t: number, bike: { y: number }): Actor[] => [walker(), oncoming(t), behind(t, bike)]
    if (choice === 'swerve') {
      const v = ms(50)
      const sw = swerve(v, { startAt: REACTION, lean: 30, hold: 0.5, side: 1, urgency: 7 }, 4.5)
      const hitOncoming = sw.find((q) => q.y >= oncoming(q.t).y - 4 && MY_LANE + q.x > 0)
      const cut = hitOncoming ?? sw[sw.length - 1]
      const frames: Frame[] = sw.filter((q) => q.t <= cut.t).map((q) => ({ t: q.t, bike: { x: MY_LANE + q.x, y: q.y, heading: q.heading, lean: q.lean, v }, actors: actors(q.t, { y: q.y }) }))
      return {
        verdict: 'crash',
        rider: 'Presses the right bar to go round the person, into the other lane.',
        motorcycle: 'The other lane is not empty. The motorcycle is leaned toward an oncoming car that has nowhere to go.',
        explanation: 'A swerve needs a lane that is actually empty. Wet grip and a person in your path do not create one. The rider behind you is a problem to manage after you have stayed in your own lane.',
        consequence: 'Crash: head-on into the oncoming car.',
        metrics: [{ label: 'Other lane', value: 'Occupied', tone: 'danger' }],
        frames: [...frames, ...slideFrames(frames[frames.length - 1], 0.5 * G, (t) => actors(t, frames[frames.length - 1].bike), 1.2)],
      }
    }
    let lockAt: number | null = null
    let impact: number | null = null
    const grab = choice === 'grab'
    const r = ride({ state: riding(50, 3), inputs: { ...wetIn, throttle: 0.3 } }, (t, s) => {
      if (!lockAt && (s.brakes.front.locked || s.brakes.rear.locked)) lockAt = t
      if (impact === null && s.distance >= STEP) impact = t
      if (impact !== null || (t > REACTION && s.speed < 0.01) || (grab && lockAt && t > lockAt + 0.25)) return 'end'
      if (t < REACTION) return {}
      return grab ? { throttle: 0, clutch: 1, front: 1, grip: GRIP.wet } : { ...goodBraking(t - REACTION), grip: GRIP.wet }
    })
    const frames = framesFromRide(r, { actors })
    if (grab) {
      const fall = slideFrames({ ...frames[frames.length - 1], bike: { ...frames[frames.length - 1].bike, lean: -1 } }, 0.4 * G, (t) => actors(t, frames[frames.length - 1].bike), 1.6)
      return {
        verdict: 'crash',
        rider: 'Grabs the front brake fully on the wet road.',
        motorcycle: `The front locks ${fmt((lockAt ?? REACTION) - REACTION, 2)} s after the grab — wet grip is about half of dry, so the tyre lets go even sooner.`,
        explanation: 'A grabbed front on a wet road is a fall. The person, the car behind and the oncoming traffic are then problems you cannot steer around.',
        consequence: 'Crash: a front-wheel lock and a fall on the wet road.',
        metrics: [
          { label: 'Front wheel', value: 'Locked', tone: 'danger' },
          { label: 'Surface', value: 'Wet (μ ≈ 0.5)' },
        ],
        frames: [...frames, ...fall],
      }
    }
    const vHit = impact !== null ? r[r.length - 1].s.speed : 0
    const left = STEP - r[r.length - 1].s.distance
    const ok = impact === null
    return {
      verdict: ok ? 'safe' : 'crash',
      rider: 'Stays in the lane, rolls off and brakes as hard as the wet tyres will take, progressively.',
      motorcycle: ok
        ? `No lock. The motorcycle stops ${fmt(left)} m short of the person. The brake light is on for the car behind.`
        : `The wet road and the reaction second use up the ${STEP} m: the motorcycle reaches the person at ${Math.round(kmh(vHit))} km/h.`,
      explanation: ok
        ? 'The first job is to stay upright and in your lane. A progressive wet stop protects you and the person, and gives the rider behind a brake light they can see. You cannot invent an empty lane.'
        : 'At 50 km/h on a wet road there is little spare. Speed you already had is the only margin — and a swerve into a busy lane is worse.',
      consequence: ok ? `Safe: stopped with ${fmt(left)} m to spare, still in your lane. The car behind had a chance to see the light.` : `Crash: hitting the person at ${Math.round(kmh(vHit))} km/h.`,
      metrics: [
        { label: ok ? 'Stopped short by' : 'Impact speed', value: ok ? `${fmt(left)} m` : `${Math.round(kmh(vHit))} km/h`, tone: ok ? 'caution' : 'danger' },
        { label: 'Car behind', value: `${TAIL} m`, tone: 'caution' },
      ],
      frames: ok ? hold(frames, 1, (t) => actors(t, frames[frames.length - 1].bike)) : [...frames, ...slideFrames(frames[frames.length - 1], 6, (t) => actors(t, frames[frames.length - 1].bike), 0.8)],
    }
  },
  takeaway: 'On a wet road with traffic both sides, stay in your lane and brake progressively. A swerve into a busy lane, or a grabbed front, makes three problems into a crash.',
}

// ─── 17. Following with room ─────────────────────────────────────────────────
const ROOM_V = ms(50)
const ROOM_GAP = 3 * ROOM_V
export const followingWithRoom: Scenario = {
  id: 'following-with-room',
  number: 17,
  title: 'The car ahead slows',
  summary: 'Daylight, dry, a real gap — the car ahead starts to slow.',
  situation: `You are following a car at 50 km/h with about three seconds (${Math.round(ROOM_GAP)} m) of space. Without drama, it slows. The road is dry and straight.`,
  question: 'How do you match it?',
  scene: straightRoad(),
  choices: [
    { id: 'match', label: 'Roll off, then a light progressive brake to match its slowing' },
    { id: 'grab', label: 'Grab the front brake so you do not get any closer' },
    { id: 'sit', label: 'Hold the throttle and sit at the same speed' },
  ],
  intro: [],
  run(choice) {
    const BRAKE_AT = 0.8
    const decel = 0.28 * G
    const car = followCar(ROOM_GAP, ROOM_V, BRAKE_AT, decel)
    const c = carDecel(ROOM_GAP, ROOM_V, BRAKE_AT, decel)
    let lockAt: number | null = null
    let contact: number | null = null
    const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.28 } }, (t, s) => {
      if (!lockAt && s.brakes.front.locked) lockAt = t
      if (contact === null && s.distance >= c.pos(t)) contact = t
      if (contact !== null || (lockAt && t > lockAt + 0.3) || t > 8) return 'end'
      if (choice === 'sit') return t > 6 ? 'end' : {}
      if (t < BRAKE_AT + REACTION) return {}
      const e = t - BRAKE_AT - REACTION
      return choice === 'grab' ? { throttle: 0, clutch: 1, front: 1 } : { throttle: 0, clutch: s.speed < 4 ? 1 : 0, rear: 0.08, front: Math.min(0.28, e * 0.4) }
    })
    const frames = framesFromRide(r, { actors: (t) => [car(t)] })
    const end = r[r.length - 1]
    const gap = c.pos(end.t) - end.s.distance
    if (choice === 'grab') {
      const fall = slideFrames({ ...frames[frames.length - 1], bike: { ...frames[frames.length - 1].bike, lean: -1 } }, 0.6 * G, (t) => [car(t)], 1.5)
      return {
        verdict: 'crash',
        rider: 'Grabs the front brake as soon as the car’s lights come on.',
        motorcycle: `The front locks ${fmt((lockAt ?? REACTION) - REACTION, 2)} s after the grab. You had ${Math.round(ROOM_GAP)} m — far more than a gentle match needed.`,
        explanation: 'A three-second gap is there so you can slow smoothly. Grabbing turns a routine slowing into a lock and a fall.',
        consequence: 'Crash: a front-wheel lock. The car ahead was never an emergency.',
        metrics: [
          { label: 'Front wheel', value: 'Locked', tone: 'danger' },
          { label: 'Gap you had', value: `${Math.round(ROOM_GAP)} m` },
        ],
        frames: [...frames, ...fall],
      }
    }
    if (choice === 'sit') {
      return {
        verdict: contact !== null ? 'crash' : 'risky',
        rider: 'Holds the throttle and the same 50 km/h while the car slows.',
        motorcycle: contact !== null ? `The gap disappears. The motorcycle reaches the car at ${Math.round(kmh(end.s.speed - c.v(end.t)))} km/h.` : `Closes to ${fmt(gap)} m — well under a second.`,
        explanation: 'Matching a slowing car is rolling off and, if needed, a light brake. Sitting at the old speed spends the gap you had built.',
        consequence: contact !== null ? 'Crash: rear-end into the car ahead.' : 'Risky: now you have no room if they stop harder.',
        metrics: [
          { label: 'Gap left', value: contact !== null ? 'Hit it' : `${fmt(gap)} m`, tone: 'danger' },
        ],
        frames: contact !== null ? [...frames, ...slideFrames(frames[frames.length - 1], 8, (t) => [car(t)], 0.8)] : hold(frames, 0.6, (t) => [car(t)]),
      }
    }
    return {
      verdict: 'safe',
      rider: 'Rolls off, then squeezes both brakes lightly until the speeds match.',
      motorcycle: `No lock. The gap never closes below ${fmt(Math.min(...r.map((x) => c.pos(x.t) - x.s.distance)))} m.`,
      explanation: 'With a real gap, matching a slowing car is ordinary braking — smooth, upright, eyes on their lights. Save the emergency squeeze for an emergency.',
      consequence: 'Safe: still about two seconds behind as they settle to the new speed.',
      metrics: [
        { label: 'Closest gap', value: `${fmt(Math.min(...r.map((x) => c.pos(x.t) - x.s.distance)))} m`, tone: 'ok' },
        { label: 'Wheels', value: 'Rolling', tone: 'ok' },
      ],
      frames: hold(frames, 1, (t) => [car(t)]),
    }
  },
  takeaway: 'A three-second gap lets you match a slowing car with a light, progressive brake. Grabbing, or sitting at the old speed, wastes the room you had.',
}

// ─── 18. One second, in the rain ─────────────────────────────────────────────
const WET_FOLLOW_V = ms(50)
export const followingOneSecondWet: Scenario = {
  id: 'following-one-second-wet',
  number: 18,
  title: 'One second behind, in the rain',
  summary: 'You have drifted to about a second; it is wet; they ABS-stop.',
  situation: `It is raining. You are at 50 km/h and have drifted to about one second (${Math.round(WET_FOLLOW_V)} m) behind a car. It brakes as hard as a car with ABS can on a wet road (about 0.7 g).`,
  question: 'What should already have been true?',
  scene: straightRoad({ weather: 'rain' }),
  choices: [
    { id: 'one', label: 'Stay at one second and brake as hard as the wet tyres allow' },
    { id: 'grab', label: 'Grab the front brake fully' },
    { id: 'two', label: 'You had already opened more than two seconds before they braked' },
  ],
  intro: [],
  run(choice) {
    const BRAKE_AT = 0.4
    const decel = 0.7 * G
    const gap0 = (choice === 'two' ? 3 : 1) * WET_FOLLOW_V
    const car = followCar(gap0, WET_FOLLOW_V, BRAKE_AT, decel)
    const c = carDecel(gap0, WET_FOLLOW_V, BRAKE_AT, decel)
    let lockAt: number | null = null
    let contact: { t: number; rel: number } | null = null
    const grab = choice === 'grab'
    const r = ride({ state: riding(50, 3), inputs: { ...wetIn, throttle: 0.28 } }, (t, s) => {
      if (!lockAt && s.brakes.front.locked) lockAt = t
      if (!contact && s.distance >= c.pos(t)) contact = { t, rel: s.speed - c.v(t) }
      if (contact || (grab && lockAt && t > lockAt + 0.25) || (t > BRAKE_AT + REACTION && s.speed < 0.01 && t > 4)) return 'end'
      if (t < BRAKE_AT + REACTION) return { grip: GRIP.wet }
      const e = t - BRAKE_AT - REACTION
      return grab ? { throttle: 0, clutch: 1, front: 1, grip: GRIP.wet } : { ...goodBraking(e), grip: GRIP.wet, front: Math.min(0.38, (e / 0.5) * 0.38) }
    })
    const frames = framesFromRide(r, { actors: (t) => [car(t)] })
    const end = r[r.length - 1]
    const left = c.pos(end.t) - end.s.distance
    if (grab) {
      const fall = slideFrames({ ...frames[frames.length - 1], bike: { ...frames[frames.length - 1].bike, lean: -1 } }, 0.4 * G, (t) => [car(t)], 1.4)
      return {
        verdict: 'crash',
        rider: 'Grabs the front brake on the wet road.',
        motorcycle: 'The front locks before the load has moved onto the tyre. Wet grip is already half of dry.',
        explanation: 'ABS on the car ahead does not put ABS on your motorcycle. A grabbed front on a wet road is a fall — and you still had only a second.',
        consequence: 'Crash: front-wheel lock and a fall, still closing on the car.',
        metrics: [{ label: 'Front wheel', value: 'Locked', tone: 'danger' }],
        frames: [...frames, ...fall],
      }
    }
    const hit = contact as { t: number; rel: number } | null
    if (choice === 'one') {
      return {
        verdict: hit ? 'crash' : 'risky',
        rider: 'Was already at one second. Reacts in a second and brakes as hard as the wet road allows.',
        motorcycle: hit
          ? `The reaction second uses the whole gap while the car is already slowing. The motorcycle hits it at ${Math.round(kmh(hit.rel))} km/h.`
          : `Stops ${fmt(left)} m short — with nothing left if the reaction had been slower.`,
        explanation: 'A one-second gap is used up by reaction time alone. On a wet road the car with ABS also out-brakes you. The gap you needed had to exist before the lights came on.',
        consequence: hit ? `Crash: rear-end at ${Math.round(kmh(hit.rel))} km/h.` : 'Risky: you make it only because the model’s reaction is a tidy one second.',
        metrics: [
          { label: 'Gap', value: `${Math.round(gap0)} m`, tone: 'danger' },
          { label: hit ? 'Impact speed' : 'Left', value: hit ? `${Math.round(kmh(hit.rel))} km/h` : `${fmt(left)} m`, tone: hit ? 'danger' : 'caution' },
        ],
        frames: hit ? [...frames, ...slideFrames(frames[frames.length - 1], 8, (t) => [car(t)], 0.8)] : hold(frames, 1, (t) => [car(t)]),
      }
    }
    return {
      verdict: hit ? 'crash' : 'safe',
      rider: 'Had already opened three seconds before the car braked, then uses a progressive wet squeeze.',
      motorcycle: hit ? `Still not enough: impact at ${Math.round(kmh(hit.rel))} km/h.` : `Stops ${fmt(left)} m behind the car. No wheel locks.`,
      explanation: 'Two seconds in the wet is the minimum that covers reaction and the extra distance a car with ABS can stop in. That gap is a decision you make continuously — not a trick you invent after the lights come on.',
      consequence: hit ? 'Crash.' : `Safe: the two-second gap did the job, with ${fmt(left)} m to spare.`,
      metrics: [
        { label: 'Gap', value: `${Math.round(gap0)} m`, tone: 'ok' },
        { label: 'Stopped short by', value: `${fmt(left)} m`, tone: hit ? 'danger' : 'ok' },
      ],
      frames: hit ? [...frames, ...slideFrames(frames[frames.length - 1], 8, (t) => [car(t)], 0.8)] : hold(frames, 1, (t) => [car(t)]),
    }
  },
  takeaway: 'In the wet, two seconds behind is the gap you need before anyone brakes. One second, then a perfect squeeze, is already too late.',
}

// ─── 19. Pothole, seen late ──────────────────────────────────────────────────
const LATE_HOLE = { x: MY_LANE, y: 16, r: 0.45 }
export const potholeLate: Scenario = {
  id: 'pothole-late',
  number: 19,
  title: 'A pothole, seen late',
  summary: 'The hole is close. Braking on it would compress the fork.',
  situation: `Riding at 40 km/h, you see a deep pothole only ${LATE_HOLE.y} m ahead, in your wheel track. There is no room to go round it. Oncoming traffic is in the other lane.`,
  question: 'What must be finished before the wheel drops in?',
  scene: straightRoad({ features: [{ type: 'pothole', ...LATE_HOLE }] }),
  choices: [
    { id: 'off', label: 'Get off the brakes (if any), stay upright, and roll over it' },
    { id: 'on', label: 'Brake hard as you reach it, to hit it slower' },
    { id: 'swerve', label: 'Swerve around it at the last moment' },
  ],
  intro: [],
  run(choice) {
    const car = (t: number): Actor => ({ id: 'car', kind: 'car', x: ONCOMING_LANE, y: 80 - ms(50) * t, heading: 180 })
    const v = ms(40)
    if (choice === 'on') {
      const r = ride({ state: riding(40, 3), inputs: { ...base, throttle: 0.22 } }, (t, s) => (s.distance > LATE_HOLE.y + 4 || (s.speed < 0.01 && t > 1) ? 'end' : t < 0.2 ? {} : { clutch: 1, throttle: 0, rear: 0.12, front: 0.55 }))
      const at = r.find((x) => x.s.distance >= LATE_HOLE.y - LATE_HOLE.r)
      const vHit = at ? at.s.speed : 0
      const frames = framesFromRide(r, { actors: (t) => [car(t)] })
      return {
        verdict: 'risky',
        rider: 'Squeezes the front hard and is still braking as the front wheel drops in.',
        motorcycle: `The hole is ${LATE_HOLE.y} m away — not enough to stop from 40 km/h. The wheel hits it at ${Math.round(kmh(vHit))} km/h with the fork already compressed.`,
        explanation: 'Braking uses the fork travel the hole needs. Hitting a pothole on the brakes is harsher than hitting it rolling, and 16 m is too short to finish a stop.',
        consequence: 'Risky: a bent rim or a snatched bar is likely. Finish any slowing before the hole, then roll.',
        metrics: [
          { label: 'Speed into the hole', value: `${Math.round(kmh(vHit))} km/h`, tone: 'danger' },
          { label: 'Fork', value: 'Compressed by braking', tone: 'caution' },
        ],
        frames: hold(frames, 0.6),
      }
    }
    if (choice === 'swerve') {
      const sw = swerve(v, { startAt: 0.25, lean: 28, hold: 0.35, side: 1, urgency: 7 }, 3.5)
      const at = sw.find((q) => q.y >= LATE_HOLE.y)!
      const clearance = at.x - (LATE_HOLE.r + 0.06)
      const maxLean = Math.max(...sw.map((q) => Math.abs(q.lean)))
      const frames: Frame[] = sw.map((q) => ({ t: q.t, bike: { x: MY_LANE + q.x, y: q.y, heading: q.heading, lean: q.lean, v }, actors: [car(q.t)] }))
      return {
        verdict: 'risky',
        rider: 'Shoves the bar to go round the hole with almost no run-up.',
        motorcycle: `Even a hard countersteer (up to ${Math.round(maxLean)}°) has only moved ${fmt(Math.max(0, at.x))} m when the front wheel reaches the hole${clearance < 0 ? ' — and it still hits the edge, leaned over, toward the oncoming car' : ''}.`,
        explanation: 'A motorcycle has to lean before it can change line, and that takes distance. A last-moment swerve hits the hole anyway — leaned — and throws you at the centre line.',
        consequence: 'Risky: hitting a hole leaned over can tuck the front toward oncoming traffic.',
        metrics: [
          { label: 'Clearance', value: clearance < 0 ? 'Hit it' : `${fmt(clearance)} m`, tone: clearance < 0 ? 'danger' : 'caution' },
          { label: 'Peak lean', value: `${Math.round(maxLean)}°` },
        ],
        frames,
      }
    }
    const r = ride({ state: riding(40, 3), inputs: { ...base, throttle: 0.12 } }, (t, s) => (s.distance > LATE_HOLE.y + 8 ? 'end' : t < 0.15 ? { throttle: 0 } : { throttle: 0.08, front: 0, rear: 0 }))
    const at = r.find((x) => x.s.distance >= LATE_HOLE.y)!
    return {
      verdict: 'safe',
      rider: 'Stays upright, off the brakes, and rolls over the hole with a light, steady throttle.',
      motorcycle: `The front wheel drops in at ${Math.round(kmh(at.s.speed))} km/h with the fork free to use its travel. A short, sharp jolt — then the motorcycle is over it.`,
      explanation: 'When it is too late to go round, the least you can ask of the tyre is: upright, rolling, brakes off. Slowing had to happen before you reached it; here there is no time left, so do not add braking to the hit.',
      consequence: 'Safe: over the hole, still in your lane, still upright.',
      metrics: [
        { label: 'Speed into the hole', value: `${Math.round(kmh(at.s.speed))} km/h` },
        { label: 'Brakes at the hole', value: 'Off', tone: 'ok' },
      ],
      frames: hold(framesFromRide(r, { actors: (t) => [car(t)] }), 0.6, (t) => [car(t)]),
    }
  },
  takeaway: 'If you must go over a pothole, finish braking first. Upright, off the brakes, rolling is the least the fork and tyre can take.',
}

// ─── 20. Pothole, leaned, wet ────────────────────────────────────────────────
const HOLE_R = 32
const HOLE_APPROACH = 28
export const potholeLeanedWet: Scenario = {
  id: 'pothole-leaned-wet',
  number: 20,
  title: 'A hole in a wet bend',
  summary: 'The hole sits in a damp curve; a last-moment swerve heads toward oncoming traffic.',
  situation: `It is damp. Ahead is a right-hand bend of ${HOLE_R} m radius. A pothole sits in your wheel track just as the lean builds. An oncoming car is in the other lane.`,
  question: 'Upright and over, or a line you should have chosen earlier?',
  scene: (() => {
    const { lane } = bend(HOLE_R, HOLE_APPROACH)
    const hole = lane.find((p) => p.tag === 'arc') ?? lane[Math.floor(lane.length / 3)]
    return bendScene(HOLE_R, HOLE_APPROACH, { weather: 'rain', features: [{ type: 'pothole', x: hole.x, y: hole.y, r: 0.45 }] })
  })(),
  choices: [
    { id: 'slow', label: 'Slow on the straight, take the bend gently, roll over the hole more upright' },
    { id: 'hold', label: 'Hold 50 km/h and lean over the hole' },
    { id: 'swerve', label: 'Swerve around it toward the other lane at the last moment' },
  ],
  intro: [],
  run(choice) {
    const { lane } = bend(HOLE_R, HOLE_APPROACH)
    const oncoming = (t: number): Actor => ({ id: 'car', kind: 'car', x: ONCOMING_LANE, y: 70 - ms(45) * t, heading: 180 })
    if (choice === 'swerve') {
      const v = ms(50)
      const sw = swerve(v, { startAt: HOLE_APPROACH / v - 0.3, lean: 32, hold: 0.4, side: 1, urgency: 7 }, 5)
      const frames: Frame[] = sw.map((q) => ({ t: q.t, bike: { x: MY_LANE + q.x, y: q.y, heading: q.heading, lean: q.lean, v }, actors: [oncoming(q.t)] }))
      const hit = sw.find((q) => MY_LANE + q.x > 0.2 && Math.abs(q.y - oncoming(q.t).y) < 6)
      return {
        verdict: 'crash',
        rider: 'Shoves the bar toward the centre line to miss the hole.',
        motorcycle: 'The motorcycle is now leaned into the oncoming lane, on a damp surface, with a car coming the other way.',
        explanation: 'A last-moment swerve around a hole in a bend spends the lane you do not own. The line that missed the hole had to be chosen on the straight, while you were still upright.',
        consequence: 'Crash: into the oncoming car, or a low-side as the wet tyre lets go mid-swerve.',
        metrics: [{ label: 'Other lane', value: 'Occupied', tone: 'danger' }],
        frames: [...(hit ? frames.filter((f) => f.t <= hit.t) : frames), ...slideFrames((hit ? frames.find((f) => f.t >= hit.t) : frames[frames.length - 1]) ?? frames[frames.length - 1], 0.4 * G, (t) => [oncoming(t)], 1.3)],
      }
    }
    const kmhV = choice === 'slow' ? 32 : 50
    const v = ms(kmhV)
    const need = leanFor(v, HOLE_R)
    const use = lateralG(need) / GRIP.wet
    const { frames, slid } = bendRun(lane, () => v, (p) => Math.abs(p.lean) > gripLean(GRIP.wet) * 0.98, 0.35 * G)
    const withCar = frames.map((f) => ({ ...f, actors: [oncoming(f.t)] }))
    const verdict = slid ? 'crash' : use > 0.75 ? 'risky' : 'safe'
    return {
      verdict,
      rider: choice === 'slow' ? 'Brakes gently on the straight, upright, then rides the bend at about 32 km/h and rolls over the hole with little lean.' : 'Enters the damp bend at 50 km/h and is leaned over the hole.',
      motorcycle: `The bend needs ${fmt(need)}° of lean at ${kmhV} km/h — ${Math.round(use * 100)} % of the wet grip.${slid ? ' Past the wet lean limit the tyres give way.' : choice === 'slow' ? ' The hole is taken nearly upright, off the brakes.' : ' The hole is taken at that lean, on a damp patch that has even less grip than the rest of the wet road.'}`,
      explanation: slid
        ? 'Wet grip is already about half of dry. A hole in the wheel track is a second, worse surface. Leaned over it, the front can tuck.'
        : 'Slowing on the straight keeps the lean small, so the hole is just a bump for an upright motorcycle — the same rule as on a straight, with a bend that no longer asks for much grip.',
      consequence: verdict === 'crash' ? 'Crash: a low-side in the wet bend.' : verdict === 'risky' ? 'Risky: you make the lean, with nothing left for the hole.' : 'Safe: slow, more upright, over the hole in your own lane.',
      metrics: [
        { label: 'Lean needed', value: `${fmt(need)}°`, tone: slid ? 'danger' : 'ink' },
        { label: 'Wet grip used', value: `${Math.round(use * 100)} %`, tone: use > 1 ? 'danger' : use > 0.75 ? 'caution' : 'ok' },
      ],
      frames: withCar,
    }
  },
  takeaway: 'A hole in a wet bend is a reason to have slowed on the straight. Do not swerve into oncoming traffic, and do not take it leaned.',
}

// ─── 21. Overtake with a possible gap ────────────────────────────────────────
const TRUCK_LEN = 12
const PASS_GAP = 15
const GAP_ONCOMING = 320
export const overtakeGap: Scenario = {
  id: 'overtake-gap',
  number: 21,
  title: 'A gap that looks possible',
  summary: 'Oncoming traffic is distant. You are in a tall gear behind a slow vehicle.',
  situation: `You are ${PASS_GAP} m behind a 12 m truck doing 40 km/h, in fifth. An oncoming car is ${GAP_ONCOMING} m away, doing 60 km/h. To pass you need ${PASS_GAP} m clear in front of the truck before pulling back in.`,
  question: 'Which gear, and is the road clear well beyond the pass?',
  scene: straightRoad({}, 1200),
  choices: [
    { id: 'wait', label: 'Stay behind and wait for a longer gap' },
    { id: 'third', label: 'Change down to third, then pass' },
    { id: 'fifth', label: 'Pull out and go in fifth' },
  ],
  intro: [],
  run(choice) {
    const v40 = ms(40)
    const truck = (t: number): Actor => ({ id: 'truck', kind: 'truck', x: MY_LANE, y: PASS_GAP + 2 + TRUCK_LEN + v40 * t, heading: 0 })
    const car = (t: number): Actor => ({ id: 'car', kind: 'car', x: ONCOMING_LANE, y: GAP_ONCOMING - ms(60) * t, heading: 180 })
    if (choice === 'wait') {
      const r = ride({ state: riding(40, 5), inputs: { ...base, gear: 5, throttle: 0.2 } }, (t) => (t > 10 ? 'end' : undefined))
      return {
        verdict: 'safe',
        rider: 'Stays two seconds behind the truck until the oncoming car has passed.',
        motorcycle: 'Holds 40 km/h. The gap that “looked possible” is still a guess until the oncoming car is gone.',
        explanation: 'A distant car closes at more than 100 km/h relative. If the pass is not obviously easy in a pulling gear, waiting costs seconds, not a head-on.',
        consequence: 'Safe. Overtake later, in third, when you can see a clear road well beyond what you need.',
        metrics: [{ label: 'Risk taken', value: 'None', tone: 'ok' }],
        frames: framesFromRide(r, { actors: (t) => [truck(t), car(t)] }),
      }
    }
    const gear = choice === 'third' ? 3 : 5
    let done: number | null = null
    let back: number | null = null
    const r = ride({ state: riding(40, gear), inputs: { ...base, gear, throttle: 1 } }, (t, s) => {
      if (done === null && s.distance >= truck(t).y + PASS_GAP) done = t
      if (done !== null && back === null && t > done + 1.2) back = t
      return back !== null ? 'end' : done !== null ? { throttle: 0.3 } : {}
    }, { duration: 25 })
    const passT = done ?? r[r.length - 1].t
    const passD = r.find((x) => x.t >= passT)!.s.distance
    const margin = car(passT).y - passD
    const closing = r.find((x) => x.t >= passT)!.s.speed + ms(60)
    const marginS = margin / closing
    const x = (t: number) => MY_LANE + (ONCOMING_LANE - MY_LANE) * (smooth(t / 1.5) - smooth((t - passT) / 1.2))
    const verdict = marginS < 0.4 ? 'crash' : marginS >= 2.5 ? 'safe' : 'risky'
    return {
      verdict,
      rider: gear === 3 ? 'Changes down to third, checks, pulls out and opens the throttle fully.' : 'Pulls out in fifth and opens the throttle fully.',
      motorcycle: `In ${gear === 3 ? 'third the engine pulls' : 'fifth the engine labours'}: the pass takes ${fmt(passT)} s and ${Math.round(passD)} m. When the motorcycle is back, the oncoming car is ${Math.round(margin)} m away — ${fmt(marginS)} s at the closing speed.`,
      explanation:
        gear === 3
          ? 'Third puts the engine near its torque peak, so the motorcycle spends the least time on the wrong side. Even then, the gap has to be obviously bigger than the pass.'
          : 'In fifth the engine is below its power. The pass drags on while the oncoming car closes at more than 100 km/h.',
      consequence: verdict === 'crash' ? 'Crash: not enough road — a head-on, or the oncoming driver in the ditch.' : verdict === 'safe' ? `Safe: ${fmt(marginS)} s of margin.` : `Risky: only ${fmt(marginS)} s from a head-on. Choose the gear, and a bigger gap, before you pull out.`,
      metrics: [
        { label: 'Time on the wrong side', value: `${fmt(passT + 1.2)} s` },
        { label: 'Margin to oncoming', value: `${fmt(marginS)} s`, tone: verdict === 'safe' ? 'ok' : 'danger' },
      ],
      frames: framesFromRide(r, { x, actors: (t) => [truck(t), car(t)] }),
    }
  },
  takeaway: 'Change down before you pull out, and only go if the road is clearly clear well beyond the pass. A tall gear turns a possible gap into a long one.',
}

// ─── 22. Overtake, pressured ─────────────────────────────────────────────────
export const overtakePressured: Scenario = {
  id: 'overtake-pressured',
  number: 22,
  title: 'A horn, a short gap, a blind bend',
  summary: 'Someone behind is pushing you to pass before you can see.',
  situation: 'You are behind a slow truck on a two-lane road. A car close behind sounds the horn. Ahead the road bends right; you cannot see past the truck. A short gap in oncoming traffic is closing.',
  question: 'Who owns the risk if you go?',
  scene: bendScene(45, 20, { features: [{ type: 'sign', x: -LANE - 1.8, y: 18, text: 'Bend' }] }),
  choices: [
    { id: 'go', label: 'Pull out because they are pushing you' },
    { id: 'wait', label: 'Stay behind the truck until you can see a clear road' },
    { id: 'left', label: 'Ease left and wave them through into the unknown' },
  ],
  intro: [],
  run(choice) {
    const v40 = ms(40)
    const truck = (t: number): Actor => ({ id: 'truck', kind: 'truck', x: MY_LANE, y: 18 + TRUCK_LEN + v40 * t, heading: 0 })
    const tail = (_t: number, bike: { y: number }): Actor => ({ id: 'tail', kind: 'car', x: MY_LANE, y: bike.y - 7, heading: 0 })
    const hidden = (t: number): Actor => ({ id: 'hidden', kind: 'car', x: ONCOMING_LANE, y: 95 - ms(55) * t, heading: 180 })
    if (choice === 'go') {
      const r = ride({ state: riding(40, 4), inputs: { ...base, gear: 4, throttle: 1 } }, (_t, s) => (s.distance > 70 ? 'end' : undefined))
      const x = (t: number) => MY_LANE + (ONCOMING_LANE - MY_LANE) * smooth(t / 1.2)
      const frames = framesFromRide(r, { x, actors: (t, bike) => [truck(t), tail(t, bike), hidden(t)] })
      const hit = frames.find((f) => f.bike.x > 0 && Math.abs(f.bike.y - hidden(f.t).y) < 8)
      const until = hit ?? frames[frames.length - 1]
      return {
        verdict: 'crash',
        rider: 'Pulls out in answer to the horn, into a road they cannot see.',
        motorcycle: 'Around the bend, an oncoming car was already there. The motorcycle is on their side of the road.',
        explanation: 'The horn behind you is information about their impatience, not about the road ahead. The risk of a pass you cannot see is entirely yours — they will not take the impact.',
        consequence: 'Crash: head-on with traffic that was hidden by the bend.',
        metrics: [{ label: 'Road ahead', value: 'Not visible', tone: 'danger' }],
        frames: [...frames.filter((f) => f.t <= until.t), ...slideFrames(until, 0.7 * G, (t) => [truck(t), hidden(t)], 1.2)],
      }
    }
    const r = ride({ state: riding(40, 4), inputs: { ...base, gear: 4, throttle: choice === 'left' ? 0.12 : 0.2 } }, (t) => (t > 8 ? 'end' : undefined))
    const x = choice === 'left' ? (t: number) => MY_LANE - 0.7 * smooth(t / 1.5) : MY_LANE
    const frames = framesFromRide(r, { x, actors: (t, bike) => [truck(t), tail(t, bike), hidden(t)] })
    if (choice === 'left') {
      return {
        verdict: 'risky',
        rider: 'Eases left and waves the chasing car through.',
        motorcycle: 'You make a gap. They may now pass into the same blind bend you refused.',
        explanation: 'Letting an impatient driver through can be the peaceful choice on a straight with a clear view. Here you are inviting them to take the pass you already judged unsafe. Their crash can still involve you.',
        consequence: 'Risky: you did not pull out — but you helped someone else pull out into a road neither of you can see.',
        metrics: [{ label: 'Bend ahead', value: 'Still blind', tone: 'caution' }],
        frames,
      }
    }
    return {
      verdict: 'safe',
      rider: 'Holds position behind the truck, ignores the horn, and waits until the road can be seen.',
      motorcycle: 'Stays at 40 km/h, in its lane. The hidden car comes the other way and is gone.',
      explanation: 'You own the decision to pass. Pressure from behind does not move the bend, empty the other lane, or put you in a pulling gear. Waiting is the whole skill here.',
      consequence: 'Safe. Pass later, when you can see a clear road well beyond the truck.',
      metrics: [{ label: 'Pass attempted', value: 'None', tone: 'ok' }],
      frames,
    }
  },
  takeaway: 'A horn behind you does not clear the road ahead. If you cannot see, you do not go — and you do not send someone else into the same unknown.',
}

// ─── 23. Hill, car close behind ──────────────────────────────────────────────
const HILL = 0.1
const HILL_BEHIND = -2.4
const hillScene = { view: 'side' as const, profile: (d: number) => HILL * d, from: -12, to: 28, labels: [{ d: 8, text: '10 % climb' }] }
const hillCar = (): Actor => ({ id: 'car', kind: 'car', x: 0, y: HILL_BEHIND, heading: 0 })
export const hillCarBehind: Scenario = {
  id: 'hill-car-behind',
  number: 23,
  title: 'Uphill, a bumper in the mirrors',
  summary: 'Stopped on a slope, a car close behind, engine idling.',
  situation: `You are stopped on a 10 % hill in first, holding the motorcycle on the rear brake with the clutch in. A car has stopped about 1 m behind your rear tyre. The way ahead is clear.`,
  question: 'What holds the motorcycle while you find the bite?',
  scene: hillScene,
  choices: [
    { id: 'bite', label: 'Hold the rear brake, find the bite with some throttle, then release the brake' },
    { id: 'roll', label: 'Let go of the brake, then let the clutch out' },
    { id: 'dump', label: 'Rev hard and dump the clutch' },
  ],
  intro: [],
  run(choice) {
    const scripts: Record<string, (t: number) => Partial<typeof base> & { throttle?: number; clutch?: number; rear?: number }> = {
      roll: (t) => (t < 0.5 ? {} : { rear: 0, throttle: t > 1.2 ? 0.25 : 0, clutch: t < 1.5 ? 1 : Math.max(0, 1 - (t - 1.5) / 2) }),
      dump: (t) => (t < 0.5 ? { throttle: Math.min(0.7, t * 2) } : { rear: 0, throttle: 0.7, clutch: 0 }),
      bite: (t) => {
        if (t < 0.6) return { throttle: Math.min(0.35, t) }
        if (t < 1.6) return { throttle: 0.35, clutch: 1 - (t - 0.6) * 0.7 }
        if (t < 2.2) return { throttle: 0.35, clutch: 0.3, rear: Math.max(0, 0.4 - (t - 1.6)) }
        return { rear: 0, throttle: 0.4, clutch: Math.max(0, 0.3 - (t - 2.2) * 0.2) }
      },
    }
    let minD = 0
    let stalled = false
    let felt = 0
    let peak = 0
    let hit: number | null = null
    const r = ride({ inputs: { ...base, gear: 1, clutch: 1, grade: HILL, rear: 0.45 } }, (t, s) => {
      minD = Math.min(minD, s.distance)
      if (!s.running) stalled = true
      felt += (s.acceleration - felt) * 0.08
      peak = Math.max(peak, felt)
      if (hit === null && s.distance - 1.6 <= HILL_BEHIND) hit = t
      if (t > 6 || hit !== null) return 'end'
      return scripts[choice](t)
    }, { duration: 7 })
    const end = r[r.length - 1]
    const frames = framesFromRide(r, { x: 0, actors: () => [hillCar()], pose: (_t, x) => ({ z: HILL * x.s.distance, lean: (-x.s.loadAccel / G) * 3 }) })
    if (choice === 'roll') {
      return {
        verdict: 'crash',
        rider: 'Lets go of the rear brake first, then starts feeding the clutch out.',
        motorcycle: `Gravity pulls the ${MASS} kg motorcycle back. It rolls ${fmt(-minD)} m into the bumper behind${stalled ? ' and the engine stalls under the load' : ''}.`,
        explanation: `On a 10 % hill something has to hold you until the clutch is already pulling: the rear brake, released only once you feel the bite. The car behind has left you almost no roll-back at all.`,
        consequence: 'Crash: into the car behind.',
        metrics: [
          { label: 'Roll-back', value: `${fmt(-minD)} m`, tone: 'danger' },
          { label: 'Engine', value: stalled ? 'Stalled' : 'Running', tone: stalled ? 'danger' : 'ink' },
        ],
        frames: hold(frames, 0.8),
      }
    }
    if (choice === 'dump') {
      return {
        verdict: 'risky',
        rider: 'Revs hard, drops the clutch and snatches off the brake.',
        motorcycle: `The clutch bites violently: peak acceleration ${fmt(peak)} m/s², ${Math.round(kmh(end.s.speed))} km/h in a few metres. No roll-back — and no control.`,
        explanation: 'High revs and a dumped clutch put the engine’s energy into the wheel at once. With a bumper in the mirrors the urge is to get away; the result is a lurch into the junction.',
        consequence: 'Risky: you miss the car behind, then arrive in the road in a wheelie-ish surge.',
        metrics: [{ label: 'Peak acceleration', value: `${fmt(peak)} m/s²`, tone: 'danger' }],
        frames: hold(frames, 0.6),
      }
    }
    return {
      verdict: hit ? 'crash' : 'safe',
      rider: 'Holds the rear brake, opens a little throttle, finds the bite, then eases the brake as the clutch takes the weight.',
      motorcycle: hit ? `Still rolls back into the car.` : `Moves off without rolling back. The clutch takes over from the brake on the slope.`,
      explanation: 'The rear brake is what holds you. The bite is what replaces it. Order matters more when someone has stopped a metre behind your tyre.',
      consequence: hit ? 'Crash: into the car behind.' : 'Safe: away up the hill, no roll-back, no lurch.',
      metrics: [
        { label: 'Roll-back', value: `${fmt(-minD)} m`, tone: hit ? 'danger' : 'ok' },
        { label: 'Engine', value: stalled ? 'Stalled' : 'Running', tone: stalled ? 'danger' : 'ok' },
      ],
      frames: hold(frames, 0.8),
    }
  },
  takeaway: 'On a hill with someone close behind: rear brake holds you, bite takes over, then the brake comes off. Never the other way round.',
}

// ─── 24. Wet painted line ────────────────────────────────────────────────────
const LINE_R = 38
const LINE_APPROACH = 32
const PAINT_MU = 0.28
export const wetPaintedLine: Scenario = {
  id: 'wet-painted-line',
  number: 24,
  title: 'A wet painted line in a bend',
  summary: 'A wet white line sits where you wanted to brake while leaned.',
  situation: `It is raining. A right-hand bend of ${LINE_R} m radius is ahead. A wide painted centre line is wet — about the grip of ice compared with wet asphalt — right where a late brake would happen, already leaned.`,
  question: 'Where do you brake, and how upright?',
  scene: (() => {
    const { lane } = bend(LINE_R, LINE_APPROACH)
    const arc = lane.filter((p) => p.tag === 'arc').slice(0, 18)
    const pts = [
      ...arc.map((p) => ({ x: p.x - 0.35, y: p.y })),
      ...[...arc].reverse().map((p) => ({ x: p.x + 0.35, y: p.y })),
    ]
    return bendScene(LINE_R, LINE_APPROACH, { weather: 'rain', features: pts.length > 4 ? [{ type: 'patch', kind: 'oil', points: pts }] : undefined })
  })(),
  choices: [
    { id: 'early', label: 'Brake on the straight, upright, then ride the bend at a lower speed' },
    { id: 'late', label: 'Brake in the bend, on the painted line, still leaned' },
    { id: 'hold', label: 'Hold 55 km/h and lean across the line' },
  ],
  intro: [],
  run(choice) {
    const { lane } = bend(LINE_R, LINE_APPROACH)
    if (choice === 'late') {
      const v = ms(48)
      const { frames, slid } = bendRun(lane, () => v, () => true, 0.25 * G)
      const cut = frames[Math.min(frames.length - 1, 40)]
      const fall = slideFrames(cut, 0.25 * G)
      return {
        verdict: 'crash',
        rider: 'Leaves braking until the bend, then squeezes while leaned on the wet paint.',
        motorcycle: `The painted line in the wet will take about ${fmt(PAINT_MU, 2)} of friction. Braking plus lean asks for more than that as soon as the tyre is on the line.`,
        explanation: 'Braking and turning share one budget of grip. Wet paint spends almost all of it. The tyre slides, and a motorcycle that is already leaned has nowhere to go but down.',
        consequence: 'Crash: a low-side on the painted line.',
        metrics: [
          { label: 'Paint grip (wet)', value: `μ ≈ ${fmt(PAINT_MU, 2)}`, tone: 'danger' },
          { label: 'Asked for', value: 'Lean + brake', tone: 'danger' },
        ],
        frames: slid ? frames : [...frames.slice(0, 24), ...fall],
      }
    }
    const kmhV = choice === 'early' ? 34 : 55
    const v = ms(kmhV)
    const mu = choice === 'hold' ? PAINT_MU : GRIP.wet
    const need = leanFor(v, LINE_R)
    const use = lateralG(need) / mu
    const { frames, slid } = bendRun(lane, () => v, (p) => Math.abs(p.lean) > gripLean(mu) * 0.98, 0.28 * G)
    const verdict = slid ? 'crash' : use > 0.8 ? 'risky' : 'safe'
    return {
      verdict,
      rider: choice === 'early' ? 'Brakes gently on the straight, fully upright, then rides the bend at about 34 km/h, off the paint as far as the lane allows.' : 'Holds 55 km/h and leans across the wet painted line.',
      motorcycle: `The bend needs ${fmt(need)}° of lean at ${kmhV} km/h — ${Math.round(use * 100)} % of the grip that surface can give.${slid ? ' The tyre lets go.' : ''}`,
      explanation: slid
        ? 'Speed you still have in a wet bend is lean you still need. On paint, that lean is already too much.'
        : 'All the slowing happens while the motorcycle is upright, on ordinary wet asphalt. The bend then asks for a small lean with grip in reserve — and you stay off the line.',
      consequence: verdict === 'crash' ? 'Crash: a low-side on the wet paint.' : verdict === 'risky' ? 'Risky: no margin if the line, a cover or diesel is in the wheel track.' : 'Safe: slowed upright, small lean, off the paint.',
      metrics: [
        { label: 'Lean needed', value: `${fmt(need)}°` },
        { label: 'Grip used', value: `${Math.round(use * 100)} %`, tone: use > 1 ? 'danger' : use > 0.8 ? 'caution' : 'ok' },
      ],
      frames,
    }
  },
  takeaway: 'In the wet, brake before the bend, upright, and treat painted lines as ice. Never brake leaned on one.',
}

// ─── 25. First rain, diesel, roundabout ──────────────────────────────────────
const RAIN_R = 18
const RAIN_APPROACH = 24
export const wetFirstRain: Scenario = {
  id: 'wet-first-rain',
  number: 25,
  title: 'First rain, diesel at a roundabout',
  summary: 'The first shower after a hot day; diesel at the entry; traffic closing in.',
  situation: `The first rain after a dry spell has lifted oil and diesel onto the surface. You are approaching a small roundabout (about ${RAIN_R} m radius). A darker, slick patch sits on the entry. Cars are closing behind you.`,
  question: 'Speed, lean, and whether you join at all.',
  scene: (() => {
    const { lane } = bend(RAIN_R, RAIN_APPROACH)
    const arc = lane.filter((p) => p.tag === 'arc').slice(0, 12)
    const pts = [
      ...arc.map((p) => ({ x: p.x - 1.2, y: p.y })),
      ...[...arc].reverse().map((p) => ({ x: p.x + 1.2, y: p.y })),
    ]
    return bendScene(RAIN_R, RAIN_APPROACH, { weather: 'rain', features: pts.length > 4 ? [{ type: 'patch', kind: 'oil', points: pts }, { type: 'sign', x: -LANE - 1.6, y: 10, text: 'Roundabout' }] : [{ type: 'sign', x: -LANE - 1.6, y: 10, text: 'Roundabout' }] })
  })(),
  choices: [
    { id: 'wait', label: 'Slow right down on the straight — or wait — and join only at a walking lean' },
    { id: 'join', label: 'Join at 40 km/h so the traffic behind does not close up' },
    { id: 'thirty', label: 'Take it at about 30 km/h, as you would on ordinary wet asphalt' },
  ],
  intro: [],
  run(choice) {
    const { lane } = bend(RAIN_R, RAIN_APPROACH)
    const DIESEL = 0.22
    const kmhV = choice === 'wait' ? 18 : choice === 'thirty' ? 30 : 40
    const mu = choice === 'wait' ? GRIP.wet : DIESEL
    const v = ms(kmhV)
    const need = leanFor(v, RAIN_R)
    const use = lateralG(need) / mu
    const { frames, slid } = bendRun(lane, () => v, (p) => Math.abs(p.lean) > gripLean(mu) * 0.98, 0.22 * G)
    const tail = (t: number): Actor => ({ id: 'tail', kind: 'car', x: MY_LANE, y: -8 + ms(35) * t, heading: 0 })
    const withTail = frames.map((f) => ({ ...f, actors: [tail(f.t)] }))
    const verdict = slid ? 'crash' : use > 0.75 ? 'risky' : 'safe'
    return {
      verdict,
      rider: choice === 'wait' ? 'Slows on the straight to a crawl, sits up, and joins only as fast as a walking lean needs.' : choice === 'join' ? 'Holds about 40 km/h so the cars behind do not have to slow.' : 'Takes the roundabout at 30 km/h, the usual wet-road speed for a bend this tight.',
      motorcycle: `A ${RAIN_R} m radius at ${kmhV} km/h needs ${fmt(need)}° of lean — ${Math.round(use * 100)} % of the grip this surface can give (μ ≈ ${fmt(mu, 2)}).${slid ? ' The tyre slides on the diesel.' : ''}`,
      explanation: slid
        ? 'The first rain after a hot day mixes dust, rubber and spilled diesel into a film with far less grip than “ordinary wet”. Traffic behind you does not change that number.'
        : choice === 'thirty'
          ? 'Ordinary wet grip might have held 30 km/h here. Diesel at the entry does not. You make it only if the wheel missed the patch — which you cannot count on.'
          : 'A walking-pace join asks for almost no lean. The cars behind can wait. A roundabout you cannot hold is not a gap you have to take.',
      consequence: verdict === 'crash' ? 'Crash: a low-side on the diesel at the entry.' : verdict === 'risky' ? 'Risky: no margin if the darker patch is under the front tyre.' : 'Safe: slow enough that a diesel patch is a greasy roll, not a lean you cannot hold.',
      metrics: [
        { label: 'Lean needed', value: `${fmt(need)}°` },
        { label: 'Grip used', value: `${Math.round(use * 100)} %`, tone: use > 1 ? 'danger' : use > 0.75 ? 'caution' : 'ok' },
      ],
      frames: withTail,
    }
  },
  takeaway: 'First rain and diesel cut grip again from “wet”. Slow on the straight, join a roundabout as upright as you can, and do not take speed from the traffic behind you.',
}

// ─── 26. Emergency stop with / without ABS ───────────────────────────────────
const ABS_CAR = 32
const absCar = (t: number): Actor => ({ id: 'car', kind: 'car', x: Math.min(1.2, -7 + 5.5 * Math.min(1, t / 1.5) * 1.5), y: ABS_CAR + 0.9, heading: 90 })
export const emergencyAbs: Scenario = {
  id: 'emergency-abs',
  number: 26,
  title: 'The same stop, with ABS and without',
  summary: 'A 50 km/h emergency stop. One motorcycle has ABS; the other does not.',
  situation: `Riding at 50 km/h, a car pulls out and stops across your lane, ${ABS_CAR} m ahead. Same distance as a dry emergency stop. One choice is a motorcycle with ABS; the others are without.`,
  question: 'What changes, and what does not?',
  scene: straightRoad({ features: [{ type: 'crossRoad', y: ABS_CAR + 0.9, width: LANE * 2 }] }),
  choices: [
    { id: 'abs', label: 'Grab both brakes hard — this motorcycle has ABS' },
    { id: 'grab', label: 'Grab the front brake fully — no ABS' },
    { id: 'both', label: 'No ABS: clutch in, a little rear, front squeezed on progressively' },
  ],
  intro: [],
  run(choice) {
    let lockAt: { t: number; wheel: string } | null = null
    let impact: number | null = null
    let absHeld = false
    const absOn = choice === 'abs'
    const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.3, abs: absOn } }, (t, s) => {
      if (!lockAt && s.brakes.front.locked) lockAt = { t, wheel: 'front' }
      if (!lockAt && s.brakes.rear.locked) lockAt = { t, wheel: 'rear' }
      if (s.brakes.front.abs || s.brakes.rear.abs) absHeld = true
      if (impact === null && s.distance >= ABS_CAR) impact = t
      if (impact !== null || (t > REACTION && s.speed < 0.01)) return 'end'
      if (choice === 'grab' && lockAt && t > lockAt.t + 0.25) return 'end'
      if (t < REACTION) return { abs: absOn }
      const e = t - REACTION
      if (choice === 'grab') return { throttle: 0, clutch: 1, front: 1, abs: false }
      if (choice === 'abs') return { throttle: 0, clutch: 1, front: 1, rear: 0.25, abs: true }
      return { ...goodBraking(e), abs: false }
    })
    const end = r[r.length - 1]
    const frames = framesFromRide(r, { actors: (t) => [absCar(t)] })
    const lk = lockAt as { t: number; wheel: string } | null
    if (choice === 'grab') {
      const fall = slideFrames({ ...frames[frames.length - 1], bike: { ...frames[frames.length - 1].bike, lean: -1 } }, 0.6 * G, (t) => [absCar(t)], 2)
      const reaches = fall.some((f) => f.bike.y >= ABS_CAR)
      return {
        verdict: 'crash',
        rider: 'Grabs the front brake fully on a motorcycle with no ABS.',
        motorcycle: `The front locks ${fmt((lk?.t ?? REACTION) - REACTION, 2)} s after the grab, at ${Math.round(kmh(end.s.speed))} km/h. The motorcycle falls${reaches ? ' and slides into the car' : ''}.`,
        explanation: 'Without ABS, a grabbed front asks for full force before the load has moved onto the tyre. The wheel locks, it cannot steer, and the motorcycle cannot stay up. ABS is the difference between this and a hard stop.',
        consequence: `Crash: a front-wheel lock and a fall${reaches ? ', into the car' : ''}.`,
        metrics: [
          { label: 'ABS', value: 'Off', tone: 'danger' },
          { label: 'Front wheel', value: 'Locked', tone: 'danger' },
        ],
        frames: [...frames, ...fall],
      }
    }
    const left = ABS_CAR - end.s.distance
    const ok = impact === null
    return {
      verdict: ok ? 'safe' : 'crash',
      rider: absOn ? 'Grabs both brakes hard and lets ABS work — clutch in, as for any stop.' : 'Closes the throttle, clutch in, a little rear, front squeezed on over half a second.',
      motorcycle: ok
        ? absOn
          ? `The wheels stay rolling${absHeld ? ': ABS holds the force just below lock' : ''}. The motorcycle stops in ${fmt(end.s.distance)} m — ${fmt(left)} m short of the car.`
          : `No lock. The motorcycle stops in ${fmt(end.s.distance)} m — ${fmt(left)} m short of the car.`
        : `Stops too late, reaching the car at ${Math.round(kmh(end.s.speed))} km/h.`,
      explanation: absOn
        ? 'ABS does not shorten the physics of a stop, and it does not add grip. What it changes is the grab: the system caps the brake so the wheel keeps rolling, and you can still steer. You still have to brake at once, in a straight line.'
        : 'Without ABS the same stop is available if you squeeze. The technique is what stands in for the system: progressive front, a little rear, clutch in.',
      consequence: ok ? `Safe: stopped with ${fmt(left)} m to spare.` : 'Crash.',
      metrics: [
        { label: 'ABS', value: absOn ? 'Holding' : 'Off', tone: absOn ? 'ok' : 'ink' },
        { label: 'Stopping distance', value: `${fmt(end.s.distance)} m` },
        { label: 'Margin', value: `${fmt(left)} m`, tone: ok ? 'ok' : 'danger' },
      ],
      frames: hold(frames, 1, (t) => [absCar(t)]),
    }
  },
  takeaway: 'ABS lets you grab and still steer; without it, squeeze. Neither invents extra road — you still brake at once, upright, in a straight line.',
}

// ─── 27. Emergency stop in a bend ────────────────────────────────────────────
const BEND_R = 36
const BEND_APPROACH = 20
export const emergencyInBend: Scenario = {
  id: 'emergency-in-bend',
  number: 27,
  title: 'You have to stop — in a bend',
  summary: 'A hard stop while leaned. Grip is already used for the turn.',
  situation: `You are in a right-hand bend of ${BEND_R} m radius at about 45 km/h, already leaned. Something in your lane means you must stop now. The road is dry.`,
  question: 'Stand it up first, or brake leaned?',
  scene: bendScene(BEND_R, BEND_APPROACH),
  choices: [
    { id: 'stand', label: 'Countersteer to stand the motorcycle up, then brake hard in a straight line' },
    { id: 'leaned', label: 'Squeeze the front hard while still leaned' },
    { id: 'grab', label: 'Grab the front fully, still leaned' },
  ],
  intro: [],
  run(choice) {
    const { lane } = bend(BEND_R, BEND_APPROACH)
    const v = ms(45)
    const need = leanFor(v, BEND_R)
    if (choice === 'stand') {
      const samples = timeline(lane, (p) => (p.tag === 'straight' || (p.s ?? 0) < 8 ? v : Math.max(ms(12), v - 4 * Math.max(0, p.s - 8))))
      const frames = toFrames(samples)
      return {
        verdict: 'safe',
        rider: 'Presses the inside bar to bring the motorcycle upright, then squeezes both brakes in a straight line.',
        motorcycle: `At 45 km/h the bend was using ${fmt(need)}° of lean — about ${Math.round((lateralG(need) / GRIP.dry) * 100)} % of dry grip for turning alone. Once upright, that budget is free for braking.`,
        explanation: 'Braking and turning share one circle of grip. Standing the motorcycle up first spends a little extra road, then lets the front tyre do a hard stop. Braking leaned asks for both at once.',
        consequence: 'Safe: upright, then a hard straight-line stop.',
        metrics: [
          { label: 'Lean while braking', value: '≈ 0°', tone: 'ok' },
          { label: 'Grip left for the brake', value: 'Almost all', tone: 'ok' },
        ],
        frames,
      }
    }
    const brakeG = choice === 'grab' ? 0.95 : 0.7
    const demand = (lean: number) => Math.hypot(lateralG(Math.abs(lean)), brakeG)
    const samples = timeline(lane, () => v)
    const slideAt = samples.find((p) => demand(p.lean) > GRIP.dry) ?? samples.find((p) => Math.abs(p.lean) > 8)!
    const frames = toFrames(samples.filter((p) => p.t <= slideAt.t))
    const fall = slideFrames(frames[frames.length - 1], 0.6 * G)
    return {
      verdict: 'crash',
      rider: choice === 'grab' ? 'Grabs the front fully, still leaned over in the bend.' : 'Squeezes a hard front brake while still leaned.',
      motorcycle: `Turning already asks for ${fmt(lateralG(need), 2)} g. Adding ${fmt(brakeG, 2)} g of braking asks for ${fmt(demand(need), 2)} g — more than the ${fmt(GRIP.dry, 2)} g the dry tyre can give. The front slides.`,
      explanation: 'The friction circle does not get bigger because you are in a hurry. A grabbed front while leaned is a tuck. Even a firm squeeze, leaned, can spend the last of the grip the turn was using.',
      consequence: 'Crash: the front washes out mid-bend.',
      metrics: [
        { label: 'Grip asked for', value: `${fmt(demand(need), 2)} g`, tone: 'danger' },
        { label: 'Grip available', value: `${fmt(GRIP.dry, 2)} g` },
      ],
      frames: [...frames, ...fall],
    }
  },
  takeaway: 'If you must stop in a bend, stand the motorcycle up first, then brake. Hard braking while leaned spends the grip the turn was already using.',
}

// ─── 28. Obstacle, no escape ─────────────────────────────────────────────────
const NO_ESC = 26
export const obstacleNoEscape: Scenario = {
  id: 'obstacle-no-escape',
  number: 28,
  title: 'Something in the lane — no empty lane',
  summary: 'Wet, oncoming traffic, a hazard in your wheel track, not enough room to stop from 50.',
  situation: `It is wet. A hazard sits in your lane, ${NO_ESC} m ahead, at 50 km/h. The other lane has an oncoming car. There is no empty space to swerve into.`,
  question: 'What can you still reduce, and what must you not do?',
  scene: straightRoad({ weather: 'rain' }),
  choices: [
    { id: 'slow', label: 'You had already slowed — brake now from about 30 km/h' },
    { id: 'fifty', label: 'Brake as hard as the wet road allows, from 50 km/h' },
    { id: 'swerve', label: 'Swerve around it anyway' },
  ],
  intro: [],
  run(choice) {
    const hazard = (): Actor => ({ id: 'dog', kind: 'dog', x: MY_LANE, y: NO_ESC + 0.4, heading: 90 })
    const oncoming = (t: number): Actor => ({ id: 'car', kind: 'car', x: ONCOMING_LANE, y: 80 - ms(50) * t, heading: 180 })
    if (choice === 'swerve') {
      const v = ms(50)
      const sw = swerve(v, { startAt: REACTION, lean: 30, hold: 0.45, side: 1, urgency: 7 }, 4)
      const frames: Frame[] = sw.map((q) => ({ t: q.t, bike: { x: MY_LANE + q.x, y: q.y, heading: q.heading, lean: q.lean, v }, actors: [hazard(), oncoming(q.t)] }))
      return {
        verdict: 'crash',
        rider: 'Presses the bar to go round the hazard into the other lane.',
        motorcycle: 'The other lane is not empty. Wet grip and a swerve together put the motorcycle into the oncoming car.',
        explanation: 'A swerve is only a choice when the space is actually empty. Here it is not. Braking, even if you cannot stop, still cuts the speed of whatever you hit.',
        consequence: 'Crash: into the oncoming car.',
        metrics: [{ label: 'Escape lane', value: 'None', tone: 'danger' }],
        frames: [...frames.slice(0, 50), ...slideFrames(frames[Math.min(49, frames.length - 1)], 0.45 * G, (t) => [hazard(), oncoming(t)], 1.2)],
      }
    }
    const start = choice === 'slow' ? 30 : 50
    let impact: number | null = null
    const r = ride({ state: riding(start, start > 40 ? 3 : 2), inputs: { ...wetIn, gear: start > 40 ? 3 : 2, throttle: 0.2 } }, (t, s) => {
      if (impact === null && s.distance >= NO_ESC) impact = t
      if (impact !== null || (t > REACTION && s.speed < 0.01)) return 'end'
      return t < REACTION ? { grip: GRIP.wet } : { ...goodBraking(t - REACTION), grip: GRIP.wet, front: Math.min(0.38, ((t - REACTION) / 0.5) * 0.38) }
    })
    const vHit = impact !== null ? r[r.length - 1].s.speed : 0
    const frames = framesFromRide(r, { actors: (t) => [hazard(), oncoming(t)] })
    const left = NO_ESC - r[r.length - 1].s.distance
    const ok = impact === null
    return {
      verdict: ok ? 'safe' : 'crash',
      rider: start === 30 ? 'Was already at about 30 km/h, then brakes as hard as the wet road allows, in a straight line.' : 'From 50 km/h, brakes as hard as the wet tyres will take, in a straight line.',
      motorcycle: ok
        ? `Stops ${fmt(left)} m short. The speed you already had left enough road.`
        : `The reaction plus a wet stop from 50 km/h needs more than ${NO_ESC} m. Impact at ${Math.round(kmh(vHit))} km/h — slower than 50, but still a hit.`,
      explanation: ok
        ? 'You cannot invent distance at the moment of the hazard. The only reason 26 m is enough is that the speed was already lower. That is the advanced skill: the speed you chose before this second.'
        : 'Straight-line braking is still the right move: there is no lane to use. What you can still reduce is speed. What you must not do is swerve into traffic. The miss had to be arranged earlier, as speed.',
      consequence: ok ? 'Safe: stopped short, in your lane, on the wet road.' : `Crash: into the hazard at ${Math.round(kmh(vHit))} km/h. Braking still made it slower than riding in.`,
      metrics: [
        { label: 'Speed you had', value: `${start} km/h`, tone: ok ? 'ok' : 'danger' },
        { label: ok ? 'Stopped short by' : 'Impact speed', value: ok ? `${fmt(left)} m` : `${Math.round(kmh(vHit))} km/h`, tone: ok ? 'ok' : 'danger' },
      ],
      frames: ok ? hold(frames, 1, (t) => [hazard(), oncoming(t)]) : [...frames, ...slideFrames(frames[frames.length - 1], 6, (t) => [hazard(), oncoming(t)], 0.8)],
    }
  },
  takeaway: 'With no escape lane, brake in a straight line — even if you cannot stop. The speed that would have made 26 m enough had to be chosen before the hazard appeared.',
}

// ─── 29. Amber, a car close behind ───────────────────────────────────────────
const AMBER_LINE = 42
const AMBER_T = 3
export const signalAmberBehind: Scenario = {
  id: 'signal-amber-behind',
  number: 29,
  title: 'Amber, and a car behind',
  summary: 'You can stop. Someone is close behind. The junction is not empty.',
  situation: `You are at 50 km/h. The light turns amber ${AMBER_LINE} m before the line — enough to stop. A car is about 8 m behind you. Cross traffic will get green after amber.`,
  question: 'Stop, or go — and how do you tell them?',
  scene: straightRoad({ features: [{ type: 'stopLine', y: AMBER_LINE, x0: -LANE, x1: 0 }, { type: 'crossRoad', y: AMBER_LINE + 2 + LANE, width: LANE * 2 }, { type: 'signal', y: AMBER_LINE, x: -LANE - 1 }] }),
  choices: [
    { id: 'stop', label: 'Brake progressively, brake light on early, and stop at the line' },
    { id: 'go', label: 'Keep going so the car behind does not have to brake' },
    { id: 'grab', label: 'Grab the front brake to stop in the shortest distance' },
  ],
  intro: [],
  run(choice) {
    const signalAt = (t: number): Frame['signal'] => (t < AMBER_T ? 'amber' : 'red')
    const tail = (_t: number, bike: { y: number }): Actor => ({ id: 'tail', kind: 'car', x: MY_LANE, y: bike.y - 8, heading: 0 })
    const cross = (t: number): Actor => ({ id: 'cross', kind: 'car', x: 9 - 1.2 * Math.max(0, t - (AMBER_T + 1)) ** 2, y: AMBER_LINE + 2 + LANE * 1.5, heading: -90 })
    if (choice === 'go') {
      const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.3 } }, (_t, s) => (s.distance > AMBER_LINE + 28 ? 'end' : undefined))
      const atLine = r.find((x) => x.s.distance >= AMBER_LINE)!
      return {
        verdict: 'risky',
        rider: 'Holds 50 km/h so the car behind is not forced to brake.',
        motorcycle: `Reaches the line after ${fmt(atLine.t, 2)} s — ${atLine.t > AMBER_T ? `${fmt(atLine.t - AMBER_T, 2)} s into red` : 'still on amber'} — and is in the junction as the cross traffic is released.`,
        explanation: 'The car behind is not a reason to enter on red. Your brake light is how they find out you can stop. Going “for them” spends a junction that is about to fill from the side.',
        consequence: 'Risky: no collision this time, but you are in the junction on red because of someone else’s following distance.',
        metrics: [
          { label: 'At the line', value: `${fmt(atLine.t, 2)} s`, tone: 'danger' },
          { label: 'Light', value: atLine.t > AMBER_T ? 'Red' : 'Amber', tone: 'danger' },
        ],
        frames: framesFromRide(r, { signal: signalAt, actors: (t, bike) => [tail(t, bike), cross(t)] }),
      }
    }
    let lockAt: number | null = null
    const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.3 } }, (t, s) => {
      if (!lockAt && s.brakes.front.locked) lockAt = t
      if (choice === 'grab' && lockAt && t > lockAt + 0.25) return 'end'
      if (t > REACTION && s.speed < 0.01) return t > REACTION + 3 ? 'end' : { clutch: 1, brake: 0.15 }
      if (t < REACTION) return t > 0.2 ? { throttle: 0 } : {}
      if (choice === 'grab') return { throttle: 0, clutch: 1, front: 1 }
      const need = (s.speed * s.speed) / (2 * Math.max(0.4, AMBER_LINE - 0.8 - s.distance))
      return { throttle: 0, clutch: s.speed < 4 ? 1 : 0, brake: Math.min(1, need / (0.8 * G)) }
    })
    const frames = framesFromRide(r, { signal: signalAt, actors: (t, bike) => [tail(t, bike), cross(t)] })
    if (choice === 'grab') {
      const fall = slideFrames({ ...frames[frames.length - 1], bike: { ...frames[frames.length - 1].bike, lean: -1 } }, 0.6 * G, (t) => [tail(t, frames[frames.length - 1].bike), cross(t)], 1.5)
      return {
        verdict: 'crash',
        rider: 'Grabs the front to make the stop as short as possible for the car behind.',
        motorcycle: `The front locks. The motorcycle falls — and the car behind now has a downed motorcycle instead of a brake light.`,
        explanation: 'A check-brake for the rider behind is an early, progressive light. A grab is a fall, which they cannot avoid.',
        consequence: 'Crash: a front-wheel lock, with traffic behind you.',
        metrics: [{ label: 'Front wheel', value: 'Locked', tone: 'danger' }],
        frames: [...frames, ...fall],
      }
    }
    const stopAt = r[r.length - 1].s.distance
    return {
      verdict: 'safe',
      rider: 'Rolls off at once so the brake light comes on early, then squeezes progressively and stops before the line.',
      motorcycle: `Stops ${fmt(AMBER_LINE - stopAt)} m before the line. The car behind sees the light while there is still room for them to slow.`,
      explanation: 'You can stop, so you stop. The rider behind is told with an early brake light, not by you entering on red, and not by a lock-up. Their gap is their problem to have built; your stop is still yours.',
      consequence: 'Safe. You wait at red; the cross traffic moves; the car behind has had a chance to slow.',
      metrics: [
        { label: 'Stopped before the line', value: `${fmt(AMBER_LINE - stopAt)} m`, tone: 'ok' },
        { label: 'Light when stopped', value: 'Red' },
      ],
      frames: hold(frames, 1, (t) => [tail(t, { y: stopAt }), cross(t)]),
    }
  },
  takeaway: 'If you can stop at amber, stop. Tell the rider behind with an early, progressive brake light — not by going, and not by grabbing.',
}

// ─── 30. Green, cross traffic is not stopping ────────────────────────────────
const GREEN_LINE = 28
export const signalGreenCross: Scenario = {
  id: 'signal-green-cross',
  number: 30,
  title: 'Green — and it does not look right',
  summary: 'Your light is green. A car from the cross road is not stopping.',
  situation: `Your light is green. You are at 40 km/h, ${GREEN_LINE} m from the line, about to enter. A car on the cross road is still coming, not slowing for its red.`,
  question: 'Do you enter on green?',
  scene: straightRoad({ features: [{ type: 'stopLine', y: GREEN_LINE, x0: -LANE, x1: 0 }, { type: 'crossRoad', y: GREEN_LINE + 2 + LANE, width: LANE * 2 }, { type: 'signal', y: GREEN_LINE, x: -LANE - 1 }] }),
  choices: [
    { id: 'hold', label: 'Cover the brake, do not enter, and stop if they keep coming' },
    { id: 'go', label: 'Enter — the light is green, you have right of way' },
    { id: 'gun', label: 'Accelerate through to get out of their way' },
  ],
  intro: [],
  run(choice) {
    const cross = (t: number): Actor => ({ id: 'cross', kind: 'car', x: 14 - ms(50) * t, y: GREEN_LINE + 2 + LANE, heading: -90, braking: false })
    if (choice === 'hold') {
      const r = ride({ state: riding(40, 3), inputs: { ...base, throttle: 0.2 } }, (t, s) => {
        if (t > REACTION && s.speed < 0.01) return t > REACTION + 3 ? 'end' : { clutch: 1 }
        if (t < 0.3) return { throttle: 0 }
        return goodBraking(Math.max(0, t - 0.3))
      })
      const stopAt = r[r.length - 1].s.distance
      const ok = stopAt < GREEN_LINE
      return {
        verdict: ok ? 'safe' : 'risky',
        rider: 'Closes the throttle, covers the brake, and stops before the line as the cross car comes through.',
        motorcycle: ok ? `Stops ${fmt(GREEN_LINE - stopAt)} m before the line. The cross car goes through the junction in front of you.` : `Does not quite stop in time, but is slow as the car crosses.`,
        explanation: 'Green is permission from the signal, not a guarantee that everyone else will stop. If it does not look right, you do not enter. Being right on the light is not the same as being in one piece.',
        consequence: ok ? 'Safe: you never meet them. Unpopular with anyone behind you; alive.' : 'Risky: late to read it, but slowing still helped.',
        metrics: [
          { label: 'Your light', value: 'Green' },
          { label: 'Entered?', value: ok ? 'No' : 'Late', tone: ok ? 'ok' : 'caution' },
        ],
        frames: hold(framesFromRide(r, { signal: () => 'green', actors: (t) => [cross(t)] }), 1.2, (t) => [cross(t)]),
      }
    }
    const full = choice === 'gun'
    const r = ride({ state: riding(40, 3), inputs: { ...base, throttle: full ? 1 : 0.25 } }, (_t, s) => (s.distance > GREEN_LINE + 18 ? 'end' : undefined))
    const frames = framesFromRide(r, { signal: () => 'green', actors: (t) => [cross(t)] })
    const hit = frames.find((f) => f.bike.y > GREEN_LINE && f.bike.y < GREEN_LINE + 8 && Math.abs(cross(f.t).x) < 3)
    const until = hit ?? frames[frames.length - 1]
    return {
      verdict: 'crash',
      rider: full ? 'Opens the throttle to clear the junction before they arrive.' : 'Rides in on green, assuming they will stop.',
      motorcycle: `You reach the junction at ${Math.round(kmh(until.bike.v))} km/h as the cross car is still coming. Right of way does not move them.`,
      explanation: full
        ? 'Accelerating into a junction someone else is already entering is a race you both lose. The faster you arrive, the harder the hit.'
        : 'The light being green is not a force field. If a car is not stopping, the only safe place is the one you have not entered yet.',
      consequence: 'Crash: into the side of (or by) the car that ran the red.',
      metrics: [
        { label: 'Your light', value: 'Green' },
        { label: 'They stopped?', value: 'No', tone: 'danger' },
      ],
      frames: [...frames.filter((f) => f.t <= until.t), ...slideFrames(until, 8, (t) => [cross(t)], 1)],
    }
  },
  takeaway: 'Green means you may go if the junction is clear. If someone on the cross road is not stopping, you do not enter.',
}

// ─── 31. Tailgater ───────────────────────────────────────────────────────────
export const tailgater: Scenario = {
  id: 'tailgater',
  number: 31,
  title: 'A car filling the mirror',
  summary: 'Dry, straight, someone sitting far too close behind.',
  situation: 'You are at 50 km/h on a dry straight, with a car ahead of you as well. A car has closed up so that it fills the mirror — a fraction of a second behind. There is space in front of you if you want it.',
  question: 'Speed up, brake-check, or restore your own gap ahead?',
  scene: straightRoad(),
  choices: [
    { id: 'gap', label: 'Ease off slightly, restore a bigger gap ahead, stay in your lane' },
    { id: 'speed', label: 'Speed up to get away from them' },
    { id: 'check', label: 'Tap the brakes to warn them off' },
  ],
  intro: [],
  run(choice) {
    const ahead = (t: number): Actor => ({ id: 'ahead', kind: 'car', x: MY_LANE, y: 42 + ms(50) * t, heading: 0 })
    const tail = (_t: number, bike: { y: number }): Actor => ({ id: 'tail', kind: 'car', x: MY_LANE, y: bike.y - 6, heading: 0 })
    if (choice === 'check') {
      let lockAt: number | null = null
      const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.28 } }, (t, s) => {
        if (!lockAt && s.brakes.rear.locked) lockAt = t
        if (t > 2.2 || (lockAt && t > lockAt + 0.4)) return 'end'
        if (t < 0.4) return {}
        return { throttle: 0, rear: 1 }
      })
      const frames = framesFromRide(r, { actors: (t, bike) => [ahead(t), tail(t, bike)] })
      const fall = slideFrames({ ...frames[frames.length - 1], bike: { ...frames[frames.length - 1].bike, lean: 1 } }, 5, (t) => [ahead(t), tail(t, frames[frames.length - 1].bike)], 1.2)
      return {
        verdict: 'crash',
        rider: 'Stamps the rear brake to “tell them”.',
        motorcycle: `The rear locks. The motorcycle steps out — and the car that was 6 m behind now has a sliding motorcycle in front of it.`,
        explanation: 'A brake-check spends your stability to send a message. The rider behind already cannot stop. You have just given them something worse to hit.',
        consequence: 'Crash: a locked rear, and likely a rear-end as well.',
        metrics: [{ label: 'Rear wheel', value: 'Locked', tone: 'danger' }],
        frames: [...frames, ...fall],
      }
    }
    if (choice === 'speed') {
      const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: 1 } }, (t, s) => (s.distance > 55 ? 'end' : t > 6 ? 'end' : undefined))
      const minGap = Math.min(...r.map((x) => ahead(x.t).y - 4.2 - x.s.distance))
      const hit = minGap < 1
      const frames = framesFromRide(r, { actors: (t, bike) => [ahead(t), tail(t, bike)] })
      return {
        verdict: hit ? 'crash' : 'risky',
        rider: 'Opens the throttle to put space behind.',
        motorcycle: hit
          ? `Closes on the car ahead and reaches it. The tailgater is still there, now at a higher speed.`
          : `Gains a little on the car ahead (closest gap ${fmt(minGap)} m) and is now doing ${Math.round(kmh(r[r.length - 1].s.speed))} km/h, with the same car still in the mirror.`,
        explanation: 'Speeding up does not fix a tailgater. It raises the speed of a crash if the car ahead slows, and it teaches them that crowding you works.',
        consequence: hit ? 'Crash: into the car you were following.' : 'Risky: faster, closer to the car ahead, same pressure behind.',
        metrics: [
          { label: 'Closest gap ahead', value: `${fmt(Math.max(0, minGap))} m`, tone: 'danger' },
          { label: 'Speed now', value: `${Math.round(kmh(r[r.length - 1].s.speed))} km/h`, tone: 'caution' },
        ],
        frames: hit ? [...frames, ...slideFrames(frames[frames.length - 1], 8, (t) => [ahead(t), tail(t, frames[frames.length - 1].bike)], 0.8)] : frames,
      }
    }
    const r = ride({ state: riding(50, 3), inputs: { ...base, throttle: 0.12 } }, (t) => (t > 5 ? 'end' : { throttle: 0.1 }))
    const minAhead = Math.min(...r.map((x) => ahead(x.t).y - 4.2 - x.s.distance))
    return {
      verdict: 'safe',
      rider: 'Eases the throttle a little, lets the gap ahead grow, and stays in the lane — no sudden brake, no race.',
      motorcycle: `The gap to the car ahead opens (never below ${fmt(minAhead)} m). Speed settles a little below 50 km/h. The tailgater can pass when there is a safe place; that is not your emergency.`,
      explanation: 'The gap you control is the one in front. Making that bigger gives you somewhere to go if anything happens. Speeding up or brake-checking spends it. Their following distance is theirs.',
      consequence: 'Safe: more room ahead, no sudden message to the car behind, still in your lane.',
      metrics: [
        { label: 'Closest gap ahead', value: `${fmt(minAhead)} m`, tone: 'ok' },
        { label: 'Brake-check', value: 'None', tone: 'ok' },
      ],
      frames: framesFromRide(r, { actors: (t, bike) => [ahead(t), tail(t, bike)] }),
    }
  },
  takeaway: 'A tailgater is a reason to grow the gap in front of you, not to speed up or brake-check. Their following distance is not yours to punish.',
}

// ─── 32. Night, rain, a horn ─────────────────────────────────────────────────
const NIGHT_BEAM = 40
const NIGHT_HAZARD = 70
export const nightRainHorn: Scenario = {
  id: 'night-rain-horn',
  number: 32,
  title: 'Night, rain, a horn behind',
  summary: 'You are already at a sensible night speed. They flash and horn.',
  situation: `It is night and raining on an unlit road. Your low beam shows about ${NIGHT_BEAM} m. You are at a speed you can stop in that distance. A car behind flashes and horns. Somewhere ahead, an unlit tractor sits in your lane.`,
  question: 'Does their hurry change the beam you can stop in?',
  scene: straightRoad({ weather: 'night', beam: NIGHT_BEAM }),
  choices: [
    { id: 'keep', label: 'Keep the night speed you can stop in, on low beam' },
    { id: 'match', label: 'Speed up to match their hurry' },
    { id: 'high', label: 'Switch to high beam and hold their speed' },
  ],
  intro: [],
  run(choice) {
    const kmhV = choice === 'keep' ? 45 : 70
    const beam = choice === 'high' ? 80 : NIGHT_BEAM
    const tractor = (): Actor => ({ id: 'tractor', kind: 'tractor', x: MY_LANE, y: NIGHT_HAZARD + 4, heading: 0, unlit: true })
    const tail = (_t: number, bike: { y: number }): Actor => ({ id: 'tail', kind: 'car', x: MY_LANE, y: bike.y - 12, heading: 0 })
    let seen: number | null = null
    let impact: number | null = null
    const r = ride({ state: riding(kmhV, kmhV > 55 ? 4 : 3), inputs: { ...wetIn, gear: kmhV > 55 ? 4 : 3, throttle: 0.28 } }, (t, s) => {
      if (seen === null && NIGHT_HAZARD - s.distance <= beam) seen = t
      if (impact === null && s.distance >= NIGHT_HAZARD) impact = t
      if (impact !== null || (seen !== null && s.speed < 0.01)) return 'end'
      return seen === null || t < seen + REACTION ? { grip: GRIP.wet } : { ...goodBraking(t - seen - REACTION), grip: GRIP.wet, front: Math.min(0.38, ((t - seen - REACTION) / 0.5) * 0.38) }
    })
    const end = r[r.length - 1]
    const vHit = impact !== null ? end.s.speed : 0
    const atSeen = r.find((x) => x.t >= (seen ?? 0)) ?? r[0]
    const free = ride({ state: { ...atSeen.s, distance: 0 }, inputs: { ...atSeen.inputs, grip: GRIP.wet } }, (t, s) => (t > REACTION && s.speed < 0.01 ? 'end' : t < REACTION ? { grip: GRIP.wet } : { ...goodBraking(t - REACTION), grip: GRIP.wet, front: Math.min(0.38, ((t - REACTION) / 0.5) * 0.38) }))
    const stopDist = free[free.length - 1].s.distance
    const frames = framesFromRide(r, { actors: (t, bike) => [tractor(), tail(t, bike)] }).map((f) => ({ ...f, beam }))
    const dazzle = choice === 'high'
    const verdict = impact !== null ? 'crash' : dazzle ? 'risky' : 'safe'
    return {
      verdict,
      rider: choice === 'keep' ? 'Holds about 45 km/h on low beam and ignores the horn.' : dazzle ? 'Switches to high beam and matches their 70 km/h.' : 'Opens the throttle to match the car behind.',
      motorcycle: `The tractor appears at ${beam} m. After a reaction and a wet squeeze, the motorcycle needs ${fmt(stopDist)} m to stop${impact !== null ? ` — it hits at ${Math.round(kmh(vHit))} km/h` : ` and stops ${fmt(NIGHT_HAZARD - end.s.distance)} m short`}.`,
      explanation: impact !== null
        ? 'Their hurry does not lengthen your beam or dry the road. At 70 km/h on a wet night you are out-riding the light: by the time the tractor appears, it is too late.'
        : dazzle
          ? 'High beam may show the tractor — and it dazzles anyone coming the other way, on a wet night when glare is worse. The horn did not make that a good trade.'
          : 'The speed that lets you stop in the wet beam is the speed that is safe. A horn behind is not new information about the road ahead.',
      consequence: verdict === 'crash' ? `Crash into the unlit tractor at ${Math.round(kmh(vHit))} km/h.` : verdict === 'risky' ? 'Risky: you stop, but high beam on a wet night is a hazard to everyone else.' : 'Safe: still able to stop in what you can see.',
      metrics: [
        { label: 'Can see', value: `${beam} m` },
        { label: 'Needs to stop', value: `${fmt(stopDist)} m`, tone: stopDist > beam ? 'danger' : 'ok' },
        { label: impact !== null ? 'Impact speed' : 'Stopped short by', value: impact !== null ? `${Math.round(kmh(vHit))} km/h` : `${fmt(NIGHT_HAZARD - end.s.distance)} m`, tone: impact !== null ? 'danger' : 'ok' },
      ],
      frames: impact !== null ? [...frames, ...slideFrames(frames[frames.length - 1], 8, (t) => [tractor(), tail(t, frames[frames.length - 1].bike)], 0.8).map((f) => ({ ...f, beam }))] : hold(frames, 1, (t) => [tractor(), tail(t, frames[frames.length - 1].bike)]).map((f) => ({ ...f, beam })),
    }
  },
  takeaway: 'At night in the rain, ride at a speed you can stop in the beam. A horn behind you does not change the light, the wet grip, or the unlit hazard.',
}

export const progressiveScenarios: Scenario[] = [
  pedestrianAhead,
  pedestrianWetBehind,
  followingWithRoom,
  followingOneSecondWet,
  potholeLate,
  potholeLeanedWet,
  overtakeGap,
  overtakePressured,
  hillCarBehind,
  wetPaintedLine,
  wetFirstRain,
  emergencyAbs,
  emergencyInBend,
  obstacleNoEscape,
  signalAmberBehind,
  signalGreenCross,
  tailgater,
  nightRainHorn,
]
