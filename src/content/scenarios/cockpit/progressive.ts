import { G } from '@/lib/mechanics/braking'
import { NOSE, carGap, personGap, type WorldSpec, type WorldState } from '@/lib/simulation/cockpitWorld'
import type { MistakeId } from '@/lib/simulation/ridingMistakes'
import type { CockpitScenario, WorldWatch } from './types'

/*
 * Straight-road cockpit rides for the progressive-group decisions a single lane can already
 * show: a person on a crossing, a gentle follow, a one-second wet follow, a late pothole, and
 * waiting in a tall gear. Bends, cars behind, night and extra mass live in fullWorld.ts.
 */

const RIDE_SAFETY = 'Practise these situations for real only with a qualified instructor, in a closed area first.'
const MODEL_NOTE = 'This simulator is a simplified model: real traffic and a real motorcycle will behave differently.'

const tooClose = (gap: number, speed: number) => speed > 1 && gap < Math.max(2, speed)

function followWatch(): WorldWatch {
  return (prev, s, _i, _d, w) => {
    const before = carGap(w, prev.distance) ?? personGap(w, prev.distance)
    const now = carGap(w, s.distance) ?? personGap(w, s.distance)
    if (before != null && now != null) {
      if (before >= NOSE && now < NOSE) return 'collision'
      if (!tooClose(before, prev.speed) && tooClose(now, s.speed) && now >= NOSE) return 'tailgating'
    }
    return null
  }
}

const COLLISION = { id: 'collision' as MistakeId, title: 'Reaching the vehicle ahead', text: 'You ran into the vehicle ahead. Leave more room, and slow as soon as it does.' }
const TAILGATING = { id: 'tailgating' as MistakeId, title: 'Too close', text: 'You closed to less than a second behind — not enough time to react if it stops. Ease off and let the gap grow.' }

const STALL = { id: 'stall' as MistakeId, title: 'Stalling', text: 'Pull the clutch in as you come to a stop, or change down before the engine labours.' }
const FRONT_LOCK = { id: 'front-lock' as MistakeId, title: 'Locking the front wheel', text: 'Squeeze the front brake progressively. A grabbed lever locks the wheel.' }
const REAR_LOCK = { id: 'rear-lock' as MistakeId, title: 'Locking the rear wheel', text: 'Hard braking unloads the rear. A light pedal is enough.' }
const SHIFT = { id: 'shift-without-clutch' as MistakeId, title: 'Changing gear without the clutch', text: 'Pull the clutch in fully before moving the gear lever.' }

// ---- Pedestrian ahead ----

const CROSSING = 80

export const pedestrianAhead: CockpitScenario = {
  id: 'pedestrian-ahead',
  title: 'A person on the crossing',
  summary: 'Someone is on a crossing well ahead: ease off early and be ready to stop.',
  setup: { gear: 3, running: true, kmh: 50, throttle: 0.25, paused: true },
  view: 'rider',
  world: { person: { at: CROSSING } },
  watch: followWatch(),
  situation: `You are riding at about 50 km/h in third. A person is still on the crossing, ${CROSSING} m ahead, in your wheel track. There is plenty of room to slow. The scenario waits, paused, until you touch a control.`,
  objective: 'Ease off early, lose speed in a straight line, and stop or crawl before the crossing.',
  actions: ['Close the throttle as soon as you see them.', 'Brake progressively so you are well below 30 km/h before you get close.', 'Pull the clutch in and stop short of them, or roll up at walking pace.'],
  mechanical: 'At 50 km/h you cover about 14 m every second. Seen at 80 m, a smooth roll-off and a light squeeze stop you with room — this is ordinary braking, not an emergency grab.',
  road: 'They are not moving out of the way. Closing the throttle first puts the brake light on for anyone behind and settles load onto the front before you squeeze.',
  why: 'A person on a crossing, seen early, is a speed problem. Holding 50 or swerving late spends the time you had to stop in a straight line.',
  mistakes: [COLLISION, FRONT_LOCK, REAR_LOCK, STALL],
  safety: [RIDE_SAFETY, 'On a real road, treat anyone on a crossing as still being there until you have stopped or they are clearly clear. Never assume they will finish in time.', MODEL_NOTE],
  steps: [
    {
      id: 'ease',
      title: 'Close the throttle',
      instruction: 'Close the throttle. The crossing is still well ahead.',
      highlight: ['throttle'],
      done: (s, i, d) => i.throttle === 0 && d.kmh > 8 && s.distance < CROSSING - 20,
      explanation: 'Engine braking has started the slowing, with the crossing still a long way off.',
    },
    {
      id: 'slow',
      title: 'Lose speed',
      instruction: 'Brake progressively until you are below 30 km/h, still short of the crossing.',
      highlight: ['frontBrake', 'rearBrake'],
      done: (s, i, d) => d.kmh < 30 && d.kmh > 2 && (i.front ?? 0) + (i.rear ?? 0) + i.brake > 0 && !s.brakes.front.locked && s.distance < CROSSING - 8,
      explanation: 'Well below 50, still upright, still with room: this is the adjustment, not a last-metre panic.',
    },
    {
      id: 'stop',
      title: 'Stop short of it',
      instruction: 'Pull the clutch in and stop — or crawl — before you reach the crossing.',
      highlight: ['clutch', 'frontBrake', 'rearBrake'],
      done: (s, _i, d, w) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (personGap(w, s.distance) ?? 0) >= NOSE,
      explanation: 'Stopped or crawling, short of the person, still in your lane.',
    },
  ],
  demo: [
    { step: 'ease', seconds: 0.8, watch: 'The throttle closes at once: engine braking starts the slowing with the crossing still well ahead.', act: () => ({ throttle: 0 }) },
    {
      step: 'slow',
      seconds: 2.8,
      watch: 'A progressive front brake, with a little rear: speed falls while there is still a long gap.',
      act: (_t, s) => (s.speed * 3.6 > 18 ? { throttle: 0, front: 0.32, rear: 0.08 } : { throttle: 0, clutch: 1, front: 0.28, rear: 0.08 }),
    },
    { step: 'stop', seconds: 6, watch: 'Clutch in, brakes held: the motorcycle stops short of the crossing.', act: () => ({ clutch: 1, front: 0.35, rear: 0.08 }) },
  ],
}

// ---- Following with room ----

const V50 = 50 / 3.6
const ROOM_BRAKE_AT = 3.2
const roomWorld: WorldSpec = {
  car: {
    gap: 42,
    speed: (w: WorldState) => (w.t < ROOM_BRAKE_AT ? V50 : Math.max(22 / 3.6, V50 - 0.22 * G * (w.t - ROOM_BRAKE_AT))),
  },
}

export const followingWithRoom: CockpitScenario = {
  id: 'following-with-room',
  title: 'The car ahead slows',
  summary: 'You have a real gap at 50 km/h. When the car slows, match it without grabbing.',
  setup: { gear: 3, running: true, kmh: 50, throttle: 0.28, paused: true },
  view: 'rider',
  world: roomWorld,
  watch: followWatch(),
  situation: 'You are about three seconds behind a car at 50 km/h, in third, on a dry straight. After a few seconds it slows gently. The scenario waits, paused, until you touch a control.',
  objective: 'Hold the gap, then match its slowing with a light progressive brake — no grab, no closing up.',
  actions: ['Hold about 50 km/h so the gap stays around three seconds.', 'When it slows, close the throttle and squeeze the brakes lightly.', 'Stay behind it, still with more than a second of space.'],
  mechanical: 'A three-second gap at 50 km/h is about 42 m. Gentle slowing from the car is a small deceleration: a light squeeze matches it. Grabbing spends the grip you do not need and can lock the front.',
  road: 'The car holds 50 km/h, then slows at about a quarter of a g. If you hold the throttle you close up; if you grab, you may lock. Matching is rolling off and a little brake.',
  why: 'Following with room is ordinary riding. The gap is there so a slowing car is not an emergency.',
  mistakes: [TAILGATING, COLLISION, FRONT_LOCK, REAR_LOCK, STALL],
  safety: [RIDE_SAFETY, 'Keep at least two seconds on a dry road; more if you cannot see past them.', MODEL_NOTE],
  steps: [
    {
      id: 'hold',
      title: 'Hold the gap',
      instruction: 'Stay around 50 km/h so the gap to the car stays at least two seconds.',
      highlight: ['throttle'],
      done: (s, _i, d, w) => w.t >= 1.5 && s.locked && d.kmh > 42 && d.kmh < 58 && (carGap(w, s.distance) ?? 0) >= 2 * s.speed,
      explanation: 'Still two or three seconds behind: room to see their lights and match them.',
    },
    {
      id: 'match',
      title: 'Match its slowing',
      instruction: 'When the car slows, close the throttle and squeeze the brakes lightly — do not grab.',
      highlight: ['throttle', 'frontBrake', 'rearBrake'],
      done: (s, i, _d, w) => w.carSpeed < V50 - 1.5 && i.throttle === 0 && (i.front ?? 0) + (i.rear ?? 0) + i.brake > 0.05 && !s.brakes.front.locked,
      explanation: 'You have started to match it: throttle shut, a light brake, wheels still rolling.',
    },
    {
      id: 'stay',
      title: 'Stay behind',
      instruction: 'Keep slowing with it. Do not close to less than a second, and do not reach it.',
      highlight: ['frontBrake', 'rearBrake'],
      done: (s, _i, d, w) => w.t >= 6 && s.locked && s.running && d.kmh > 18 && d.kmh < 48 && (carGap(w, s.distance) ?? 0) >= Math.max(NOSE, s.speed),
      explanation: 'Still at least a second behind as they settle: the gap did the job.',
    },
  ],
  demo: [
    { step: 'hold', seconds: 2.4, watch: 'A steady throttle holds about 50 km/h: the gap stays around three seconds.', act: () => ({ throttle: 0.28 }) },
    {
      step: 'match',
      seconds: 3.5,
      watch: 'The car’s lights — then throttle shut and a light progressive brake, not a grab.',
      act: (_t, _s, w) => {
        if (w.t < ROOM_BRAKE_AT) return { throttle: 0.28 }
        const e = w.t - ROOM_BRAKE_AT
        return { throttle: 0, front: Math.min(0.22, 0.08 + e * 0.25), rear: 0.06 }
      },
    },
    { step: 'stay', seconds: 4.5, watch: 'Still behind, still rolling, matching the new speed instead of sitting in the old one.', act: () => ({ throttle: 0.12, front: 0, rear: 0, clutch: 0 }) },
  ],
}

// ---- One second, wet: restore the gap, then they brake ----

const WET_BRAKE_AT = 5.2
const wetFollowWorld: WorldSpec = {
  car: {
    gap: 14,
    speed: (w: WorldState) => (w.t < WET_BRAKE_AT ? V50 : Math.max(0, V50 - 0.5 * G * (w.t - WET_BRAKE_AT))),
  },
}

export const followingOneSecondWet: CockpitScenario = {
  id: 'following-one-second-wet',
  title: 'One second behind, in the rain',
  summary: 'You have drifted to about a second on a wet road. Open the gap before they need to stop.',
  setup: { gear: 3, running: true, kmh: 50, throttle: 0.28, surface: 'wet', paused: true },
  view: 'rider',
  world: wetFollowWorld,
  watch: followWatch(),
  situation: 'It is raining. You are at 50 km/h, only about one second behind a car. That is not enough if they stop as a car with ABS can. This ride is restoring the gap that should already have been there. The scenario waits, paused, until you touch a control.',
  objective: 'Ease off until you have two seconds, then when the car brakes, stop without reaching it.',
  actions: ['Close the throttle and let the gap grow to two seconds.', 'When the car brakes, squeeze the front progressively — wet, so gently — with a little rear.', 'Pull the clutch in and stop before you reach it.'],
  mechanical: 'A one-second gap is used up by reaction alone. Wet grip is about half of dry, and a car with ABS still stops quickly. Two seconds has to exist before their lights come on; this ride is making that true.',
  road: 'The car holds 50 km/h long enough for you to drop back, then brakes hard. If you stay at one second you will reach it. If you open the gap first, a wet progressive stop fits.',
  why: 'The advanced skill is not a magic squeeze from one second. It is the gap you already had.',
  mistakes: [TAILGATING, COLLISION, FRONT_LOCK, REAR_LOCK, STALL],
  safety: [RIDE_SAFETY, 'In the wet, two seconds is a minimum. Painted lines, diesel and a car with ABS all ask for more.', MODEL_NOTE],
  steps: [
    {
      id: 'open',
      title: 'Open the gap',
      instruction: 'Close the throttle and let the gap grow to at least two seconds — before the car brakes.',
      highlight: ['throttle'],
      done: (s, i, d, w) => w.t < WET_BRAKE_AT && i.throttle === 0 && d.kmh > 8 && (carGap(w, s.distance) ?? 0) >= 2 * s.speed,
      explanation: 'Two seconds again: the gap that should have been there before anyone braked.',
    },
    {
      id: 'brake',
      title: 'Brake when it does',
      instruction: 'When the car brakes, squeeze the front progressively on the wet road, with a little rear.',
      highlight: ['frontBrake', 'rearBrake', 'throttle'],
      done: (s, i, _d, w) => w.carSpeed < V50 - 2 && i.throttle === 0 && (i.front ?? 0) >= 0.12 && !s.brakes.front.locked,
      explanation: 'A wet squeeze, not a grab: the tyres stay rolling while you use the gap you restored.',
    },
    {
      id: 'stop',
      title: 'Stop behind the car',
      instruction: 'Pull the clutch in and stop before you reach it.',
      highlight: ['clutch', 'frontBrake', 'rearBrake'],
      done: (s, _i, d, w) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (carGap(w, s.distance) ?? 0) >= NOSE,
      explanation: 'Stopped with the two-second gap having done its job on a wet road.',
    },
  ],
  demo: [
    { step: 'open', seconds: 3.8, watch: 'Throttle shut: you drop back while the car holds 50. The gap grows from one second toward two.', act: () => ({ throttle: 0 }) },
    {
      step: 'brake',
      seconds: 2.2,
      watch: 'The car brakes. A gentle wet squeeze — half of a dry emergency — uses the gap you just restored.',
      act: (_t, _s, w) => {
        if (w.t < WET_BRAKE_AT) return { throttle: 0 }
        const e = w.t - WET_BRAKE_AT
        return { throttle: 0, front: Math.min(0.22, e * 0.25), rear: 0.04 }
      },
    },
    { step: 'stop', seconds: 8, watch: 'Clutch in, both brakes held gently: the motorcycle stops short of the car.', act: () => ({ clutch: 1, front: 0.22, rear: 0.04 }) },
  ],
}

// ---- Pothole, seen late ----

export const LATE_HOLE = { at: 16, length: 0.6, height: 0.08 }
const LATE_LIMIT = 25
const onLateHole = (distance: number) => distance >= LATE_HOLE.at && distance <= LATE_HOLE.at + LATE_HOLE.length

export const potholeLate: CockpitScenario = {
  id: 'pothole-late',
  title: 'A pothole, seen late',
  summary: 'The hole is close: finish braking before the wheel drops in, then roll over it upright.',
  setup: { gear: 3, running: true, kmh: 40, throttle: 0.22, paused: true },
  view: 'rider',
  world: { bump: LATE_HOLE, oncoming: { at: 70, speed: () => 50 / 3.6 } },
  watch: (prev, s, i) => {
    if (prev.distance < LATE_HOLE.at && s.distance >= LATE_HOLE.at && s.speed * 3.6 > LATE_LIMIT) return 'bump-fast'
    if (onLateHole(s.distance) && (i.front ?? 0) > 0.05) return 'bump-braking'
    return null
  },
  situation: `You are at about 40 km/h in third. A deep pothole is only ${LATE_HOLE.at} m ahead — close enough that a last-metre swerve is a bad idea, and close enough that you must start slowing now. Oncoming traffic is in the other lane. The scenario waits, paused, until you touch a control.`,
  objective: 'Brake immediately, be off the brakes and below 20 km/h before the hole, roll over it, then ride away.',
  actions: ['Close the throttle and brake at once — there is no time to wait.', 'Release the brakes before the wheel drops in.', 'Roll over it upright, then open the throttle smoothly.'],
  mechanical: `From 40 km/h, ${LATE_HOLE.at} m is enough to get below 20 if you brake at once, and not enough if you wait. Braking on the hole uses the fork travel the hit needs.`,
  road: 'The hole is short and sharp. Hit fast, or still on the brakes, it slams the fork. Hit slow, upright, off the brakes, it is a jolt you can ride.',
  why: 'Seen late, a pothole is still a “finish braking first” problem. It is not a swerve into the other lane.',
  mistakes: [
    { id: 'bump-fast', title: 'Too fast into the pothole', text: `You reached it above ${LATE_LIMIT} km/h. Brake at once — this hole is close.` },
    { id: 'bump-braking', title: 'Braking in the pothole', text: 'The front brake was on as you dropped in. Finish braking before it, then roll over.' },
    STALL,
    FRONT_LOCK,
    SHIFT,
  ],
  safety: [RIDE_SAFETY, 'If there is room in your lane and you see a hole early, a small change of line is better. Never swerve into oncoming traffic.', MODEL_NOTE],
  steps: [
    {
      id: 'slow',
      title: 'Brake at once',
      instruction: 'Close the throttle and brake to below 20 km/h — before you reach the pothole.',
      highlight: ['throttle', 'frontBrake', 'rearBrake'],
      done: (s, i, d) => s.distance < LATE_HOLE.at && d.kmh > 3 && d.kmh < 20 && i.throttle === 0,
      explanation: 'Slow, in second, with the hole still ahead: the braking is done before you reach it.',
    },
    {
      id: 'over',
      title: 'Roll over it',
      instruction: 'Release the brakes and roll over the pothole at a steady speed, upright.',
      highlight: ['frontWheel', 'rearWheel'],
      done: (s, i, d) => s.distance > LATE_HOLE.at + LATE_HOLE.length && d.kmh > 2 && (i.front ?? 0) === 0,
      explanation: 'The fork had its full travel for the hole, and the motorcycle stayed upright.',
    },
    {
      id: 'away',
      title: 'Ride away',
      instruction: 'Open the throttle smoothly and ride away above 25 km/h.',
      highlight: ['throttle', 'clutch'],
      done: (s, i, d) => s.distance > LATE_HOLE.at + LATE_HOLE.length && i.throttle > 0 && d.kmh > 25 && s.locked,
      explanation: 'Over and away, with no harsh jolt and no braking in the hole.',
    },
  ],
  demo: [
    {
      step: 'slow',
      seconds: 5,
      watch: 'Braking starts immediately; below about 18 km/h the brakes come off so the fork is free for the hole.',
      act: (t, s) => (s.speed * 3.6 > 16 ? { throttle: 0, front: Math.min(0.32, 0.08 + t * 0.7), rear: 0.08 } : { front: 0, rear: 0, clutch: 1, gear: 2 }),
    },
    { step: 'over', seconds: 5, watch: 'Brakes off, clutch out with a touch of throttle: the motorcycle rolls over the hole.', act: (t) => ({ clutch: Math.max(0, 1 - t * 1.2), throttle: 0.12 }) },
    { step: 'away', seconds: 7, watch: 'Over it: the throttle opens smoothly and the motorcycle rides away.', act: (t) => ({ throttle: Math.min(0.7, 0.2 + t * 0.35), clutch: 0, gear: 2 }) },
  ],
}

// ---- Overtake: tall gear, wait, change down ----

const V40 = 40 / 3.6
const tallGear: WorldSpec = { car: { gap: 24, speed: () => V40, kind: 'truck' }, oncoming: { at: 95, speed: () => 60 / 3.6 } }

export const overtakeGap: CockpitScenario = {
  id: 'overtake-gap',
  title: 'A gap that looks possible',
  summary: 'A slow vehicle, you are in fifth: hold the gap, change down, and stay behind until the road is clearly clear.',
  setup: { gear: 5, running: true, kmh: 40, throttle: 0.22, paused: true },
  view: 'rider',
  world: tallGear,
  watch: followWatch(),
  situation: 'You are about two seconds behind a slow vehicle doing 40 km/h, in fifth. This cockpit is a single lane: it cannot show pulling out. The safe work is to hold the gap and change down so the engine would pull if the road later is clear. The scenario waits, paused, until you touch a control.',
  objective: 'Match its speed, change down to third without closing in, and stay behind.',
  actions: ['Hold about 40 km/h so the gap stays at two seconds.', 'Pull the clutch in, select third, and feed the clutch out without surging forward.', 'Stay behind. This ride has no other lane to use.'],
  mechanical: 'Fifth at 40 km/h is below the engine’s pull. Third puts it near the torque peak, so a later pass would take less time on the wrong side. Closing up does not make a pass safer.',
  road: 'The vehicle ahead holds a steady 40 km/h. An oncoming car is in the other lane. Changing down should not make you shoot up to its bumper, and this ride has no pass to take.',
  why: 'A gap that looks possible is still a wait until you can see a clear road well beyond the pass — and until you are in a gear that pulls. This ride is those two things.',
  mistakes: [TAILGATING, COLLISION, STALL, SHIFT],
  safety: [RIDE_SAFETY, 'Only pass when you can see a clear road well beyond what the pass will take, in a gear that pulls hard.', MODEL_NOTE],
  steps: [
    {
      id: 'match',
      title: 'Match its speed',
      instruction: 'Hold about 40 km/h so you stay two seconds behind — do not close the gap.',
      highlight: ['throttle'],
      done: (s, _i, d, w) => w.t >= 1.5 && s.locked && d.kmh > 34 && d.kmh < 46 && (carGap(w, s.distance) ?? 0) >= 2 * s.speed,
      explanation: 'Same speed as the vehicle ahead, with a two-second gap still there, still in fifth.',
    },
    {
      id: 'down',
      title: 'Change down to third',
      instruction: 'Clutch in, select third, clutch out smoothly — without closing the two-second gap.',
      highlight: ['clutch', 'gearbox', 'throttle'],
      done: (s, i, d, w) => i.gear === 3 && s.locked && d.kmh > 32 && d.kmh < 48 && (carGap(w, s.distance) ?? 0) >= 2 * s.speed,
      explanation: 'Third, still two seconds behind: the engine would pull if a later, visible gap appeared.',
    },
    {
      id: 'wait',
      title: 'Stay behind',
      instruction: 'Keep that two-second gap in third. Do not close in.',
      highlight: ['throttle'],
      done: (s, i, d, w) => w.t >= 6.5 && i.gear === 3 && s.locked && d.kmh > 32 && d.kmh < 50 && (carGap(w, s.distance) ?? 0) >= 1.8 * s.speed,
      explanation: 'Still two seconds behind, in a pulling gear: ready for a pass you can actually see.',
    },
  ],
  demo: [
    { step: 'match', seconds: 2.2, watch: 'A steady throttle in fifth holds about 40 km/h: the gap stays at two seconds.', act: () => ({ throttle: 0.22 }) },
    {
      step: 'down',
      seconds: 2.4,
      watch: 'Clutch in, throttle shut, a press to third, then the clutch comes out with a little throttle so the motorcycle does not surge.',
      act: (t) => (t < 0.35 ? { clutch: 1, throttle: 0 } : t < 0.5 ? { clutch: 1, throttle: 0, gear: 3 } : { clutch: Math.max(0, 1 - (t - 0.5) * 1.4), throttle: 0.16, gear: 3 }),
    },
    { step: 'wait', seconds: 5, watch: 'Third, still two seconds behind. Closing in would steal the time a later pass needs.', act: () => ({ throttle: 0.18, gear: 3, clutch: 0 }) },
  ],
}

export const progressiveCockpitScenarios = [pedestrianAhead, followingWithRoom, followingOneSecondWet, potholeLate, overtakeGap]
