import { G } from '@/lib/mechanics/braking'
import { MASS } from '@/lib/mechanics/powertrain'
import { NOSE, aheadGap, behindGap, carGap, crossGap, lineGap, personGap, type RideInputs, type WorldSpec, type WorldState } from '@/lib/simulation/cockpitWorld'
import type { MistakeId } from '@/lib/simulation/ridingMistakes'
import type { CockpitScenario, WorldWatch } from './types'

/*
 * Cockpit rides that need the fuller world: a person, a car behind, oncoming, a crossing car,
 * a bend in-lane, night beam, extra mass. Each is the same road the decision scenario shows,
 * seen from the seat.
 */

const RIDE_SAFETY = 'Practise these situations for real only with a qualified instructor, in a closed area first.'
const MODEL_NOTE = 'This simulator is a simplified model: real traffic and a real motorcycle will behave differently.'

const tooClose = (gap: number, speed: number) => speed > 1 && gap < Math.max(2, speed)
const matchRider = (_w: WorldState, _d: number, ride?: RideInputs) => Math.max(0, ride?.speed ?? 0)

function worldWatch(spec: WorldSpec): WorldWatch {
  return (prev, s, _i, _d, w) => {
    const before = aheadGap(w, prev.distance)
    const now = aheadGap(w, s.distance)
    if (before != null && now != null) {
      if (before >= NOSE && now < NOSE) return 'collision'
      if (!tooClose(before, prev.speed) && tooClose(now, s.speed) && now >= NOSE) return 'tailgating'
    }
    const b0 = behindGap(w, prev.distance)
    const b1 = behindGap(w, s.distance)
    if (b0 != null && b1 != null && b0 >= NOSE && b1 < NOSE) return 'rear-ended'
    const line0 = lineGap(spec, prev.distance)
    const line1 = lineGap(spec, s.distance)
    if (line0 != null && line1 != null && line0 >= 0 && line1 < 0 && w.signal === 'red') return 'ran-red'
    const cg = crossGap(spec, s.distance)
    if (cg != null && Math.abs(cg) < 2 && w.crossX != null && Math.abs(w.crossX) < 1.5) return 'collision'
    return null
  }
}

const COLLISION = { id: 'collision' as MistakeId, title: 'Reaching the vehicle or person ahead', text: 'You ran into what was in your lane. Leave more room, and slow as soon as you see it.' }
const TAILGATING = { id: 'tailgating' as MistakeId, title: 'Too close', text: 'You closed to less than a second behind — not enough time to react if it stops. Ease off and let the gap grow.' }
const REAR_ENDED = { id: 'rear-ended' as MistakeId, title: 'Hit from behind', text: 'The following car reached you. An early, progressive brake light is how they see you stopping — a grab gives them no time.' }
const STALL = { id: 'stall' as MistakeId, title: 'Stalling', text: 'Pull the clutch in as you come to a stop, or change down before the engine labours.' }
const FRONT_LOCK = { id: 'front-lock' as MistakeId, title: 'Locking the front wheel', text: 'Squeeze the front brake progressively. A grabbed lever locks the wheel.' }
const REAR_LOCK = { id: 'rear-lock' as MistakeId, title: 'Locking the rear wheel', text: 'Hard braking unloads the rear. A light pedal is enough.' }
const SHIFT = { id: 'shift-without-clutch' as MistakeId, title: 'Changing gear without the clutch', text: 'Pull the clutch in fully before moving the gear lever.' }
const ROLL = { id: 'roll-back' as MistakeId, title: 'Rolling back', text: 'The brake was released before the clutch was driving hard enough. Keep the rear brake on until you feel the bite.' }
const STOP_MISTAKES = [COLLISION, FRONT_LOCK, REAR_LOCK, STALL]
const FOLLOW_MISTAKES = [TAILGATING, COLLISION, FRONT_LOCK, REAR_LOCK, STALL]

const toLine = (s: { speed: number; distance: number }, at: number) => Math.min(0.45, Math.max(0.08, (s.speed * s.speed) / (2 * Math.max(0.5, at - s.distance)) / 9.81 - 0.04))

const LOW_BEAM = 40
const TRACTOR = 120
const nightWorld: WorldSpec = {
  car: { gap: TRACTOR, kind: 'tractor' },
  oncoming: { at: 150, speed: () => 60 / 3.6 },
  beam: LOW_BEAM,
}

export const nightRiding: CockpitScenario = {
  id: 'night-riding',
  title: 'Night, low beam',
  summary: 'An unlit road: ride at a speed you can stop in the beam, then stop for the unlit hazard.',
  setup: { gear: 4, running: true, kmh: 70, throttle: 0.3, paused: true },
  view: 'rider',
  world: nightWorld,
  watch: worldWatch(nightWorld),
  situation: `It is night on an unlit road. You are at about 70 km/h in fourth. Low beam shows about ${LOW_BEAM} m. An oncoming car is in the other lane. Somewhere ahead, beyond the beam, an unlit tractor sits in your lane. The scenario waits, paused, until you touch a control.`,
  objective: 'Slow to a speed you can stop in the beam, stay on low beam, and stop short of the tractor once it appears.',
  actions: ['Close the throttle and brake until you are around 50 km/h.', 'Hold that speed on low beam — do not out-ride the light.', 'When the tractor appears in the beam, stop short of it.'],
  mechanical: 'At 70 km/h a hard stop needs more than 40 m. At 50 km/h it fits inside the beam. The tractor is unlit until it is inside that 40 m.',
  road: 'The road is dark beyond the beam. The oncoming car is why the beam stays dipped. The unlit tractor sits in your lane — you only see it once the light reaches it.',
  why: 'Ride at a speed that lets you stop in the distance you can see. High beam would dazzle the oncoming driver; 70 km/h on low beam is already too fast.',
  mistakes: STOP_MISTAKES,
  safety: [RIDE_SAFETY, 'Dip for oncoming traffic. Never out-ride the beam.', MODEL_NOTE],
  steps: [
    {
      id: 'slow',
      title: 'Slow into the beam',
      instruction: 'Close the throttle and brake until you are around 50 km/h, while the road ahead is still dark.',
      highlight: ['throttle', 'frontBrake', 'rearBrake'],
      done: (s, i, d) => i.throttle === 0 && d.kmh < 58 && d.kmh > 36 && s.distance < 60 && !s.brakes.front.locked,
      explanation: 'About 50 km/h: a stop can now fit in the 40 m the beam shows.',
    },
    {
      id: 'hold',
      title: 'Stay in the light',
      instruction: 'Hold around 50 km/h on low beam. Do not speed up.',
      highlight: ['throttle'],
      done: (s, _i, d) => s.locked && d.kmh > 32 && d.kmh < 58 && s.distance > 12 && s.distance < 95,
      explanation: 'Still inside a stop that the beam can cover, with the oncoming car in the other lane.',
    },
    {
      id: 'stop',
      title: 'Stop for the tractor',
      instruction: 'When the unlit tractor appears in the beam, pull the clutch in and stop short of it.',
      highlight: ['clutch', 'frontBrake', 'rearBrake'],
      done: (s, _i, d, w) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (carGap(w, s.distance) ?? 0) >= NOSE,
      explanation: 'Stopped short of the tractor, still in your lane, without dazzling anyone.',
    },
  ],
  demo: [
    { step: 'slow', seconds: 2.4, watch: 'Throttle shut and a progressive brake: 70 falls toward 50 before anything is visible in the beam.', act: () => ({ throttle: 0, front: 0.12, rear: 0.04 }) },
    { step: 'hold', seconds: 3.5, watch: 'Around 50 km/h on low beam: the stop would still fit in the light.', act: () => ({ throttle: 0.38, front: 0, rear: 0 }) },
    { step: 'stop', seconds: 8, watch: 'The tractor appears in the beam. Clutch in, brakes held: the motorcycle stops short of it.', act: (_t, s, w) => ((carGap(w, s.distance) ?? 99) < 50 ? { throttle: 0, clutch: 1, front: 0.35, rear: 0.08 } : { throttle: 0.32 }) },
  ],
}

const P_LINE = 40
const pillionWorld: WorldSpec = { signal: { at: P_LINE, colour: () => 'red' } }

export const pillion: CockpitScenario = {
  id: 'pillion',
  title: 'A passenger, a red light',
  summary: '70 kg extra on the motorcycle: start braking earlier and stop at the line.',
  setup: { gear: 2, running: true, kmh: 40, throttle: 0.15, extraMass: 70, paused: true },
  view: 'rider',
  world: pillionWorld,
  watch: worldWatch(pillionWorld),
  situation: `You are carrying a 70 kg passenger, at about 40 km/h in second, toward a red light ${P_LINE} m ahead. The same squeeze at the usual point is no longer enough. The scenario waits, paused, until you touch a control.`,
  objective: 'Brake earlier than you would alone, progressively, and stop at the line without throwing the passenger forward.',
  actions: ['Close the throttle as soon as you see the light.', 'Start braking about 22 m before the line — earlier than the usual 15 m.', 'Pull the clutch in and stop at the line.'],
  mechanical: 'The brakes are the same; there is a third more mass to stop. Extra distance is how you get the same calm stop. A sudden grab throws the passenger into your back.',
  road: 'The light is already red. The stop line is where the front wheel must stop. Smooth, early braking is what the passenger can stay with.',
  why: 'A pillion is not a reason to brake harder at the last moment. It is a reason to start sooner.',
  mistakes: [
    { id: 'ran-red', title: 'Crossing on red', text: 'You reached the line still rolling. Brake earlier — the extra mass needs more distance.' },
    STALL,
    FRONT_LOCK,
    REAR_LOCK,
  ],
  safety: [RIDE_SAFETY, 'Tell a passenger before you slow. A smooth stop is part of looking after them.', MODEL_NOTE],
  steps: [
    {
      id: 'ease',
      title: 'Close the throttle',
      instruction: 'Close the throttle. The light is red and still well ahead.',
      highlight: ['throttle'],
      done: (s, i, d) => i.throttle === 0 && d.kmh > 8 && s.distance < P_LINE - 18,
      explanation: 'Engine braking has started, with the line still far enough to use the extra distance.',
    },
    {
      id: 'brake',
      title: 'Brake earlier',
      instruction: 'Squeeze both brakes progressively — start while you still have about 22 m to the line.',
      highlight: ['frontBrake', 'rearBrake'],
      done: (s, i, d) => (i.front ?? 0) + (i.rear ?? 0) > 0.08 && d.kmh > 4 && s.distance < P_LINE - 12 && !s.brakes.front.locked,
      explanation: 'Braking has started earlier than the usual point, while the motorcycle is still upright and settled.',
    },
    {
      id: 'stop',
      title: 'Stop at the line',
      instruction: 'Pull the clutch in and stop at the stop line — not past it.',
      highlight: ['clutch', 'frontBrake', 'rearBrake'],
      done: (s, _i, d, w) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (lineGap(pillionWorld, s.distance) ?? -1) >= 0 && (lineGap(pillionWorld, s.distance) ?? 99) <= 18 && w.signal === 'red',
      explanation: 'Stopped at the line, passenger still with you, engine idling.',
    },
  ],
  demo: [
    { step: 'ease', seconds: 1, watch: 'Throttle closes at once: the extra mass is already a reason not to wait.', act: () => ({ throttle: 0 }) },
    { step: 'brake', seconds: 3, watch: 'A progressive front brake, with a little rear: the stop starts well before the usual point.', act: () => ({ throttle: 0, front: 0.28, rear: 0.08 }) },
    { step: 'stop', seconds: 6, watch: 'Clutch in, brakes held: the motorcycle stops at the line instead of past it.', act: () => ({ throttle: 0, clutch: 1, front: 0.38, rear: 0.1 }) },
  ],
}

const WET_CROSS = 70
const wetBehindWorld: WorldSpec = {
  person: { at: WET_CROSS },
  behind: { gap: 8, speed: matchRider },
  oncoming: { at: 90, speed: () => 50 / 3.6 },
}

export const pedestrianWetBehind: CockpitScenario = {
  id: 'pedestrian-wet-behind',
  title: 'A person, wet, someone behind',
  summary: 'Wet road, a person in your lane, a car behind and one oncoming: brake in a straight line.',
  setup: { gear: 3, running: true, kmh: 50, throttle: 0.25, surface: 'wet', paused: true },
  view: 'rider',
  world: wetBehindWorld,
  watch: worldWatch(wetBehindWorld),
  situation: `It is raining. A person is in your wheel track ${WET_CROSS} m ahead. A car is about eight metres behind you; another is coming the other way. The other lane is not an escape. The scenario waits, paused, until you touch a control.`,
  objective: 'Brake as hard as the wet road allows, in a straight line, and stop short of the person.',
  actions: ['Close the throttle — the brake light tells the rider behind.', 'Squeeze the front progressively on the wet road, with a little rear.', 'Pull the clutch in and stop short of them, still in your lane.'],
  mechanical: 'Wet grip is about half of dry. A grab locks the front. A swerve is a lean toward the oncoming car. The only budget left is a straight, progressive wet stop.',
  road: 'The person is not moving out of the way. The mirror shows the car behind; the other lane shows the oncoming car. Your lane is the whole problem.',
  why: 'Someone behind you does not create an escape. The wet road and the oncoming car close the other options.',
  mistakes: [...STOP_MISTAKES, REAR_ENDED],
  safety: [RIDE_SAFETY, 'An early brake light is how the rider behind sees you stopping.', MODEL_NOTE],
  steps: [
    {
      id: 'ease',
      title: 'Close the throttle',
      instruction: 'Close the throttle. The person is still well ahead; the brake light is for whoever is behind.',
      highlight: ['throttle'],
      done: (s, i, d) => i.throttle === 0 && d.kmh > 8 && s.distance < WET_CROSS - 20,
      explanation: 'Engine braking has started, and the light behind you is on, with the person still a long way off.',
    },
    {
      id: 'brake',
      title: 'A wet, straight stop',
      instruction: 'Squeeze the front progressively — wet, so gently — with a little rear. Stay in your lane.',
      highlight: ['frontBrake', 'rearBrake'],
      done: (s, i, d) => i.throttle === 0 && (i.front ?? 0) >= 0.12 && d.kmh < 32 && d.kmh > 3 && s.distance < WET_CROSS - 8 && !s.brakes.front.locked,
      explanation: 'A wet squeeze, wheels still rolling, still in your lane: this is the stop the road can give.',
    },
    {
      id: 'stop',
      title: 'Stop short of them',
      instruction: 'Pull the clutch in and stop before you reach the person.',
      highlight: ['clutch', 'frontBrake', 'rearBrake'],
      done: (s, _i, d, w) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (personGap(w, s.distance) ?? 0) >= NOSE,
      explanation: 'Stopped short of them, still in your lane. The oncoming car never became your problem.',
    },
  ],
  demo: [
    { step: 'ease', seconds: 0.8, watch: 'Throttle shut at once: the brake light is on for the car in the mirror.', act: () => ({ throttle: 0 }) },
    { step: 'brake', seconds: 3.2, watch: 'A gentle wet squeeze — not a grab — while the motorcycle stays upright in its lane.', act: (_t, s) => (s.speed * 3.6 > 16 ? { throttle: 0, front: 0.2, rear: 0.05 } : { throttle: 0, clutch: 1, front: 0.18, rear: 0.05 }) },
    { step: 'stop', seconds: 7, watch: 'Clutch in, brakes held: the motorcycle stops short of the person. The oncoming car goes by in the other lane.', act: () => ({ clutch: 1, front: 0.2, rear: 0.05 }) },
  ],
}

const BEND_HOLE = { at: 40, length: 0.6, height: 0.08 }
const HOLE_R = 32
const onBendHole = (distance: number) => distance >= BEND_HOLE.at && distance <= BEND_HOLE.at + BEND_HOLE.length
const leanedHoleWorld: WorldSpec = { bump: BEND_HOLE, curvature: 1 / HOLE_R, oncoming: { at: 70, speed: () => 45 / 3.6 } }

export const potholeLeanedWet: CockpitScenario = {
  id: 'pothole-leaned-wet',
  title: 'A hole in a wet bend',
  summary: 'Slow on the way in so the lean is small, then roll over the hole upright.',
  setup: { gear: 3, running: true, kmh: 50, throttle: 0.25, surface: 'wet', paused: true },
  view: 'rider',
  world: leanedHoleWorld,
  watch: (prev, s, i) => {
    if (prev.distance < BEND_HOLE.at && s.distance >= BEND_HOLE.at && s.speed * 3.6 > 25) return 'bump-fast'
    if (onBendHole(s.distance) && (i.front ?? 0) > 0.05) return 'bump-braking'
    return null
  },
  situation: `It is damp. The road bends right (about ${HOLE_R} m radius). A pothole sits in your wheel track ${BEND_HOLE.at} m ahead. An oncoming car is in the other lane. The scenario waits, paused, until you touch a control.`,
  objective: 'Slow before the hole so the lean is small, roll over it off the brakes, then ride away.',
  actions: ['Close the throttle and brake to below 20 km/h before the hole, changing down to second.', 'Release the brakes and roll over it, more upright than 50 km/h would have asked.', 'Once over it, open the throttle smoothly.'],
  mechanical: 'Lean is speed in a bend. Slowing on the way in cuts the lean so the hole is a bump, not a tuck. Braking on it uses the fork travel the hit needs.',
  road: 'The road curves away to the right. The oncoming car is why you do not swerve. The hole is taken in your own lane, slowly.',
  why: 'A hole in a wet bend is a reason to have slowed already. Do not swerve into oncoming traffic, and do not take it leaned.',
  mistakes: [
    { id: 'bump-fast', title: 'Too fast into the pothole', text: 'You reached it still at speed, leaned. Brake before the hole.' },
    { id: 'bump-braking', title: 'Braking in the pothole', text: 'The front brake was on as you dropped in. Finish braking before it, then roll over.' },
    STALL,
    FRONT_LOCK,
    SHIFT,
  ],
  safety: [RIDE_SAFETY, 'Never swerve into oncoming traffic to miss a hole.', MODEL_NOTE],
  steps: [
    {
      id: 'slow',
      title: 'Slow before the hole',
      instruction: 'Close the throttle, brake to below 20 km/h and change down to second — before you reach the pothole.',
      highlight: ['throttle', 'frontBrake', 'rearBrake', 'gearbox'],
      done: (s, i, d) => s.distance < BEND_HOLE.at && d.kmh > 3 && d.kmh < 20 && i.gear === 2,
      explanation: 'Slow, in second, with the hole still ahead: the lean the bend asks for is now small.',
    },
    {
      id: 'over',
      title: 'Roll over it',
      instruction: 'Release the brakes and roll over the pothole at a steady speed.',
      highlight: ['frontWheel', 'rearWheel'],
      done: (s, i, d) => s.distance > BEND_HOLE.at + BEND_HOLE.length && d.kmh > 2 && (i.front ?? 0) === 0,
      explanation: 'The fork had its full travel, and the motorcycle stayed in its lane.',
    },
    {
      id: 'away',
      title: 'Ride away',
      instruction: 'Open the throttle smoothly and ride away above 25 km/h.',
      highlight: ['throttle', 'clutch'],
      done: (s, i, d) => s.distance > BEND_HOLE.at + BEND_HOLE.length && i.throttle > 0 && d.kmh > 25 && s.locked,
      explanation: 'Over and away, with no harsh jolt and no braking in the hole.',
    },
  ],
  demo: [
    { step: 'slow', seconds: 6, watch: 'Braking starts at once; below about 18 km/h the clutch goes in and the lever presses down to second.', act: (_t, s) => (s.speed * 3.6 > 16 ? { throttle: 0, front: 0.22, rear: 0.06 } : { front: 0, rear: 0, clutch: 1, gear: 2 }) },
    { step: 'over', seconds: 5, watch: 'Brakes off, clutch out with a touch of throttle: the motorcycle rolls over the hole, more upright.', act: (t) => ({ clutch: Math.max(0, 1 - t * 1.2), throttle: 0.12 }) },
    { step: 'away', seconds: 6, watch: 'Over it: the throttle opens smoothly and the motorcycle rides away in its lane.', act: (t) => ({ throttle: Math.min(0.6, 0.15 + t * 0.3), clutch: 0 }) },
  ],
}

const V40 = 40 / 3.6
const pressuredWorld: WorldSpec = {
  car: { gap: 24, speed: () => V40, kind: 'truck' },
  behind: { gap: 7, speed: matchRider },
  oncoming: { at: 95, speed: () => 55 / 3.6 },
}

export const overtakePressured: CockpitScenario = {
  id: 'overtake-pressured',
  title: 'A horn behind the truck',
  summary: 'A slow truck, a car pushing from behind, oncoming traffic: stay behind until you can see.',
  setup: { gear: 5, running: true, kmh: 40, throttle: 0.22, paused: true },
  view: 'rider',
  world: pressuredWorld,
  watch: worldWatch(pressuredWorld),
  situation: 'You are about two seconds behind a slow truck at 40 km/h, in fifth. A car is close in the mirror and impatient. An oncoming car is in the other lane. The scenario waits, paused, until you touch a control.',
  objective: 'Match the truck, change down to third without closing in, and stay behind.',
  actions: ['Hold about 40 km/h so the gap stays at two seconds.', 'Pull the clutch in, select third, and feed the clutch out without surging.', 'Stay behind. A horn does not clear the other lane.'],
  mechanical: 'Fifth at 40 km/h is below the engine’s pull. Third puts it near the torque peak for a later pass. Closing up does not make a pass safer, and the oncoming car is already there.',
  road: 'The truck holds 40. The mirror shows the impatient car. The other lane is not empty. Waiting is the whole exercise.',
  why: 'You own the decision to pass. Pressure from behind does not move the bend or empty the other lane.',
  mistakes: FOLLOW_MISTAKES,
  safety: [RIDE_SAFETY, 'Only pass when you can see a clear road well beyond what the pass will take.', MODEL_NOTE],
  steps: [
    {
      id: 'match',
      title: 'Match the truck',
      instruction: 'Hold about 40 km/h so you stay two seconds behind — do not close the gap.',
      highlight: ['throttle'],
      done: (s, _i, d, w) => w.t >= 1.5 && s.locked && d.kmh > 34 && d.kmh < 46 && (carGap(w, s.distance) ?? 0) >= 1.8 * s.speed,
      explanation: 'Same speed as the truck, with the gap still there, still in fifth.',
    },
    {
      id: 'down',
      title: 'Change down to third',
      instruction: 'Clutch in, select third, clutch out smoothly — without closing in.',
      highlight: ['clutch', 'gearbox', 'throttle'],
      done: (s, i, d, w) => i.gear === 3 && s.locked && d.kmh > 32 && d.kmh < 48 && (carGap(w, s.distance) ?? 0) >= 1.8 * s.speed,
      explanation: 'Third, still behind: the engine would pull if a later, visible gap appeared.',
    },
    {
      id: 'wait',
      title: 'Stay behind',
      instruction: 'Keep that gap in third. Ignore the horn. Do not pull out.',
      highlight: ['throttle'],
      done: (s, i, d, w) => w.t >= 6.5 && i.gear === 3 && s.locked && d.kmh > 32 && d.kmh < 50 && (carGap(w, s.distance) ?? 0) >= 1.6 * s.speed,
      explanation: 'Still behind, in a pulling gear: ready for a pass you can actually see.',
    },
  ],
  demo: [
    { step: 'match', seconds: 2.2, watch: 'A steady throttle in fifth holds about 40 km/h: the gap stays, the mirror still shows the car behind.', act: () => ({ throttle: 0.22 }) },
    { step: 'down', seconds: 2.4, watch: 'Clutch in, a press to third, then the clutch comes out with a little throttle so the motorcycle does not surge.', act: (t) => (t < 0.35 ? { clutch: 1, throttle: 0 } : t < 0.5 ? { clutch: 1, throttle: 0, gear: 3 } : { clutch: Math.max(0, 1 - (t - 0.5) * 1.4), throttle: 0.16, gear: 3 }) },
    { step: 'wait', seconds: 5, watch: 'Third, still behind the truck. The oncoming car goes by. The horn did not clear the road.', act: () => ({ throttle: 0.18, gear: 3, clutch: 0 }) },
  ],
}

const HILL = 0.1
const HILL_PULL = MASS * G * Math.sin(Math.atan(HILL))
const hillWorld: WorldSpec = { behind: { gap: 3 } }

export const hillCarBehind: CockpitScenario = {
  id: 'hill-car-behind',
  title: 'Uphill, a bumper in the mirrors',
  summary: 'Move off on a 10 % climb with a car stopped close behind, without rolling back.',
  setup: { gear: 1, running: true, clutch: 1, rear: 0.4, grade: HILL },
  view: 'split',
  world: hillWorld,
  watch: worldWatch(hillWorld),
  situation: 'You have stopped on a 10 % uphill in first, clutch in, holding the motorcycle with the rear brake. A car has stopped close behind — you can see it in the mirror. The road ahead is clear.',
  objective: 'Move off up the hill without rolling back into the car, and without stalling.',
  actions: ['Keep your foot on the rear brake and the clutch in — you are already in first.', 'Open the throttle a little more than on the flat and ease the clutch to the biting point.', 'Release the rear brake as you let the clutch out further, and ride away.'],
  mechanical: 'On the hill, gravity pulls the motorcycle back. At the biting point the slipping plates start to pass enough torque to hold against that pull. The brake then comes off. Rolling back is a collision with the car behind.',
  road: 'Until the clutch drives, only the brake stops you rolling into the bumper in the mirror. Let the brake go too early and you hit them.',
  why: 'A car close behind does not change the hill start. It makes rolling back expensive. The rear brake is what holds you while you find the bite.',
  mistakes: [ROLL, STALL, REAR_ENDED, { id: 'lurch', title: 'A jerky take-up', text: 'The clutch went from slipping to gripping too quickly. Slow down through the last part of the lever’s travel.' }],
  safety: [RIDE_SAFETY, 'Look behind before you move off. A rolling motorcycle can hit whoever is behind you.', MODEL_NOTE],
  steps: [
    {
      id: 'first',
      title: 'Hold first, brake on',
      instruction: 'Keep the rear brake pressed and the clutch fully in. You are already in first.',
      highlight: ['clutch', 'rearBrake'],
      done: (s, i) => s.running && i.gear === 1 && i.clutch >= 0.9 && (i.rear ?? 0) > 0 && Math.abs(s.speed) < 0.2,
      explanation: 'The rear brake holds the motorcycle on the hill, which leaves your right hand free for the throttle — and keeps you off the car behind.',
    },
    {
      id: 'bite',
      title: 'Find the biting point',
      instruction: 'Open the throttle a little and ease the clutch out until it pulls against the brake.',
      highlight: ['clutch', 'throttle', 'rearBrake'],
      done: (s, i, d) => s.running && i.gear === 1 && (i.rear ?? 0) > 0 && i.throttle > 0 && d.driveForce >= HILL_PULL * 0.6,
      explanation: 'The slipping plates now pass enough torque to take most of gravity’s pull: the brake is barely needed.',
    },
    {
      id: 'away',
      title: 'Release the brake and ride away',
      instruction: 'Release the rear brake as you let the clutch out further, and ride up the hill.',
      highlight: ['rearBrake', 'clutch', 'throttle'],
      done: (s, i) => s.running && (i.rear ?? 0) === 0 && s.speed > 1.5 && s.locked,
      explanation: 'The clutch is fully engaged and the engine is driving you up the hill — and the motorcycle never rolled back.',
    },
  ],
  demo: [
    { step: 'first', seconds: 0.5, watch: 'Already in first, clutch in, rear brake held: the brake alone stops the motorcycle rolling into the car behind.', act: () => ({ clutch: 1, gear: 1, rear: 0.4 }) },
    { step: 'bite', seconds: 3, watch: 'More throttle than on the flat, and the clutch eases to the biting point: the drive force at the tyre rises to meet gravity’s pull.', act: (t) => ({ throttle: 0.3, clutch: Math.max(0.3, 1 - t * 0.5) }) },
    { step: 'away', seconds: 6, watch: 'The brake comes off as the clutch takes the strain: the motorcycle pulls up the hill without rolling back.', act: (t) => ({ rear: 0, throttle: 0.5, clutch: Math.max(0, 0.3 - t * 0.08) }) },
  ],
}

const LINE_R = 38
const paintWorld: WorldSpec = { curvature: 1 / LINE_R, paint: true }

export const wetPaintedLine: CockpitScenario = {
  id: 'wet-painted-line',
  title: 'A wet painted line in a bend',
  summary: 'Brake on the straight, upright, then take the wet bend slowly — off the paint as far as the lane allows.',
  setup: { gear: 3, running: true, kmh: 55, throttle: 0.28, surface: 'wet', paused: true },
  view: 'rider',
  world: paintWorld,
  situation: `It is raining. The road bends right (about ${LINE_R} m radius). A wide painted line in the wet is about the grip of ice. You are at 55 km/h. The scenario waits, paused, until you touch a control.`,
  objective: 'Slow on the way in, upright, then ride the bend at a lower speed so the lean stays small.',
  actions: ['Close the throttle and brake while you are still as upright as the speed allows.', 'Get below about 35 km/h before you ask the bend for lean.', 'Hold that slower speed through the bend, off the brakes.'],
  mechanical: 'Braking and turning share one budget of grip. Wet paint spends almost all of it. Slowing first cuts the lean the bend asks for, so a painted line is greasy rather than a fall.',
  road: 'The road curves away. The lean you see is the speed you still have. Slow, and the motorcycle stands up.',
  why: 'In the wet, brake before the bend, upright, and treat painted lines as ice. Never brake leaned on one.',
  mistakes: [FRONT_LOCK, REAR_LOCK, STALL],
  safety: [RIDE_SAFETY, 'If you can, stay off painted lines, covers and diesel in the wet.', MODEL_NOTE],
  steps: [
    {
      id: 'ease',
      title: 'Close the throttle',
      instruction: 'Close the throttle. All the slowing happens before you ask the bend for lean.',
      highlight: ['throttle'],
      done: (s, i, d) => i.throttle === 0 && d.kmh > 20 && s.distance < 30,
      explanation: 'Engine braking has started while the motorcycle is still as upright as 55 km/h in this bend allows.',
    },
    {
      id: 'slow',
      title: 'Slow before the lean',
      instruction: 'Brake progressively until you are below 35 km/h.',
      highlight: ['frontBrake', 'rearBrake'],
      done: (s, i, d) => i.throttle === 0 && (i.front ?? 0) + (i.rear ?? 0) > 0.05 && d.kmh < 35 && d.kmh > 8 && !s.brakes.front.locked,
      explanation: 'Below 35 km/h the bend asks for a much smaller lean, with grip in reserve for the paint.',
    },
    {
      id: 'hold',
      title: 'Ride the slower bend',
      instruction: 'Release the brakes and hold that slower speed through the bend.',
      highlight: ['throttle'],
      done: (s, i, d) => (i.front ?? 0) === 0 && s.locked && d.kmh > 18 && d.kmh < 38 && s.distance > 25,
      explanation: 'A small lean, off the brakes, on ordinary wet asphalt as far as the lane allows.',
    },
  ],
  demo: [
    { step: 'ease', seconds: 0.7, watch: 'Throttle shut: the slowing starts while there is still speed to give away.', act: () => ({ throttle: 0 }) },
    { step: 'slow', seconds: 4, watch: 'A gentle wet brake brings 55 down through 35. The motorcycle stands up as the speed falls.', act: (_t, s) => (s.speed * 3.6 > 32 ? { throttle: 0, front: 0.18, rear: 0.05 } : { throttle: 0, front: 0, rear: 0 }) },
    { step: 'hold', seconds: 5, watch: 'Brakes off, a little throttle: the slower speed holds through the bend.', act: () => ({ throttle: 0.14, front: 0, rear: 0, clutch: 0 }) },
  ],
}

const RAIN_R = 18
const firstRainWorld: WorldSpec = { curvature: 1 / RAIN_R, behind: { gap: 8, speed: matchRider }, island: { at: 22, x: 4.2, r: 2.6 } }

export const wetFirstRain: CockpitScenario = {
  id: 'wet-first-rain',
  title: 'First rain, a tight join',
  summary: 'A greasy roundabout in the first rain: join only as fast as a walking lean needs.',
  setup: { gear: 3, running: true, kmh: 40, throttle: 0.22, surface: 'wet', paused: true },
  view: 'rider',
  world: firstRainWorld,
  watch: worldWatch(firstRainWorld),
  situation: `The first rain has lifted diesel onto a tight right-hand join (about ${RAIN_R} m radius). You are at 40 km/h. A car is close behind. The scenario waits, paused, until you touch a control.`,
  objective: 'Slow right down — walking pace — so the lean is almost nothing, even if the car behind has to wait.',
  actions: ['Close the throttle at once.', 'Brake gently to a walking pace, below about 12 km/h.', 'Hold that crawl through the join, off the brakes.'],
  mechanical: 'A tight radius at 40 km/h already asks for most of the wet grip. Diesel asks for more than the tyre has. A walking-pace join asks for almost no lean.',
  road: 'The road bends tightly. The mirror shows the car behind; they can wait. A roundabout you cannot hold is not a gap you have to take.',
  why: 'First rain is diesel on the surface. Speed you still have is lean you still need. Wait, or crawl.',
  mistakes: [FRONT_LOCK, REAR_LOCK, STALL, REAR_ENDED],
  safety: [RIDE_SAFETY, 'The cars behind can wait. A fall in first rain is not a gap you owed them.', MODEL_NOTE],
  steps: [
    {
      id: 'ease',
      title: 'Close the throttle',
      instruction: 'Close the throttle. The join is tight and the surface is greasy.',
      highlight: ['throttle'],
      done: (s, i, d) => i.throttle === 0 && d.kmh > 12 && s.distance < 25,
      explanation: 'Engine braking has started. The car behind will have to wait; that is the correct outcome.',
    },
    {
      id: 'crawl',
      title: 'Down to a walking pace',
      instruction: 'Brake gently until you are below 12 km/h.',
      highlight: ['frontBrake', 'rearBrake'],
      done: (s, i, d) => i.throttle === 0 && (i.front ?? 0) + (i.rear ?? 0) > 0.04 && d.kmh < 12 && d.kmh > 3 && !s.brakes.front.locked,
      explanation: 'A walking lean: diesel is now a greasy roll, not a lean you cannot hold.',
    },
    {
      id: 'join',
      title: 'Hold the crawl',
      instruction: 'Release the brakes and hold that walking pace through the join.',
      highlight: ['throttle'],
      done: (s, i, d) => (i.front ?? 0) === 0 && s.running && d.kmh > 4 && d.kmh < 16 && s.distance > 18,
      explanation: 'Through the join at a crawl. The car behind waited. You are still upright.',
    },
  ],
  demo: [
    { step: 'ease', seconds: 0.6, watch: 'Throttle shut: the car behind will have to wait, and that is fine.', act: () => ({ throttle: 0 }) },
    { step: 'crawl', seconds: 5, watch: 'A gentle wet brake brings 40 down to a walking pace. The motorcycle stands up.', act: (_t, s) => (s.speed * 3.6 > 12 ? { throttle: 0, front: 0.16, rear: 0.04 } : { throttle: 0, front: 0, rear: 0, clutch: 1, gear: 2 }) },
    { step: 'join', seconds: 5, watch: 'Brakes off, a breath of throttle in second: the crawl holds through the greasy join.', act: (t) => ({ throttle: 0.12, front: 0, rear: 0, clutch: Math.max(0, 1 - t * 0.8), gear: 2 }) },
  ],
}

const BEND_R = 36
const bendStopWorld: WorldSpec = { curvature: 1 / BEND_R, car: { gap: 50 } }

export const emergencyInBend: CockpitScenario = {
  id: 'emergency-in-bend',
  title: 'A stop in a bend',
  summary: 'Something in your lane in a right-hand bend: slow until the motorcycle stands up, then brake.',
  setup: { gear: 3, running: true, kmh: 45, throttle: 0.24, paused: true },
  view: 'rider',
  world: bendStopWorld,
  watch: worldWatch(bendStopWorld),
  situation: `You are in a right-hand bend of about ${BEND_R} m radius at 45 km/h, already leaned. Something in your lane means you must stop. The scenario waits, paused, until you touch a control.`,
  objective: 'Lose speed so the lean drops, then brake hard in a straight line and stop short of the hazard.',
  actions: ['Close the throttle and brake lightly until you are below 25 km/h — the motorcycle stands up as the speed falls.', 'Then squeeze the front more firmly, with a little rear.', 'Pull the clutch in and stop short of the vehicle ahead.'],
  mechanical: 'Braking and turning share one circle of grip. Slowing first spends a little extra road, then lets the front tyre do a hard stop. Hard braking while leaned asks for both at once.',
  road: 'The road curves away. Lean is speed in this bend: as you slow, the motorcycle stands up. Then the stop is a straight-line brake.',
  why: 'If you must stop in a bend, stand the motorcycle up first, then brake. Hard braking while leaned spends the grip the turn was already using.',
  mistakes: STOP_MISTAKES,
  safety: [RIDE_SAFETY, 'A grabbed front while leaned is a tuck.', MODEL_NOTE],
  steps: [
    {
      id: 'stand',
      title: 'Slow until it stands up',
      instruction: 'Close the throttle and brake lightly until you are below 25 km/h. The lean falls with the speed.',
      highlight: ['throttle', 'frontBrake', 'rearBrake'],
      done: (s, i, d) => i.throttle === 0 && d.kmh < 25 && d.kmh > 6 && s.distance < 40 && !s.brakes.front.locked,
      explanation: 'Below 25 km/h the bend asks for little lean. The front tyre’s budget is free for the stop.',
    },
    {
      id: 'brake',
      title: 'Brake in a straight line',
      instruction: 'Squeeze the front more firmly, with a little rear, now that you are more upright.',
      highlight: ['frontBrake', 'rearBrake'],
      done: (s, i, d) => (i.front ?? 0) >= 0.22 && d.kmh < 18 && d.kmh > 2 && !s.brakes.front.locked,
      explanation: 'A firm squeeze, wheels still rolling: this is the stop the tyre can give once it is not also turning.',
    },
    {
      id: 'stop',
      title: 'Stop short of it',
      instruction: 'Pull the clutch in and stop before you reach the vehicle ahead.',
      highlight: ['clutch', 'frontBrake', 'rearBrake'],
      done: (s, _i, d, w) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (carGap(w, s.distance) ?? 0) >= NOSE,
      explanation: 'Stopped short, in your lane, after standing the motorcycle up first.',
    },
  ],
  demo: [
    { step: 'stand', seconds: 3.2, watch: 'A light brake: 45 falls and the motorcycle stands up as the speed comes off.', act: (_t, s) => (s.speed * 3.6 > 24 ? { throttle: 0, front: 0.18, rear: 0.05 } : { throttle: 0, front: 0.1, rear: 0.03 }) },
    { step: 'brake', seconds: 2.8, watch: 'Now more upright, a firmer front squeeze, clutch in before the engine labours.', act: (_t, s) => (s.speed * 3.6 > 8 ? { throttle: 0, front: 0.3, rear: 0.08 } : { throttle: 0, clutch: 1, front: 0.3, rear: 0.08 }) },
    { step: 'stop', seconds: 6, watch: 'Clutch in, brakes held: the motorcycle stops short of the vehicle ahead.', act: () => ({ clutch: 1, front: 0.32, rear: 0.08 }) },
  ],
}

const NO_ESC = 26
const noEscapeWorld: WorldSpec = { person: { at: NO_ESC, kind: 'dog' }, oncoming: { at: 80, speed: () => 50 / 3.6 } }

export const obstacleNoEscape: CockpitScenario = {
  id: 'obstacle-no-escape',
  title: 'No escape in the wet',
  summary: 'Already slowed, a hazard in your lane, oncoming traffic: brake from 30, do not swerve.',
  setup: { gear: 2, running: true, kmh: 30, throttle: 0.18, surface: 'wet', paused: true },
  view: 'rider',
  world: noEscapeWorld,
  watch: worldWatch(noEscapeWorld),
  situation: `It is wet. You have already slowed to about 30 km/h. A hazard is in your lane, only ${NO_ESC} m ahead. An oncoming car is in the other lane. The scenario waits, paused, until you touch a control.`,
  objective: 'Brake as hard as the wet road allows, in a straight line, and stop short of the hazard.',
  actions: ['Close the throttle.', 'Squeeze the front progressively on the wet road, with a little rear.', 'Pull the clutch in and stop short — stay in your lane.'],
  mechanical: 'From 30 km/h a wet progressive stop fits in 26 m. From 50 it would not. A swerve is a lean toward the oncoming car.',
  road: 'The hazard is in your wheel track. The other lane is not empty. The work you already did — being at 30, not 50 — is what makes the stop possible.',
  why: 'The advanced skill was slowing earlier. Now it is a straight wet brake, not a swerve.',
  mistakes: STOP_MISTAKES,
  safety: [RIDE_SAFETY, 'If the other lane is not empty, it is not an escape.', MODEL_NOTE],
  steps: [
    {
      id: 'ease',
      title: 'Close the throttle',
      instruction: 'Close the throttle. You are already at 30 — now use that.',
      highlight: ['throttle'],
      done: (s, i, d) => i.throttle === 0 && d.kmh > 8 && s.distance < NO_ESC - 8,
      explanation: 'Engine braking has started, with the hazard still ahead and the oncoming car in the other lane.',
    },
    {
      id: 'brake',
      title: 'A wet squeeze',
      instruction: 'Squeeze the front progressively on the wet road, with a little rear. Do not swerve.',
      highlight: ['frontBrake', 'rearBrake'],
      done: (s, i, d) => (i.front ?? 0) >= 0.12 && d.kmh < 22 && d.kmh > 2 && s.distance < NO_ESC - 2 && !s.brakes.front.locked,
      explanation: 'A wet squeeze, still in your lane: this is the stop 30 km/h made possible.',
    },
    {
      id: 'stop',
      title: 'Stop short of it',
      instruction: 'Pull the clutch in and stop before you reach the hazard.',
      highlight: ['clutch', 'frontBrake', 'rearBrake'],
      done: (s, _i, d, w) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (personGap(w, s.distance) ?? 0) >= NOSE,
      explanation: 'Stopped short, still in your lane. The oncoming car was never your escape.',
    },
  ],
  demo: [
    { step: 'ease', seconds: 0.5, watch: 'Throttle shut: 30 km/h is the speed that makes this stop possible.', act: () => ({ throttle: 0 }) },
    { step: 'brake', seconds: 2.2, watch: 'A gentle wet squeeze, upright, in the lane. No swerve toward the oncoming car.', act: (_t, s) => (s.speed * 3.6 > 10 ? { throttle: 0, front: 0.2, rear: 0.05 } : { throttle: 0, clutch: 1, front: 0.18, rear: 0.05 }) },
    { step: 'stop', seconds: 5, watch: 'Clutch in, brakes held: the motorcycle stops short of the hazard.', act: () => ({ clutch: 1, front: 0.2, rear: 0.05 }) },
  ],
}

const AMBER_AT = 42
const AMBER_LINE = 50
const amberWorld: WorldSpec = {
  behind: { gap: 8, speed: matchRider },
  signal: {
    at: AMBER_LINE,
    colour: (w, d) => {
      if (w.mem.amberAt === undefined && AMBER_LINE - d <= AMBER_AT) w.mem.amberAt = w.t
      return w.mem.amberAt === undefined ? 'green' : w.t - w.mem.amberAt < 3 ? 'amber' : 'red'
    },
  },
  cross: {
    at: AMBER_LINE + 4,
    x0: 9,
    vx: (w) => (w.signal === 'red' && w.mem.amberAt !== undefined && w.t - w.mem.amberAt > 4 ? -6 : 0),
  },
}

export const signalAmberBehind: CockpitScenario = {
  id: 'signal-amber-behind',
  title: 'Amber, a car behind',
  summary: 'The light turns amber with someone close behind: brake early so they see the light, and stop at the line.',
  setup: { gear: 3, running: true, kmh: 50, throttle: 0.25 },
  view: 'rider',
  world: amberWorld,
  watch: worldWatch(amberWorld),
  situation: 'You are at about 50 km/h in third toward a junction. A car is about eight metres behind. Cross traffic waits on the right. The light is green — for now.',
  objective: 'When it turns amber, brake progressively (brake light on early) and stop at the line, without grabbing.',
  actions: ['When the light turns amber, close the throttle and start braking at once.', 'Pull the clutch in, change down to first, and stop at the line.', 'Select neutral while you wait.'],
  mechanical: 'An early, progressive brake is a message to the rider behind. A grab gives them no time and can lock the front. If you can stop at amber, you stop.',
  road: 'The mirror shows the car behind. The stop line is where the front wheel must stop. Going through so they do not have to brake is how you meet the cross traffic.',
  why: 'If you can stop at amber, stop. Tell the rider behind with an early brake light — not by going, and not by grabbing.',
  mistakes: [
    { id: 'ran-red', title: 'Crossing on red', text: 'The light was red when you crossed the line. Start braking as soon as it turns amber.' },
    REAR_ENDED,
    STALL,
    FRONT_LOCK,
    REAR_LOCK,
  ],
  safety: [RIDE_SAFETY, 'Check your mirrors before braking, and keep the brake on while you wait.', MODEL_NOTE],
  steps: [
    {
      id: 'react',
      title: 'React to amber',
      instruction: 'When the light turns amber, close the throttle and start braking — the light is for the car behind too.',
      highlight: ['throttle', 'frontBrake', 'rearBrake'],
      done: (s, i, _d, w) => w.signal !== 'green' && i.throttle === 0 && ((i.front ?? 0) > 0 || (i.rear ?? 0) > 0) && s.speed > 0.2,
      explanation: 'Braking early leaves the whole distance to the line for a gentle stop, and a long brake light for whoever is behind.',
    },
    {
      id: 'stop',
      title: 'Stop at the line',
      instruction: 'Pull the clutch in, change down to first, and stop at the stop line — not past it.',
      highlight: ['clutch', 'frontBrake', 'gearbox'],
      done: (s, _i, d, w) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (lineGap(amberWorld, s.distance) ?? -1) >= 0 && (lineGap(amberWorld, s.distance) ?? 99) <= 24 && w.signal !== 'green',
      explanation: 'Stopped at the line, engine still idling. The car behind had time because the light came on early.',
    },
    {
      id: 'neutral',
      title: 'Wait in neutral',
      instruction: 'Select neutral while you wait — a gentle half-lift from first.',
      highlight: ['gearbox', 'clutch'],
      done: (s, i) => s.running && i.gear === 0 && Math.abs(s.speed) < 0.05,
      explanation: 'In neutral nothing connects the engine to the rear wheel: your left hand can rest while you wait.',
    },
  ],
  demo: [
    { step: 'react', seconds: 6, watch: 'Green, so the rider rides on — until amber: then throttle closed and braking begins at once, light on for the car behind.', act: (_t, s, w) => (w.signal === 'green' ? {} : { throttle: 0, front: toLine(s, AMBER_LINE - 2), rear: 0.03 }) },
    { step: 'stop', seconds: 10, watch: 'Braking judged to the line; as the speed falls the clutch goes in and the lever presses down through second to first.', act: (_t, s) => ({ front: Math.max(0.14, toLine(s, AMBER_LINE - 2)), rear: 0.04, ...(s.speed < 4 ? { clutch: 1, gear: s.speed < 2.5 ? 1 : 2 } : {}) }) },
    { step: 'neutral', seconds: 0.6, watch: 'Stopped at the line: a half-lift selects neutral.', act: () => ({ gear: 0 }) },
  ],
}

const GREEN_LINE = 28
const greenWorld: WorldSpec = {
  signal: { at: GREEN_LINE, colour: () => 'green' },
  cross: { at: GREEN_LINE, x0: 14, vx: () => -6 },
}

export const signalGreenCross: CockpitScenario = {
  id: 'signal-green-cross',
  title: 'Green — and it does not look right',
  summary: 'Your light is green. A car from the cross road is not stopping. Do not enter.',
  setup: { gear: 3, running: true, kmh: 40, throttle: 0.2, paused: true },
  view: 'rider',
  world: greenWorld,
  watch: worldWatch(greenWorld),
  situation: `Your light is green. You are at 40 km/h, ${GREEN_LINE} m from the line. A car on the cross road is still coming. The scenario waits, paused, until you touch a control.`,
  objective: 'Cover the brake, do not enter, and stop before the line as they come through.',
  actions: ['Close the throttle at once.', 'Brake progressively and stop before the line.', 'Let them go through. Green was not a guarantee.'],
  mechanical: 'From 40 km/h you can stop in 28 m with a progressive squeeze. Accelerating through is how you meet them in the junction.',
  road: 'The light is green. The crossing car is moving toward your path. The stop line is the last place you still have a choice.',
  why: 'Green is permission from the signal, not a guarantee that everyone else will stop. If it does not look right, you do not enter.',
  mistakes: STOP_MISTAKES,
  safety: [RIDE_SAFETY, 'Being right on the light is not the same as being in one piece.', MODEL_NOTE],
  steps: [
    {
      id: 'cover',
      title: 'Cover the brake',
      instruction: 'Close the throttle and start braking. Do not enter.',
      highlight: ['throttle', 'frontBrake', 'rearBrake'],
      done: (s, i, d) => i.throttle === 0 && ((i.front ?? 0) > 0 || (i.rear ?? 0) > 0) && d.kmh > 6 && s.distance < GREEN_LINE - 4,
      explanation: 'The throttle is shut and the brakes are on, with the line still ahead: you have chosen not to enter.',
    },
    {
      id: 'stop',
      title: 'Stop before the line',
      instruction: 'Pull the clutch in and stop before the stop line as the cross car comes through.',
      highlight: ['clutch', 'frontBrake', 'rearBrake'],
      done: (s, _i, d) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (lineGap(greenWorld, s.distance) ?? -1) >= 0,
      explanation: 'Stopped before the line. The cross car goes through the junction in front of you.',
    },
    {
      id: 'wait',
      title: 'Let them go',
      instruction: 'Stay stopped until they have crossed. Do not roll in behind them.',
      highlight: ['frontBrake'],
      done: (s, i, _d, w) => Math.abs(s.speed) < 0.05 && (i.front ?? 0) + (i.rear ?? 0) > 0 && (w.crossX ?? 0) < -2,
      explanation: 'They have gone through. You never met them. Unpopular with anyone behind you; alive.',
    },
  ],
  demo: [
    { step: 'cover', seconds: 1, watch: 'Throttle shut and the brakes come on at once: green is not a reason to enter.', act: () => ({ throttle: 0, front: 0.4, rear: 0.1 }) },
    { step: 'stop', seconds: 6, watch: 'Clutch in, braking to the line: the cross car is already sweeping through the junction.', act: () => ({ throttle: 0, clutch: 1, front: 0.4, rear: 0.1 }) },
    { step: 'wait', seconds: 3, watch: 'Held on the brakes at the line while they finish crossing.', act: () => ({ clutch: 1, front: 0.3, rear: 0.08 }) },
  ],
}

const V50 = 50 / 3.6
const tailWorld: WorldSpec = {
  car: { gap: 28, speed: () => V50 },
  behind: { gap: 6, speed: matchRider },
}

export const tailgater: CockpitScenario = {
  id: 'tailgater',
  title: 'Someone on your tail',
  summary: 'A car is too close behind. Ease off so the gap ahead grows; stay in your lane.',
  setup: { gear: 3, running: true, kmh: 50, throttle: 0.28, paused: true },
  view: 'rider',
  world: tailWorld,
  watch: worldWatch(tailWorld),
  situation: 'You are at 50 km/h in third. The car ahead is about two seconds away. Someone is only about six metres behind you. The scenario waits, paused, until you touch a control.',
  objective: 'Ease off slightly so the gap ahead grows, and stay in your lane. Do not speed up, and do not tap the brakes to warn them.',
  actions: ['Hold 50 for a moment so you can see both gaps.', 'Close the throttle a little and let the gap ahead grow past two and a half seconds.', 'Stay in your lane at the new, slightly lower speed.'],
  mechanical: 'The gap ahead is the only one you can grow. Speeding up closes it. A brake tap is a grab the rider behind is already too close to deal with.',
  road: 'The mirror shows them at six metres. The car ahead holds 50. Easing off lets you drop back from it without changing lane.',
  why: 'A tailgater is a reason to have more room in front, not less. You cannot control them. You can control your own gap.',
  mistakes: FOLLOW_MISTAKES,
  safety: [RIDE_SAFETY, 'Do not brake-check. If you need to slow, do it progressively, brake light on early.', MODEL_NOTE],
  steps: [
    {
      id: 'see',
      title: 'See both gaps',
      instruction: 'Hold around 50 km/h for a moment. Notice the car ahead and the one in the mirror.',
      highlight: ['throttle'],
      done: (s, _i, d, w) => w.t >= 1.2 && s.locked && d.kmh > 42 && d.kmh < 58,
      explanation: 'Still at 50: two seconds ahead, much less than one behind. The room you can make is in front.',
    },
    {
      id: 'ease',
      title: 'Ease off',
      instruction: 'Close the throttle and let the gap ahead grow to at least two and a half seconds.',
      highlight: ['throttle'],
      done: (s, i, d, w) => i.throttle === 0 && d.kmh > 20 && (carGap(w, s.distance) ?? 0) >= 2.4 * s.speed,
      explanation: 'The gap ahead has grown. You have somewhere to go if the car in front slows.',
    },
    {
      id: 'stay',
      title: 'Stay in your lane',
      instruction: 'Hold the new speed. Do not change lane, and do not speed back up.',
      highlight: ['throttle'],
      done: (s, _i, d, w) => w.t >= 6 && s.locked && d.kmh > 28 && d.kmh < 52 && (carGap(w, s.distance) ?? 0) >= 2 * s.speed,
      explanation: 'Still in your lane, with more room ahead than you started with. The tailgater is their own problem.',
    },
  ],
  demo: [
    { step: 'see', seconds: 1.6, watch: 'A steady throttle holds 50: two seconds ahead, a few metres in the mirror.', act: () => ({ throttle: 0.28 }) },
    { step: 'ease', seconds: 3.5, watch: 'Throttle shut: you drop back from the car ahead. The gap in front grows.', act: () => ({ throttle: 0 }) },
    { step: 'stay', seconds: 4, watch: 'A little throttle again, still in the lane, with the bigger gap held.', act: () => ({ throttle: 0.16 }) },
  ],
}

const NIGHT_HAZARD = 130
const nightRainWorld: WorldSpec = {
  car: { gap: NIGHT_HAZARD, kind: 'tractor' },
  behind: { gap: 12, speed: matchRider },
  beam: LOW_BEAM,
}

export const nightRainHorn: CockpitScenario = {
  id: 'night-rain-horn',
  title: 'Night, rain, a horn behind',
  summary: 'Wet, unlit, a horn from behind: keep the speed you can stop in the beam.',
  setup: { gear: 3, running: true, kmh: 40, throttle: 0.2, surface: 'wet', paused: true },
  view: 'rider',
  world: nightRainWorld,
  watch: worldWatch(nightRainWorld),
  situation: `It is night and raining on an unlit road. Low beam shows about ${LOW_BEAM} m. You are at a speed you can stop in that distance. A car behind flashes and horns. Somewhere ahead, an unlit tractor sits in your lane. The scenario waits, paused, until you touch a control.`,
  objective: 'Keep the night speed you can stop in, on low beam, then stop short of the tractor once it appears.',
  actions: ['Hold around 40 km/h — do not match their hurry.', 'Stay on low beam.', 'When the tractor appears in the beam, stop short of it.'],
  mechanical: 'Wet grip halves the stop you can make in 40 m. 40 km/h still fits. Matching a horn does not change the light, the rain, or the unlit hazard.',
  road: 'The road is dark beyond the beam. The mirror shows the impatient car. The tractor is unlit until the light reaches it.',
  why: 'A horn behind you does not change the light, the wet grip, or the unlit hazard. Ride the speed the beam allows.',
  mistakes: [...STOP_MISTAKES, REAR_ENDED],
  safety: [RIDE_SAFETY, 'At night in the rain, the beam is the speed limit.', MODEL_NOTE],
  steps: [
    {
      id: 'keep',
      title: 'Keep the night speed',
      instruction: 'Hold around 40 km/h. Do not speed up for the horn.',
      highlight: ['throttle'],
      done: (s, _i, d, w) => w.t >= 1.5 && s.locked && d.kmh > 32 && d.kmh < 48 && s.distance < 50,
      explanation: 'Still a speed that can stop in the beam on a wet road. The horn did not raise it.',
    },
    {
      id: 'beam',
      title: 'Stay in the light',
      instruction: 'Keep that speed on low beam until the tractor appears.',
      highlight: ['throttle'],
      done: (s, _i, d, w) => s.locked && d.kmh > 28 && d.kmh < 48 && (carGap(w, s.distance) ?? 99) < 70,
      explanation: 'The tractor has come into the beam. You still have a wet stop in hand.',
    },
    {
      id: 'stop',
      title: 'Stop for the tractor',
      instruction: 'Pull the clutch in and stop short of it.',
      highlight: ['clutch', 'frontBrake', 'rearBrake'],
      done: (s, _i, d, w) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (carGap(w, s.distance) ?? 0) >= NOSE,
      explanation: 'Stopped short of the unlit tractor, still in your lane. The horn did not get a vote.',
    },
  ],
  demo: [
    { step: 'keep', seconds: 1.8, watch: 'A steady throttle holds about 40 km/h on low beam. The horn behind is ignored.', act: () => ({ throttle: 0.22 }) },
    { step: 'beam', seconds: 4.5, watch: 'Still 40. The tractor is still beyond the beam — the horn does not raise the speed.', act: () => ({ throttle: 0.22 }) },
    { step: 'stop', seconds: 9, watch: 'When it appears, clutch in and a gentle wet brake: the motorcycle stops short of the tractor.', act: (_t, s, w) => ((carGap(w, s.distance) ?? 99) < 55 ? { throttle: 0, clutch: 1, front: 0.22, rear: 0.05 } : { throttle: 0.2 }) },
  ],
}

export const fullWorldCockpitScenarios = [
  nightRiding,
  pillion,
  pedestrianWetBehind,
  potholeLeanedWet,
  overtakePressured,
  hillCarBehind,
  wetPaintedLine,
  wetFirstRain,
  emergencyInBend,
  obstacleNoEscape,
  signalAmberBehind,
  signalGreenCross,
  tailgater,
  nightRainHorn,
]
