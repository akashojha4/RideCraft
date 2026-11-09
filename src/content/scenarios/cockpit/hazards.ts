import { G } from '@/lib/mechanics/braking'
import { NOSE, carGap, personGap, type WorldSpec, type WorldState } from '@/lib/simulation/cockpitWorld'
import type { MistakeId } from '@/lib/simulation/ridingMistakes'
import type { CockpitScenario, WorldWatch } from './types'

/*
 * Extra cockpit rides that match decision scenarios the picker did not yet have: a pothole,
 * a sudden obstacle, staying behind to overtake, and a highway following gap. Night, a
 * pillion, cars behind and bends live in fullWorld.ts.
 */

const RIDE_SAFETY = 'Practise these situations for real only with a qualified instructor, in a closed area first.'
const MODEL_NOTE = 'This simulator is a simplified model: real traffic and a real motorcycle will behave differently.'

const tooClose = (gap: number, speed: number) => speed > 1 && gap < Math.max(2, speed)

function followWatch(): WorldWatch {
  return (prev, s, _i, _d, w) => {
    const before = carGap(w, prev.distance)
    const now = carGap(w, s.distance)
    if (before != null && now != null) {
      if (before >= NOSE && now < NOSE) return 'collision'
      if (!tooClose(before, prev.speed) && tooClose(now, s.speed) && now >= NOSE) return 'tailgating'
    }
    return null
  }
}

const COLLISION = { id: 'collision' as MistakeId, title: 'Reaching the vehicle ahead', text: 'You ran into the vehicle ahead. Leave more room, and slow as soon as it does.' }
const TAILGATING = { id: 'tailgating' as MistakeId, title: 'Too close', text: 'You closed to less than a second behind — not enough time to react if it stops. Ease off and let the gap grow.' }

// ---- Pothole ----

/** A short, sharp hole in the wheel track, m. */
export const HOLE = { at: 40, length: 0.6, height: 0.08 }
/** Above this entry speed the jolt is treated as too hard (km/h). */
export const HOLE_LIMIT = 25
const hole: WorldSpec = { bump: HOLE, oncoming: { at: 90, speed: () => 50 / 3.6 } }
const onHole = (distance: number) => distance >= HOLE.at && distance <= HOLE.at + HOLE.length

export const pothole: CockpitScenario = {
  id: 'pothole',
  title: 'A pothole in your path',
  summary: 'Slow before a pothole, roll over it upright and off the brakes, then ride away.',
  setup: { gear: 4, running: true, kmh: 50, throttle: 0.25, paused: true },
  view: 'rider',
  world: hole,
  watch: (prev, s, i) => {
    if (prev.distance < HOLE.at && s.distance >= HOLE.at && s.speed * 3.6 > HOLE_LIMIT) return 'bump-fast'
    if (onHole(s.distance) && (i.front ?? 0) > 0.05) return 'bump-braking'
    return null
  },
  situation: `You are riding at about 50 km/h in fourth. A deep pothole is ${HOLE.at} m ahead, right in your wheel track. There is room in your lane, and an oncoming car is in the other lane. On a real road you would often ease around it; this ride is the case where you have to go over it. The scenario waits, paused, until you touch a control.`,
  objective: 'Slow before the hole, roll over it upright and off the brakes, then ride away smoothly.',
  actions: ['Close the throttle and brake to below 20 km/h before the hole, changing down to second.', 'Release the brakes and roll over it at a steady speed, upright.', 'Once over it, open the throttle smoothly and ride away.'],
  mechanical: 'A short hole punches the front wheel up faster than a long speed breaker. The fork must compress in less time; braking beforehand leaves the fork already compressed, so it has less travel left. Second gear keeps the engine from labouring at the low speed.',
  road: 'Hit fast, the far edge slams the wheel and can throw the tyre off the road for a moment. Hit on the brakes, the fork bottoms. Hit leaned over, the front can tuck. Slow, upright, off the brakes is the least you can ask of the tyre.',
  why: 'Potholes are easy to miss until late. If you see one early enough to move around it, do that. If you must go over it, finish the slowing first so the suspension can do its job.',
  mistakes: [
    { id: 'bump-fast', title: 'Too fast into the pothole', text: `You reached it above ${HOLE_LIMIT} km/h: a short hole at that speed slams the fork. Brake earlier.` },
    { id: 'bump-braking', title: 'Braking in the pothole', text: 'The front brake was on as you dropped in: the fork was already compressed, with less travel for the hole. Finish braking before it, then roll over.' },
    { id: 'stall', title: 'Stalling', text: 'Slowing right down in a high gear with the clutch out dragged the engine down. Change down, or pull the clutch in.' },
    { id: 'front-lock', title: 'Locking the front wheel', text: 'Squeeze the front brake progressively while you are still on smooth road.' },
    { id: 'shift-without-clutch', title: 'Changing gear without the clutch', text: 'Pull the clutch in fully before moving the gear lever.' },
  ],
  safety: [RIDE_SAFETY, 'On a real motorcycle, if there is room in your lane, a small smooth change of line is better than hitting the hole. Never swerve into oncoming traffic.', MODEL_NOTE],
  steps: [
    {
      id: 'slow',
      title: 'Slow down before it',
      instruction: 'Close the throttle, brake to below 20 km/h and change down to second — before you reach the pothole.',
      highlight: ['throttle', 'frontBrake', 'rearBrake', 'gearbox'],
      done: (s, i, d) => s.distance < HOLE.at && d.kmh > 3 && d.kmh < 20 && i.gear === 2,
      explanation: 'Slow, in second, with the hole still ahead: the braking is done before you reach it.',
    },
    {
      id: 'over',
      title: 'Roll over it',
      instruction: 'Release the brakes and roll over the pothole at a steady speed, upright.',
      highlight: ['frontWheel', 'rearWheel'],
      done: (s, i, d) => s.distance > HOLE.at + HOLE.length && d.kmh > 2 && (i.front ?? 0) === 0,
      explanation: 'The fork had its full travel for the hole, and the motorcycle stayed upright.',
    },
    {
      id: 'away',
      title: 'Ride away',
      instruction: 'Open the throttle smoothly and ride away above 25 km/h.',
      highlight: ['throttle', 'clutch'],
      done: (s, i, d) => s.distance > HOLE.at + HOLE.length && i.throttle > 0 && d.kmh > 25 && s.locked,
      explanation: 'Over and away, with no harsh jolt and no braking in the hole.',
    },
  ],
  demo: [
    {
      step: 'slow',
      seconds: 8,
      watch: 'Braking starts well before the hole; below about 18 km/h the clutch goes in and the lever presses down to second.',
      act: (_t, s) => (s.speed * 3.6 > 16 ? { throttle: 0, front: 0.32, rear: 0.1 } : { front: 0, rear: 0, clutch: 1, gear: 2 }),
    },
    { step: 'over', seconds: 8, watch: 'Brakes off, clutch out with a touch of throttle: the motorcycle rolls over the hole — watch for a short, sharp jolt.', act: (t) => ({ clutch: Math.max(0, 1 - t * 1.2), throttle: 0.12 }) },
    { step: 'away', seconds: 6, watch: 'Over it: the throttle opens smoothly and the motorcycle rides away.', act: (t) => ({ throttle: Math.min(0.6, 0.15 + t * 0.3), clutch: 0 }) },
  ],
}

// ---- Sudden obstacle ----

/** A dog frozen in the rider's lane, this far ahead at the start, m. */
const HAZARD = 26

function dogWatch(): WorldWatch {
  return (prev, s, _i, _d, w) => {
    const before = personGap(w, prev.distance)
    const now = personGap(w, s.distance)
    if (before != null && now != null && before >= NOSE && now < NOSE) return 'collision'
    return null
  }
}

export const suddenObstacle: CockpitScenario = {
  id: 'sudden-obstacle',
  title: 'A sudden obstacle',
  summary: 'A dog has frozen in your lane: brake immediately, hard and straight, and stop before you reach it.',
  setup: { gear: 3, running: true, kmh: 50, throttle: 0.25, paused: true },
  view: 'rider',
  world: { person: { at: HAZARD, kind: 'dog' } },
  watch: dogWatch(),
  situation: `You are riding at 50 km/h in third. A dog has run out from the left and frozen in the middle of your lane, ${HAZARD} m ahead. The scenario waits, paused, until you touch a control. In this cockpit you act at once; on a real road a second of surprise uses about 14 m at this speed.`,
  objective: 'Brake immediately, hard and straight, and stop before you reach the dog, without locking a wheel.',
  actions: ['Close the throttle and squeeze the front brake firmly but progressively, with the rear brake too.', 'Stay upright — do not try to swerve while braking at the limit.', 'Pull the clutch in and hold both brakes until you stop.'],
  mechanical: 'At 50 km/h, hard braking at about 0.8 g takes roughly 12 m plus however far you cover before you act. Grabbing the lever asks for full force before the load has moved onto the front tyre and locks it. Braking and turning share the same grip: both at full strength exceeds it.',
  road: 'The motorcycle pitches forward, the fork compresses, and almost all the load sits on the front tyre. Stay in a straight line so that tyre only has to brake. If you cannot stop in time and another lane is clearly empty, a swerve (eyes on the gap, a firm press on that handlebar) is a different skill — not this ride.',
  why: 'A dog in the lane leaves little time. Braking hard at once always helps — even if you cannot stop, you hit slower. Do not mix a limit brake with a swerve.',
  mistakes: [
    { id: 'collision' as MistakeId, title: 'Reaching the dog', text: 'You ran into the dog. Brake at once, in a straight line — hoping it will move spends the metres you had.' },
    { id: 'front-lock', title: 'Locking the front wheel', text: 'A grabbed lever asks for full force before the load has moved onto the front tyre. Release and squeeze again — on a real motorcycle a locked front wheel usually means a fall.' },
    { id: 'rear-lock', title: 'Locking the rear wheel', text: 'Hard braking takes almost all the load off the rear tyre. Ease off the pedal.' },
    { id: 'stall', title: 'Stalling as you stop', text: 'Pull the clutch in as you come to a stop.' },
  ],
  safety: [RIDE_SAFETY, 'Brake hard only while upright and travelling straight. If you must swerve, release the brake first. ABS stops the wheels locking; it does not invent extra distance.', MODEL_NOTE],
  steps: [
    {
      id: 'brake',
      title: 'Brake immediately',
      instruction: 'Close the throttle and squeeze the front brake firmly — with the rear too — until you are slowing at 0.6 g or more, without locking a wheel.',
      highlight: ['frontBrake', 'rearBrake', 'throttle'],
      done: (s, i) => i.throttle === 0 && (i.front ?? 0) > 0 && -s.acceleration >= 0.6 * G && !s.brakes.front.locked && !s.brakes.rear.locked,
      explanation: 'Most of the load is now on the front tyre: it is doing most of the stopping, close to the limit of its grip.',
    },
    {
      id: 'stop',
      title: 'Stop before the dog',
      instruction: 'Stay straight, pull the clutch in and hold both brakes until you stop — before you reach it.',
      highlight: ['clutch', 'frontBrake', 'rearBrake'],
      done: (s, _i, d, w) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (personGap(w, s.distance) ?? 0) >= NOSE,
      explanation: 'Stopped with room to spare, engine running, no wheel locked, and still in a straight line.',
    },
  ],
  demo: [
    { step: 'brake', seconds: 1.2, watch: 'Throttle shut at once and the front brake squeezed hard but progressively, with some rear: the motorcycle pitches forward.', act: (t) => ({ throttle: 0, front: Math.min(0.6, t * 1.2), rear: 0.1 }) },
    { step: 'stop', seconds: 4, watch: 'Clutch in, both brakes held, still straight: the motorcycle stops short of the dog, engine running, no wheel locked.', act: () => ({ clutch: 1, front: 0.6, rear: 0.1 }) },
  ],
}

// ---- Overtaking (stay behind) ----

const V40 = 40 / 3.6
const truck: WorldSpec = { car: { gap: 24, speed: () => V40, kind: 'truck' }, oncoming: { at: 110, speed: () => 60 / 3.6 } }

export const overtaking: CockpitScenario = {
  id: 'overtaking',
  title: 'Waiting to overtake',
  summary: 'A slow vehicle ahead: hold a two-second gap and stay behind until the road is clearly clear.',
  setup: { gear: 5, running: true, kmh: 40, throttle: 0.22, paused: true },
  view: 'rider',
  world: truck,
  watch: followWatch(),
  situation: 'You are about two seconds behind a slow truck doing 40 km/h, in fifth. An oncoming car is in the other lane. This cockpit cannot show pulling out. The safe choice when you cannot see a clear road well beyond the pass is to stay behind. The scenario waits, paused, until you touch a control.',
  objective: 'Match its speed, hold a two-second gap, and stay there — do not close in.',
  actions: ['Hold about 40 km/h so the gap does not shrink.', 'Keep at least two seconds behind (at 40 km/h that is about 22 m).', 'Stay behind. Closing in does not make a pass safer, and this ride has no other lane to use.'],
  mechanical: 'A two-second gap is twice your speed in metres per second. At 40 km/h that is about 22 m — room to see, decide and brake if the vehicle ahead stops. Closing up steals that time. Passing belongs in a lower gear with a long, empty road; this ride is the wait.',
  road: 'The truck holds a steady 40 km/h. An oncoming car is in the other lane. If you open the throttle you close on the truck; if you ease off the gap grows. Staying behind is the whole exercise.',
  why: 'If in doubt, do not overtake. A few seconds behind a slow vehicle is always safer than a pass you have not got the road for. When you later do pass, change down first so the engine can pull.',
  mistakes: [
    TAILGATING,
    COLLISION,
    { id: 'stall', title: 'Stalling', text: 'If you slow too far in fifth, the engine labours. Open the throttle a little, or change down.' },
    { id: 'shift-without-clutch', title: 'Changing gear without the clutch', text: 'Pull the clutch in fully before moving the gear lever.' },
  ],
  safety: [RIDE_SAFETY, 'Only pass when you can see a clear road well beyond what the pass will take, in a gear that pulls hard. Never cross a solid centre line where that is not allowed.', MODEL_NOTE],
  steps: [
    {
      id: 'match',
      title: 'Match its speed',
      instruction: 'Hold about 40 km/h so you stay behind — do not close the gap.',
      highlight: ['throttle'],
      done: (s, _i, d, w) => w.t >= 1.5 && s.locked && d.kmh > 34 && d.kmh < 46 && (carGap(w, s.distance) ?? 0) >= 2 * s.speed,
      explanation: 'Same speed as the vehicle ahead, with a two-second gap still there.',
    },
    {
      id: 'wait',
      title: 'Stay behind',
      instruction: 'Keep that two-second gap for several seconds. Do not close in.',
      highlight: ['throttle'],
      done: (s, _i, d, w) => w.t >= 5 && s.locked && d.kmh > 34 && d.kmh < 46 && (carGap(w, s.distance) ?? 0) >= 2 * s.speed,
      explanation: 'Still two seconds behind: patience, not a closer follow, is what makes a later pass safer.',
    },
  ],
  demo: [
    { step: 'match', seconds: 2.2, watch: 'A steady throttle holds about 40 km/h: the gap stays at two seconds instead of shrinking.', act: () => ({ throttle: 0.22 }) },
    { step: 'wait', seconds: 4, watch: 'The rider stays there. Closing in would steal the time needed if the vehicle ahead braked.', act: () => ({ throttle: 0.22 }) },
  ],
}

// ---- Highway following ----

const V80 = 80 / 3.6
/** The car ahead starts braking this many seconds in. */
const HIGHWAY_BRAKE_AT = 3.5
const highwayWorld: WorldSpec = {
  car: {
    gap: 50,
    speed: (w: WorldState) => (w.t < HIGHWAY_BRAKE_AT ? V80 : Math.max(0, V80 - 0.75 * G * (w.t - HIGHWAY_BRAKE_AT))),
  },
}

export const highway: CockpitScenario = {
  id: 'highway',
  title: 'Highway following',
  summary: 'Hold a two-second gap at 80 km/h; when the car ahead brakes hard, stop without hitting it.',
  setup: { gear: 5, running: true, kmh: 80, throttle: 0.35, paused: true },
  view: 'rider',
  world: highwayWorld,
  watch: followWatch(),
  situation: `You are following a car at 80 km/h on a dual carriageway, about 50 m behind — a little more than two seconds. After a few seconds it brakes hard (about 0.75 g). The scenario waits, paused, until you touch a control.`,
  objective: 'Hold a two-second gap, then brake hard as soon as the car does, and stop without reaching it.',
  actions: ['Keep about 80 km/h so the gap stays at two seconds or more.', 'When the car brakes, close the throttle and squeeze the front brake firmly, with the rear too.', 'Pull the clutch in and stop before you reach it.'],
  mechanical: 'At 80 km/h you cover 22 m every second. A one-second gap is used up by reaction alone; a two-second gap also covers the extra distance a car with ABS can stop in. Hard braking from 80 km/h still needs roughly 35 m plus reaction.',
  road: 'The car holds 80 km/h, then slows much faster than a motorcycle without ABS typically can. If you were only a second behind, you would reach it during your first second of braking. Two seconds leaves room if you react at once.',
  why: 'Highway speed turns small gaps into no time. Two seconds on a dry road is the minimum; more in rain or in a pack of traffic that keeps closing up.',
  mistakes: [
    TAILGATING,
    COLLISION,
    { id: 'front-lock', title: 'Locking the front wheel', text: 'Squeeze progressively. At this speed a locked front is a fall.' },
    { id: 'rear-lock', title: 'Locking the rear wheel', text: 'Hard braking unloads the rear. A light pedal is enough.' },
    { id: 'stall', title: 'Stalling as you stop', text: 'Pull the clutch in as you come to a stop.' },
  ],
  safety: [RIDE_SAFETY, 'Leave more than two seconds in rain, spray or poor visibility. Do not sit in another vehicle’s blind spot.', MODEL_NOTE],
  steps: [
    {
      id: 'hold',
      title: 'Hold a two-second gap',
      instruction: 'Stay around 80 km/h so the gap to the car stays at least two seconds.',
      highlight: ['throttle'],
      done: (s, _i, d, w) => w.t >= 2 && s.locked && d.kmh > 70 && d.kmh < 90 && (carGap(w, s.distance) ?? 0) >= 2 * s.speed,
      explanation: 'Two seconds behind at motorway speed: room to see brake lights and still stop.',
    },
    {
      id: 'brake',
      title: 'Brake when it does',
      instruction: 'When the car brakes, close the throttle and squeeze the front brake firmly — with the rear too.',
      highlight: ['frontBrake', 'rearBrake', 'throttle'],
      done: (s, i, _d, w) => w.carSpeed < V80 - 2 && i.throttle === 0 && (i.front ?? 0) >= 0.3 && !s.brakes.front.locked,
      explanation: 'You have started a hard stop while the car is already slowing — using the gap instead of eating it.',
    },
    {
      id: 'stop',
      title: 'Stop behind the car',
      instruction: 'Pull the clutch in and hold both brakes until you stop — before you reach the car.',
      highlight: ['clutch', 'frontBrake', 'rearBrake'],
      done: (s, _i, d, w) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (carGap(w, s.distance) ?? 0) >= NOSE,
      explanation: 'Stopped with the two-second gap having done its job.',
    },
  ],
  demo: [
    { step: 'hold', seconds: 2.5, watch: 'A steady throttle holds about 80 km/h: the gap stays a little over two seconds.', act: () => ({ throttle: 0.35 }) },
    {
      step: 'brake',
      seconds: 4,
      watch: 'The car’s brake lights — then throttle shut and a progressive, firm front brake with some rear.',
      act: (_t, _s, w) => {
        if (w.t < HIGHWAY_BRAKE_AT) return { throttle: 0.35 }
        const e = w.t - HIGHWAY_BRAKE_AT
        return { throttle: 0, front: Math.min(0.55, 0.15 + e * 0.5), rear: 0.08 }
      },
    },
    { step: 'stop', seconds: 6, watch: 'Clutch in, both brakes held: the motorcycle stops short of the car.', act: () => ({ clutch: 1, front: 0.5, rear: 0.08 }) },
  ],
}

export const hazardScenarios = [pothole, suddenObstacle, overtaking, highway]
