import { NOSE, carGap, lineGap, type RideInputs, type WorldSpec, type WorldState } from '@/lib/simulation/cockpitWorld'
import type { MistakeId } from '@/lib/simulation/ridingMistakes'
import type { CockpitScenario, WorldWatch } from './types'

/*
 * Riding with other traffic and road furniture: stopping for a signal, moving off from a queue,
 * crawling in slow traffic, and a speed breaker. The car, the signal and the bump live in the
 * scenario's world (cockpitWorld.ts) and are stepped with the motorcycle.
 */

const MOVING = 0.2 // m/s
const RIDE_SAFETY = 'Practise these situations for real only with a qualified instructor, in a closed area first.'
const MODEL_NOTE = 'This simulator is a simplified model: real traffic and a real motorcycle will behave differently.'

/** Too close behind a moving car: less than one second's travel (and never under 2 m). */
const tooClose = (gap: number, speed: number) => speed > 1 && gap < Math.max(2, speed)

/** The checks traffic scenarios share: reaching the car, closing in too far, crossing the line on red. */
function trafficWatch(spec: WorldSpec): WorldWatch {
  return (prev, s, _i, _d, w) => {
    const before = carGap(w, prev.distance)
    const now = carGap(w, s.distance)
    if (before != null && now != null) {
      if (before >= NOSE && now < NOSE) return 'collision'
      if (!tooClose(before, prev.speed) && tooClose(now, s.speed) && now >= NOSE) return 'tailgating'
    }
    const lineBefore = lineGap(spec, prev.distance)
    const lineNow = lineGap(spec, s.distance)
    if (lineBefore != null && lineNow != null && lineBefore >= 0 && lineNow < 0 && w.signal === 'red') return 'ran-red'
    return null
  }
}

const COLLISION = { id: 'collision' as MistakeId, title: 'Reaching the car', text: 'You ran into the car ahead. Leave more room, and slow down as soon as it does.' }
const TAILGATING = { id: 'tailgating' as MistakeId, title: 'Too close', text: 'You closed to less than a second behind the car ahead — not enough time to react if it stops. Ease off and let the gap grow.' }

// ---- Stopping at a traffic signal ----

/** Front brake for a steady stop 2 m before the stop line: deceleration v² / 2x, as a share of 1 g (used by the demonstration). */
// Engine braking, rolling resistance and the light rear brake already give a few hundredths of a g, so the front adds the rest.
const toLine = (s: { speed: number; distance: number }) => Math.min(0.5, Math.max(0.02, (s.speed * s.speed) / (2 * Math.max(0.5, 78 - s.distance)) / 9.81 - 0.06))

/** The light turns amber as the rider comes within this distance of the stop line, m, then red after 3 s. */
const AMBER_AT = 45
const signalStop: WorldSpec = {
  signal: {
    at: 80,
    colour: (w, d) => {
      if (w.mem.amberAt === undefined && 80 - d <= AMBER_AT) w.mem.amberAt = w.t
      return w.mem.amberAt === undefined ? 'green' : w.t - w.mem.amberAt < 3 ? 'amber' : 'red'
    },
  },
}

export const trafficSignal: CockpitScenario = {
  id: 'traffic-signal',
  title: 'Stopping at a traffic signal',
  summary: 'The light ahead turns amber: slow down smoothly and stop at the line, ready to wait.',
  setup: { gear: 3, running: true, kmh: 40, throttle: 0.2 },
  view: 'rider',
  world: signalStop,
  watch: trafficWatch(signalStop),
  situation: 'You are riding at about 40 km/h in third gear towards a junction with a traffic signal. It is green — for now.',
  objective: 'When the light changes, stop smoothly at the stop line — not past it, and without stalling — then wait in neutral.',
  actions: ['When the light turns amber, close the throttle and start braking with both brakes.', 'Pull the clutch in as you slow, change down to first, and stop at the line.', 'Select neutral (a half-lift from first) while you wait for green.'],
  mechanical: 'Closing the throttle gives engine braking through the gearbox; the brakes do the rest. Pulling the clutch in before you stop separates the engine from the stopping rear wheel, so it keeps idling. Changing down while still rolling leaves you in first, ready to go; neutral, found with a half-lift from first, then lets you release the clutch while you wait.',
  road: 'As you brake, load moves onto the front tyre and the fork compresses; it rebounds as you come to rest. The stop line is where the front wheel must stop.',
  why: 'An amber light means stop, if you can do so safely. Reacting early, and braking progressively, gives a calm stop instead of a late, hard one — or a red light run.',
  mistakes: [
    { id: 'ran-red', title: 'Crossing on red', text: 'The light was red when you crossed the line. Start braking as soon as it turns amber — at 40 km/h you need about 25 m to react and stop.' },
    { id: 'stall', title: 'Stalling as you stop', text: 'In gear with the clutch out, the stopping wheel drags the engine down. Pull the clutch in before you stop.' },
    { id: 'front-lock', title: 'Locking the front wheel', text: 'A grabbed lever locks the front before the load has moved onto it. Squeeze progressively.' },
    { id: 'rear-lock', title: 'Locking the rear wheel', text: 'Braking takes load off the rear tyre, so it locks easily. Use a lighter foot.' },
  ],
  safety: [RIDE_SAFETY, 'Check your mirrors before braking, and keep the brake on while you wait so drivers behind can see your brake light.', MODEL_NOTE],
  steps: [
    {
      id: 'react',
      title: 'React to amber',
      instruction: 'When the light turns amber, close the throttle and start braking.',
      highlight: ['throttle', 'frontBrake', 'rearBrake'],
      done: (s, i, _d, w) => w.signal !== 'green' && i.throttle === 0 && ((i.front ?? 0) > 0 || (i.rear ?? 0) > 0) && s.speed > MOVING,
      explanation: 'Braking early leaves the whole distance to the line for a gentle stop.',
    },
    {
      id: 'stop',
      title: 'Stop at the line',
      instruction: 'Pull the clutch in, change down to first as you slow, and stop at the stop line — within a few metres of it, not past it.',
      highlight: ['clutch', 'frontBrake', 'gearbox'],
      done: (s, _i, d, w) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (lineGap(signalStop, s.distance) ?? -1) >= 0 && (lineGap(signalStop, s.distance) ?? 99) <= 10 && w.signal !== 'green',
      explanation: 'Stopped at the line, engine still idling: the clutch kept the stopping wheel from stalling it.',
    },
    {
      id: 'neutral',
      title: 'Wait in neutral',
      instruction: 'Select neutral while you wait — a gentle half-lift from first — so you can let the clutch out.',
      highlight: ['gearbox', 'clutch'],
      done: (s, i) => s.running && i.gear === 0 && Math.abs(s.speed) < 0.05,
      explanation: 'In neutral nothing connects the engine to the rear wheel: your left hand can rest while you wait.',
    },
  ],
  demo: [
    { step: 'react', seconds: 6, watch: 'Green, so the rider rides on — until the light turns amber: then throttle closed and braking begins at once.', act: (_t, s, w) => (w.signal === 'green' ? {} : { throttle: 0, front: toLine(s), rear: 0.03 }) },
    {
      step: 'stop',
      seconds: 8,
      watch: 'Braking judged to the line; as the speed falls the clutch goes in and the lever presses down through second to first.',
      act: (_t, s) => ({ front: toLine(s), rear: 0.03, ...(s.speed < 4 ? { clutch: 1, gear: s.speed < 2.5 ? 1 : 2 } : {}) }),
    },
    { step: 'neutral', seconds: 0.6, watch: 'Stopped at the line: a half-lift selects neutral, so the clutch can be let out while waiting.', act: () => ({ gear: 0 }) },
  ],
}

// ---- Moving again in traffic ----

/** The light turns green this long after the rider is ready (first gear, clutch in, standing), s; the car moves off 1.2 s after that. */
const GREEN_AFTER_READY = 3
// In a guided run, only once the learner has moved on from "Get ready" — the light never changes while they are still on that step.
const isReady = (ride?: RideInputs) => !!ride && ride.gear === 1 && (ride.clutch ?? 0) >= 0.9 && Math.abs(ride.speed) < 0.2 && (ride.stage === undefined || ride.stage >= 1)
/** When the light turned (or will turn) green, s; undefined until the rider is ready. */
const greenAt = (w: WorldState) => (w.mem.readyAt === undefined ? undefined : w.mem.readyAt + GREEN_AFTER_READY)
const queue: WorldSpec = {
  car: {
    gap: 6,
    speed: (w) => {
      const g = greenAt(w)
      return g === undefined || w.t < g + 1.2 ? 0 : Math.min(9, 2 * (w.t - g - 1.2))
    },
  },
  // Like a real queue: the light doesn't change while the learner is still getting ready.
  signal: {
    at: 12,
    colour: (w, _d, ride) => {
      if (w.mem.readyAt === undefined && isReady(ride)) w.mem.readyAt = w.t
      const g = greenAt(w)
      return g !== undefined && w.t >= g ? 'green' : 'red'
    },
  },
}

export const movingInTraffic: CockpitScenario = {
  id: 'moving-in-traffic',
  title: 'Moving again in traffic',
  summary: 'Waiting in a queue at a red light: get ready, wait for the car ahead, then move off and keep a safe gap.',
  setup: { gear: 0, running: true },
  view: 'rider',
  world: queue,
  watch: trafficWatch(queue),
  hint: (s, i, w) => {
    const gap = carGap(w, s.distance) ?? 0
    if (w.signal === 'red' && w.mem.readyAt === undefined) return 'Your motorcycle moves only when you use the controls. Get ready: pull the clutch in (hold A) and select first (D). The light changes once you are ready.'
    if (w.signal === 'red') return i.clutch >= 0.9 ? 'Ready, in first with the clutch in. Wait for green — keep the clutch pulled in.' : 'Keep the clutch pulled in while you wait, or the motorcycle will move off on red.'
    if (Math.abs(s.speed) < 0.2 && w.carSpeed < 0.5 && gap < 6.5) return 'Green — but the car ahead hasn’t moved yet. Wait for it.'
    if (Math.abs(s.speed) < 0.2) return 'The car has moved off: open the throttle a little (↑) and ease the clutch out slowly (hold Z) to follow.'
    return null
  },
  situation: 'You are waiting at a red light in neutral, engine idling, behind a car about 6 m ahead. Your motorcycle moves only when you use the controls: the light turns green a few seconds after you are ready, in first with the clutch in.',
  objective: 'Be ready when the light changes, move off smoothly only once the car ahead has moved, and keep a safe gap behind it.',
  actions: ['While it is red, pull the clutch in and select first.', 'When it turns green and the car has moved off, ease the clutch out with a little throttle.', 'Change up to second and let the gap grow to two seconds.'],
  mechanical: 'With the clutch pulled in, first gear can be selected while standing still: the gearbox shaft is free of the engine. Easing the lever out brings the plates together through the friction zone until the engine drives the rear wheel.',
  road: 'The motorcycle squats slightly as it accelerates, load moving onto the rear tyre. The car ahead accelerates faster than you need to — let it go.',
  why: 'Being ready saves time without rushing. Moving off only once the car ahead has gone avoids nudging it, and a two-second gap gives you time to react if it stops again.',
  mistakes: [
    { id: 'ran-red', title: 'Moving off on red', text: 'You crossed the stop line before the light turned green. Wait for green — and for the car ahead.' },
    COLLISION,
    TAILGATING,
    { id: 'stall', title: 'Stalling as you move off', text: 'The clutch came out faster than the engine could take up the load. Use a little throttle and ease the lever out more slowly.' },
    { id: 'lurch', title: 'A jerky take-up', text: 'The plates went from slipping to gripping too quickly. Slow down through the last part of the lever’s travel.' },
  ],
  safety: [RIDE_SAFETY, 'Before moving off, check the junction is clear even when the light is green — someone may be running the red.', MODEL_NOTE],
  steps: [
    {
      id: 'ready',
      title: 'Get ready',
      instruction: 'While the light is red, pull the clutch in fully and select first.',
      highlight: ['clutch', 'gearbox'],
      done: (s, i) => s.running && i.gear === 1 && i.clutch >= 0.9 && Math.abs(s.speed) < MOVING,
      explanation: 'Ready to go: first is selected, and the pulled-in clutch keeps it from driving the wheel.',
    },
    {
      id: 'away',
      title: 'Move off behind the car',
      instruction: 'When the light is green and the car ahead has moved off, ease the clutch out with a little throttle and follow.',
      highlight: ['clutch', 'throttle'],
      done: (s, _i, _d, w: WorldState) => s.running && w.signal === 'green' && s.speed > 2 && s.locked && (carGap(w, s.distance) ?? 0) >= 4,
      explanation: 'Moving smoothly, with room between you and the car.',
    },
    {
      id: 'gap',
      title: 'Second gear, two-second gap',
      instruction: 'Change up to second and let the gap to the car grow to at least two seconds.',
      highlight: ['clutch', 'gearbox', 'throttle'],
      done: (s, i, d, w) => i.gear === 2 && s.locked && d.kmh >= 15 && (carGap(w, s.distance) ?? 0) >= 2 * s.speed,
      explanation: 'Two seconds behind: if the car brakes hard, you have time to see it and stop.',
    },
  ],
  demo: [
    { step: 'ready', seconds: 0.8, watch: 'Clutch in and first selected while the light is red: ready, and the light now counts down to green.', act: (t) => (t < 0.4 ? { clutch: Math.min(1, t * 3) } : { gear: 1 }) },
    {
      step: 'away',
      seconds: 9,
      watch: 'The rider waits for green — and then for the car — before a little throttle and a smooth clutch release.',
      act: (_t, s, w) => {
        // Go once the car ahead has been moving for a moment (it leaves 1.2 s after green).
        const go = w.mem.readyAt === undefined ? undefined : w.mem.readyAt + 3 + 1.5
        if (go === undefined || w.t < go) return {}
        return { throttle: 0.3, clutch: s.locked ? 0 : Math.max(0, 0.42 - (w.t - go) * 0.08) }
      },
    },
    { step: 'gap', seconds: 5, watch: 'A clean change to second, then a steady speed while the car pulls away and the gap grows.', act: (t) => (t < 0.3 ? { clutch: 1, throttle: 0 } : t < 0.4 ? { gear: 2 } : { clutch: Math.max(0, 0.4 - (t - 0.4) * 0.3), throttle: 0.3 }) },
  ],
}

// ---- Slow traffic ----

/** A crawling queue: the car creeps at about 8 km/h for 5 s, then stops for 3 s, again and again. */
const crawl: WorldSpec = {
  car: {
    gap: 7,
    speed: (w) => {
      const phase = w.t % 8
      return phase < 5 ? 2.2 * Math.min(1, phase / 0.6, (5 - phase) / 0.6) : 0
    },
  },
}

export const slowTraffic: CockpitScenario = {
  id: 'slow-traffic',
  title: 'Riding in slow traffic',
  summary: 'Crawl along behind a car at walking pace using the clutch’s friction zone, stopping and moving off with it.',
  setup: { gear: 1, running: true, kmh: 8, paused: true },
  view: 'split',
  world: crawl,
  watch: trafficWatch(crawl),
  situation: 'You are in a slow queue, in first gear at walking pace, about 7 m behind a car that creeps forward and stops every few seconds. The scenario waits, paused, until you touch a control.',
  objective: 'Follow the car without stalling, without closing in on it, and without stopping more than you need to.',
  actions: ['Hold the clutch in its friction zone, with a little throttle, to creep at the car’s pace.', 'When it stops, pull the clutch in and stop gently behind it.', 'When it moves, ease the clutch back into the friction zone and follow.'],
  mechanical:
    'Even in first, the engine at idle would push the motorcycle along faster than walking pace. Slipping the clutch passes only part of the engine’s torque to the rear wheel, so the rider controls the speed with the lever — the throttle just keeps the engine above idle.',
  road: 'At walking pace the motorcycle is least stable, so small, smooth inputs matter. A light touch of the rear brake steadies it without pitching it forward.',
  why: 'Most stalls and low-speed drops happen in slow traffic. The friction zone is the tool for it: speed comes from the clutch lever, not from stabbing the throttle.',
  mistakes: [
    { id: 'stall', title: 'Stalling', text: 'The clutch took up more load than the engine could manage at that speed. Keep it in the friction zone, with a little throttle.' },
    COLLISION,
    { ...TAILGATING, text: 'You closed to less than a couple of metres behind the moving car. Slip the clutch a little more to ease off.' },
    { id: 'lurch', title: 'A jerky take-up', text: 'The clutch gripped suddenly. At walking pace, keep the lever in the friction zone rather than letting it out fully.' },
    { id: 'slip-heat', title: 'Revving hard with the clutch slipping', text: 'High revs with slipping plates turn power into heat. Slow traffic needs only a little throttle.' },
  ],
  safety: [RIDE_SAFETY, 'Keep your head up and look ahead, not at the front wheel; cover the rear brake.', MODEL_NOTE],
  steps: [
    {
      id: 'crawl',
      title: 'Creep in the friction zone',
      instruction: 'Hold the clutch in its friction zone (the plates slipping) and follow the car at walking pace.',
      highlight: ['clutch', 'throttle'],
      done: (s, i, d, w) => i.gear === 1 && d.slipping && s.speed > 1 && s.speed < 3.5 && (carGap(w, s.distance) ?? 0) > 2,
      explanation: 'The slipping clutch is setting your speed: only part of the engine’s torque reaches the rear wheel.',
    },
    {
      id: 'stop',
      title: 'Stop behind it',
      instruction: 'When the car stops, pull the clutch in and stop gently, a couple of metres behind it.',
      highlight: ['clutch', 'rearBrake', 'frontBrake'],
      done: (s, _i, d, w) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && w.carSpeed === 0 && (carGap(w, s.distance) ?? 0) >= 1.5 && (carGap(w, s.distance) ?? 99) <= 8,
      explanation: 'Stopped with room in front, engine idling, ready to go again.',
    },
    {
      id: 'go',
      title: 'Follow again',
      instruction: 'When the car moves, ease the clutch back into the friction zone and follow.',
      highlight: ['clutch', 'throttle'],
      done: (s, _i, _d, w) => s.running && w.carSpeed > 0.5 && s.speed > 1 && (carGap(w, s.distance) ?? 0) > 2,
      explanation: 'Stop, go, stop: all of it on the clutch, without stalling.',
    },
  ],
  demo: [
    { step: 'crawl', seconds: 1.5, watch: 'A little throttle and the clutch held in the friction zone: the slipping plates set a walking pace.', act: () => ({ throttle: 0.15, clutch: 0.33 }) },
    {
      step: 'stop',
      seconds: 6,
      watch: 'The rider keeps creeping while the car creeps; when it stops, the clutch goes in and a light rear brake stops the motorcycle behind it.',
      act: (_t, s, w) => (Math.abs(s.speed) < 0.05 && w.carSpeed < 0.3 ? { clutch: 1, throttle: 0, rear: 0.2 } : w.carSpeed > 0.3 ? { throttle: 0.15, clutch: 0.33, rear: 0 } : { clutch: 1, throttle: 0, rear: 0.3 }),
    },
    {
      step: 'go',
      seconds: 6,
      watch: 'When the car moves, the brake comes off and the clutch eases back into the friction zone to follow.',
      act: (_t, s, w) => (w.carSpeed > 0.5 || Math.abs(s.speed) > 0.3 ? { rear: 0, throttle: 0.2, clutch: s.speed < 0.5 ? 0.28 : s.speed > 2.2 ? 0.36 : 0.32 } : { clutch: 1, throttle: 0, rear: 0.2 }),
    },
  ],
}

// ---- Speed breaker ----

/** Where the speed breaker starts, how long and high it is, m. */
export const BREAKER = { at: 60, length: 2, height: 0.08 }
/** Above this entry speed the jolt passes 1 g (km/h); at 30 km/h the front tyre leaves the road. */
export const BREAKER_LIMIT = 20
const breaker: WorldSpec = { bump: BREAKER }
const onBreaker = (distance: number) => distance >= BREAKER.at && distance <= BREAKER.at + BREAKER.length

export const speedBreaker: CockpitScenario = {
  id: 'speed-breaker',
  title: 'Crossing a speed breaker',
  summary: 'Slow down before a speed breaker, roll over it off the brakes, and ride away.',
  setup: { gear: 3, running: true, kmh: 35, throttle: 0.2, paused: true },
  view: 'split',
  world: breaker,
  watch: (prev, s, i) => {
    if (prev.distance < BREAKER.at && s.distance >= BREAKER.at && s.speed * 3.6 > BREAKER_LIMIT) return 'bump-fast'
    if (onBreaker(s.distance) && (i.front ?? 0) > 0.05) return 'bump-braking'
    return null
  },
  situation: `You are riding at about 35 km/h in third gear. There is a speed breaker ${BREAKER.at} m ahead, ${BREAKER.length} m long and ${BREAKER.height * 100} cm high. The scenario waits, paused, until you touch a control.`,
  objective: 'Cross the speed breaker slowly, off the brakes, then ride away smoothly.',
  actions: ['Close the throttle and brake to below 15 km/h before the speed breaker, changing down to second.', 'Release the brakes and roll over it at a steady speed.', 'Once over it, open the throttle smoothly and ride away.'],
  mechanical: 'Below about 15 km/h third gear makes the engine labour, so second keeps it turning freely for the ride away. Over the bump, the front wheel is pushed up and the fork compresses to absorb it; the rear follows a moment later.',
  road:
    'The faster you meet a bump, the harder and quicker the fork must compress. At 15 km/h this one gives a jolt of about 0.8 g; above 20 km/h it passes 1 g, and at 30 km/h the front tyre leaves the road. Braking on the bump makes it worse: the fork is already compressed by the load transfer, so it has less travel left to absorb the bump.',
  why: 'Speed breakers catch out riders who arrive too fast or brake on them. Slowing early and rolling over off the brakes keeps the suspension free to do its job and the tyres on the road.',
  mistakes: [
    { id: 'bump-fast', title: 'Too fast over the speed breaker', text: `You reached it above ${BREAKER_LIMIT} km/h: the fork was slammed and the front tyre was nearly thrown off the road. Brake earlier, before you reach it.` },
    { id: 'bump-braking', title: 'Braking on the speed breaker', text: 'The front brake was on as you crossed: the fork was already compressed by braking, with less travel left for the bump. Finish braking before you reach it, then roll over.' },
    { id: 'stall', title: 'Stalling', text: 'Slowing right down in a high gear with the clutch out dragged the engine down. Change down, or pull the clutch in.' },
    { id: 'front-lock', title: 'Locking the front wheel', text: 'Squeeze the front brake progressively.' },
    { id: 'shift-without-clutch', title: 'Changing gear without the clutch', text: 'Pull the clutch in fully before moving the gear lever.' },
  ],
  safety: [RIDE_SAFETY, 'On a real motorcycle, rise slightly off the seat with your knees bent as you cross, so your legs absorb the jolt.', MODEL_NOTE],
  steps: [
    {
      id: 'slow',
      title: 'Slow down before it',
      instruction: 'Close the throttle, brake to below 15 km/h and change down to second — before you reach the speed breaker.',
      highlight: ['throttle', 'frontBrake', 'rearBrake', 'gearbox'],
      done: (s, i, d) => s.distance < BREAKER.at && d.kmh > 3 && d.kmh < 15 && i.gear === 2,
      explanation: 'Slow, in second, with the speed breaker still ahead: the braking is done before you reach it.',
    },
    {
      id: 'over',
      title: 'Roll over it',
      instruction: 'Release the brakes and roll over the speed breaker at a steady speed.',
      highlight: ['frontWheel', 'rearWheel'],
      done: (s, i, d) => s.distance > BREAKER.at + BREAKER.length && d.kmh > 2 && (i.front ?? 0) === 0,
      explanation: 'The fork had its full travel for the bump, and the jolt stayed gentle.',
    },
    {
      id: 'away',
      title: 'Ride away',
      instruction: 'Open the throttle smoothly and ride away above 20 km/h.',
      highlight: ['throttle', 'clutch'],
      done: (s, i, d) => s.distance > BREAKER.at + BREAKER.length && i.throttle > 0 && d.kmh > 20 && s.locked,
      explanation: 'Over and away, with no harsh jolt and no braking on the bump.',
    },
  ],
  demo: [
    {
      step: 'slow',
      seconds: 8,
      watch: 'Braking starts well before the speed breaker; below about 14 km/h the clutch goes in and the lever presses down to second.',
      act: (_t, s) => (s.distance < 35 ? {} : s.speed * 3.6 > 14 ? { throttle: 0, front: 0.25, rear: 0.1 } : { front: 0, rear: 0, clutch: 1, gear: 2 }),
    },
    { step: 'over', seconds: 8, watch: 'Brakes off, clutch out smoothly with a touch of throttle: the motorcycle rolls over the speed breaker — watch the gentle jolt reported.', act: (t) => ({ clutch: Math.max(0, 1 - t * 1.2), throttle: 0.12 }) },
    { step: 'away', seconds: 6, watch: 'Over it: the throttle opens smoothly and the motorcycle rides away.', act: (t) => ({ throttle: Math.min(0.6, 0.15 + t * 0.3), clutch: 0 }) },
  ],
}

export const trafficScenarios = [trafficSignal, movingInTraffic, slowTraffic, speedBreaker]
