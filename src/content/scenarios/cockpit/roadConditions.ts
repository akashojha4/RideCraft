import { G } from '@/lib/mechanics/braking'
import { MASS } from '@/lib/mechanics/powertrain'
import { NOSE, crossGap, type WorldSpec } from '@/lib/simulation/cockpitWorld'
import type { CockpitScenario } from './types'

/*
 * Riding on different roads: a hill start, a long descent, a wet road, loose gravel, and an
 * emergency stop for a car stopped ahead. The gradient and the surface go straight into the
 * model (gravity along the slope, tyre grip), so the same controls give different results.
 */

const MOVING = 0.2 // m/s
const RIDE_SAFETY = 'Practise these situations for real only with a qualified instructor, in a closed area first.'
const MODEL_NOTE = 'This simulator is a simplified model: a real motorcycle, tyre and road will feel different.'
const HILL = 0.12
/** Gravity's pull back down a 12 % hill, N. */
const HILL_PULL = MASS * G * Math.sin(Math.atan(HILL))

export const uphillStart: CockpitScenario = {
  id: 'uphill-start',
  title: 'Hill start',
  summary: 'Move off on a steep uphill without rolling back, holding the rear brake until the clutch takes the strain.',
  setup: { gear: 0, running: true, rear: 0.4, grade: HILL },
  view: 'split',
  world: { behind: { gap: 2 } },
  situation: 'You have stopped on a 12 % uphill with the engine idling in neutral, holding the motorcycle with the rear brake pedal. A car has stopped about 2 m behind you — you can see it in the mirror. The road ahead is clear.',
  objective: 'Move off up the hill without rolling backwards and without stalling.',
  actions: ['Keep your foot on the rear brake, pull the clutch in and select first.', 'Open the throttle a little more than on the flat and ease the clutch to the biting point, until you feel it pull against the brake.', 'Release the rear brake as you let the clutch out further, and ride away.'],
  mechanical:
    'On the hill, gravity pulls the motorcycle back with about 265 N. At the biting point the slipping plates start to pass the engine’s torque through the gearbox to the rear wheel; once that drive matches gravity’s pull, the brake is no longer needed to hold the motorcycle. More throttle than on the flat keeps the engine from being dragged down by the extra load.',
  road: 'Until the clutch drives, only the brake stops the motorcycle rolling back. Let the brake go too early and it rolls backwards; keep it on too long and the engine works against the brake.',
  why: 'Hill starts are where most learners roll back or stall. Using the rear brake frees your right hand for the throttle — so you can hold the motorcycle, find the biting point and set the revs at the same time.',
  mistakes: [
    { id: 'roll-back', title: 'Rolling back', text: 'The brake was released before the clutch was driving the rear wheel hard enough to hold against gravity. Keep the rear brake on until you feel the clutch pull, then release it as you feed the clutch out.' },
    { id: 'stall', title: 'Stalling on the hill', text: 'Uphill the engine has gravity to fight as well. Use a little more throttle, and ease the clutch out more slowly.' },
    { id: 'lurch', title: 'A jerky take-up', text: 'The clutch went from slipping to gripping too quickly. Slow down through the last part of the lever’s travel.' },
    { id: 'slip-heat', title: 'Revving hard with the clutch slipping', text: 'High revs with slipping plates turn power into heat. Moderate throttle is enough — let the clutch do the work gradually.' },
    { id: 'start-in-gear', title: 'Starting in gear', text: 'Select neutral, or pull the clutch in, before pressing Start.' },
  ],
  safety: [RIDE_SAFETY, 'On a real hill, look behind before moving off: a rolling motorcycle can hit whoever is behind you.', MODEL_NOTE],
  steps: [
    {
      id: 'first',
      title: 'Select first, brake on',
      instruction: 'Keep the rear brake pressed, pull the clutch lever fully in and select first gear.',
      highlight: ['clutch', 'rearBrake'],
      done: (s, i) => s.running && i.gear === 1 && i.clutch >= 0.9 && (i.rear ?? 0) > 0 && Math.abs(s.speed) < MOVING,
      explanation: 'The rear brake holds the motorcycle on the hill, which leaves your right hand free for the throttle.',
    },
    {
      id: 'bite',
      title: 'Find the biting point',
      instruction: 'Open the throttle a little and ease the clutch out until it pulls against the brake (watch the drive at the rear tyre in “Inside the Machine”).',
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
    { step: 'first', seconds: 0.8, watch: 'Rear brake held, clutch in, first gear: the brake alone stops the motorcycle rolling back.', act: (t) => (t < 0.4 ? { clutch: Math.min(1, t * 4) } : { gear: 1 }) },
    { step: 'bite', seconds: 3, watch: 'More throttle than on the flat, and the clutch eases to the biting point: the drive force at the tyre rises to meet gravity’s pull.', act: (t) => ({ throttle: 0.3, clutch: Math.max(0.3, 1 - t * 0.5) }) },
    { step: 'away', seconds: 6, watch: 'The brake comes off as the clutch takes the strain: the motorcycle pulls up the hill without rolling back.', act: (t) => ({ rear: 0, throttle: 0.5, clutch: Math.max(0, 0.3 - t * 0.08) }) },
  ],
}

export const downhill: CockpitScenario = {
  id: 'downhill',
  title: 'Riding downhill',
  summary: 'On a long descent, control your speed with both brakes and a lower gear — not with the brakes alone.',
  setup: { gear: 3, running: true, kmh: 40, grade: -0.1 },
  view: 'split',
  situation: 'You are riding down a long 10 % hill in third gear at about 40 km/h, with the throttle closed. There is a junction at the bottom.',
  objective: 'Keep your speed under control all the way down: brake to a safe speed, then let a lower gear hold it.',
  actions: ['Keep the throttle closed and notice what the speed does.', 'Use both brakes gently to slow below 25 km/h.', 'Change down to second: clutch in, select second, ease the clutch out.'],
  mechanical:
    'With the throttle closed and the clutch engaged, the rear wheel turns the engine against its own friction and pumping losses: engine braking. In third, that holds back less than gravity pulls on this hill, so the motorcycle still gathers speed. In second the engine turns about 40 % faster for the same road speed and holds back harder — enough to balance the slope at about 25 km/h.',
  road: 'Gravity pulls you down the slope at about 0.1 g whatever the controls do. Braking moves load onto the front tyre; engine braking acts on the rear wheel only, gently and without heating the brakes.',
  why: 'On a long descent, riding on the brakes alone heats them until they fade. A lower gear lets the engine take a steady share of the work, and keeps the brakes for slowing further when you need to.',
  mistakes: [
    { id: 'front-lock', title: 'Locking the front wheel', text: 'Downhill, more of the load is already on the front: squeeze the lever progressively, never grab it.' },
    { id: 'rear-lock', title: 'Locking the rear wheel', text: 'Going downhill and braking both take load off the rear tyre, so it locks easily. Use a lighter foot.' },
    { id: 'over-rev', title: 'Over-revving', text: 'Changing down at too high a speed spins the engine past its redline. Slow down with the brakes first, then change down.' },
    { id: 'stall', title: 'Stalling', text: 'In gear with the clutch out, the engine stops if the wheel stops. Pull the clutch in before you stop.' },
    { id: 'shift-without-clutch', title: 'Changing gear without the clutch', text: 'Pull the clutch in fully before moving the gear lever.' },
  ],
  safety: [RIDE_SAFETY, 'Choose your gear before the descent starts, and brake before bends, not in them.', MODEL_NOTE],
  steps: [
    {
      id: 'gather',
      title: 'Feel the slope',
      instruction: 'Keep the throttle closed and watch the speed: in third, the engine is only just holding you on this slope.',
      highlight: ['throttle', 'gearbox'],
      done: (_s, i, d) => i.throttle === 0 && (i.front ?? 0) === 0 && (i.rear ?? 0) === 0 && d.kmh > 36 && d.kmh < 52,
      explanation: 'In third at 40 km/h the engine is working against the slope, but it has little in reserve. Second will hold you more firmly.',
    },
    {
      id: 'brake',
      title: 'Slow down with both brakes',
      instruction: 'Use the front and rear brakes together, gently, until you are below 25 km/h.',
      highlight: ['frontBrake', 'rearBrake'],
      done: (s, i, d) => (i.front ?? 0) > 0 && (i.rear ?? 0) > 0 && d.kmh > 3 && d.kmh < 25 && !s.brakes.front.locked && !s.brakes.rear.locked,
      explanation: 'Both brakes share the work; most of it falls on the front, which carries the extra load.',
    },
    {
      id: 'second',
      title: 'Let second gear hold you',
      instruction: 'Release the brakes, pull the clutch in, select second and ease the clutch out — throttle closed.',
      highlight: ['clutch', 'gearbox'],
      done: (s, i, d) => i.gear === 2 && s.locked && i.throttle === 0 && (i.front ?? 0) === 0 && (i.rear ?? 0) === 0 && d.kmh > 5 && d.kmh < 27 && s.acceleration <= 0.05,
      explanation: 'In second, engine braking now matches gravity’s pull: the speed holds steady without touching the brakes.',
    },
  ],
  demo: [
    { step: 'gather', seconds: 6, watch: 'Throttle closed, still in third: engine braking holds back less than gravity pulls, so the speed creeps up.', act: () => ({}) },
    { step: 'brake', seconds: 3.2, watch: 'Both brakes gently: the speed comes down below 25 km/h.', act: (t) => ({ front: Math.min(0.22, t * 0.4), rear: 0.1 }) },
    { step: 'second', seconds: 4, watch: 'Brakes off, clutch in, down to second, clutch out: the engine turns faster and its braking now matches the slope.', act: (t) => (t < 0.3 ? { front: 0, rear: 0, clutch: 1 } : t < 0.4 ? { gear: 2 } : { clutch: Math.max(0, 1 - (t - 0.4) * 0.8) }) },
  ],
}

const WET_R = 40
const wetWorld: WorldSpec = { curvature: 1 / WET_R }

export const wetRoad: CockpitScenario = {
  id: 'wet-road',
  title: 'A wet bend',
  summary: 'A familiar bend, in the rain: slow on the straight, then take it at about 35 km/h so the lean stays small.',
  setup: { gear: 3, running: true, kmh: 50, throttle: 0.25, surface: 'wet' },
  view: 'rider',
  world: wetWorld,
  situation: `It is raining. Ahead is a right-hand bend of about ${WET_R} m radius that you usually take at 60 km/h in the dry. Wet asphalt gives about half the grip. You are at about 50 km/h in third.`,
  objective: 'Slow on the way in, upright, then ride the wet bend at about 35 km/h without locking a wheel.',
  actions: ['Close the throttle smoothly while you are still as upright as the speed allows.', 'Brake progressively until you are below 35 km/h — without locking a wheel.', 'Release the brakes and hold that slower speed through the bend.'],
  mechanical: 'The brakes work exactly as in the dry: the same lever travel pushes the same pads onto the same discs. What changes is how much of that force the tyres can pass to the road before they lock. Slowing first also cuts the lean the bend asks for.',
  road: 'A wet road gives roughly half the dry grip (about 0.5 instead of 0.9 here). The road curves away to the right. Lean is speed in this bend: as you slow, the motorcycle stands up.',
  why: 'In the wet, slow down before bends, keep the lean small and every input smooth. The same squeeze that works in the dry can lock a wheel here.',
  mistakes: [
    { id: 'front-lock', title: 'Locking the front wheel', text: 'On a wet road the front locks at about half the force it would take in the dry. Release and squeeze again, more gently.' },
    { id: 'rear-lock', title: 'Locking the rear wheel', text: 'The rear tyre carries little load under braking, and on a wet road it locks very easily. Use a lighter foot.' },
    { id: 'stall', title: 'Stalling', text: 'If you slow too far in third, pull the clutch in or change down.' },
  ],
  safety: [RIDE_SAFETY, 'In the wet, double your following distance and avoid painted lines, metal covers and diesel spills.', MODEL_NOTE],
  steps: [
    {
      id: 'roll-off',
      title: 'Close the throttle',
      instruction: 'Close the throttle smoothly. All the slowing happens before you ask the bend for lean.',
      highlight: ['throttle'],
      done: (s, i, d) => i.throttle === 0 && s.acceleration < 0 && d.kmh > 20,
      explanation: 'Engine braking slows you gently and settles the load onto the front before you brake.',
    },
    {
      id: 'brake',
      title: 'Slow before the lean',
      instruction: 'Squeeze the front brake progressively, with a little rear, until you are below 35 km/h — without locking a wheel.',
      highlight: ['frontBrake', 'rearBrake'],
      done: (s, i, d) => (i.front ?? 0) > 0 && d.kmh < 35 && d.kmh > 8 && !s.brakes.front.locked && !s.brakes.rear.locked,
      explanation: 'Below 35 km/h the bend asks for a much smaller lean, with grip in reserve for the wet.',
    },
    {
      id: 'hold',
      title: 'Ride the slower bend',
      instruction: 'Release the brakes and hold about 35 km/h through the bend.',
      highlight: ['throttle'],
      done: (s, i, d) => (i.front ?? 0) === 0 && s.locked && d.kmh > 26 && d.kmh < 42 && s.distance > 16,
      explanation: 'A small lean, off the brakes, on ordinary wet asphalt.',
    },
  ],
  demo: [
    { step: 'roll-off', seconds: 0.6, watch: 'The throttle closes smoothly; engine braking starts the slowing while the motorcycle is still as upright as 50 allows.', act: () => ({ throttle: 0 }) },
    { step: 'brake', seconds: 3.5, watch: 'A gentle wet squeeze brings 50 down through 35. The motorcycle stands up as the speed falls.', act: (_t, s) => (s.speed * 3.6 > 32 ? { front: 0.2, rear: 0.05 } : { front: 0, rear: 0 }) },
    { step: 'hold', seconds: 5.5, watch: 'Brakes off, a little throttle: about 35 km/h holds through the wet bend.', act: () => ({ throttle: 0.22, front: 0, rear: 0, clutch: 0 }) },
  ],
}

const GRAVEL_R = 30
const gravelWorld: WorldSpec = { curvature: 1 / GRAVEL_R }

export const gravel: CockpitScenario = {
  id: 'gravel',
  title: 'Gravel in a bend',
  summary: 'Loose gravel across a bend: slow on the way in, mostly rear brake, then ride through upright.',
  setup: { gear: 3, running: true, kmh: 40, throttle: 0.2, surface: 'gravel' },
  view: 'rider',
  world: gravelWorld,
  situation: `You are approaching a right-hand bend of about ${GRAVEL_R} m radius at 40 km/h. Loose gravel is spread across your lane in the middle of the bend.`,
  objective: 'Slow on the way in with gentle, mostly-rear braking, then ride through the gravel upright without locking a wheel.',
  actions: ['Close the throttle smoothly, while you are still as upright as 40 km/h allows.', 'Slow with the rear brake alone to about 20 km/h.', 'Release the brakes and hold that slower speed through the gravel, upright.'],
  mechanical: 'Nothing changes in the brakes. The tyre’s grip is far lower on loose stones (about 0.35 here), so every brake force is closer to the point where the wheel stops turning. Slowing first also cuts the lean the bend asks for.',
  road: 'Loose stones roll under the tyre. A locked front wheel on gravel washes out at once; the rear is easier to control. The road curves away: lean is speed, so slower is more upright.',
  why: 'Gravel in a bend punishes sudden inputs and lean together. Slow on the grippier tarmac first, then ride through upright.',
  mistakes: [
    { id: 'front-lock', title: 'Locking the front wheel', text: 'On loose gravel the front grips at only about a third of the dry force. Release it at once and use mostly rear brake.' },
    { id: 'rear-lock', title: 'Locking the rear wheel', text: 'Even the rear brake locks easily on gravel. Press the pedal more gently.' },
    { id: 'stall', title: 'Stalling', text: 'If you slow too far in third, pull the clutch in or change down.' },
  ],
  safety: [RIDE_SAFETY, 'On gravel stay upright, look well ahead, keep your speed low and avoid braking in a turn.', MODEL_NOTE],
  steps: [
    {
      id: 'roll-off',
      title: 'Close the throttle',
      instruction: 'Close the throttle smoothly, before you ask the bend for lean.',
      highlight: ['throttle'],
      done: (s, i, d) => i.throttle === 0 && s.acceleration < 0 && d.kmh > 16,
      explanation: 'A smooth roll-off avoids upsetting the tyres on the loose surface.',
    },
    {
      id: 'rear',
      title: 'Slow with the rear brake',
      instruction: 'Press the rear brake gently on its own until you are below 20 km/h.',
      highlight: ['rearBrake', 'rearWheel'],
      done: (s, i, d) => (i.rear ?? 0) > 0 && (i.front ?? 0) === 0 && d.kmh > 6 && d.kmh < 20 && !s.brakes.rear.locked,
      explanation: 'The rear brake slows you steadily, and if it does slide, the motorcycle stays upright far more easily than with the front.',
    },
    {
      id: 'hold',
      title: 'Ride through upright',
      instruction: 'Release the brakes and hold that slower speed through the gravel, upright.',
      highlight: ['throttle'],
      done: (s, i, d) => (i.front ?? 0) === 0 && (i.rear ?? 0) === 0 && s.locked && d.kmh > 10 && d.kmh < 24 && s.distance > 18,
      explanation: 'Through the gravel, upright, off the brakes: the least the tyres can take.',
    },
  ],
  demo: [
    { step: 'roll-off', seconds: 0.6, watch: 'A smooth roll-off, so the tyres aren’t upset before the gravel.', act: () => ({ throttle: 0 }) },
    { step: 'rear', seconds: 4, watch: 'The rear brake alone, gently: 40 falls toward 20 and the motorcycle stands up.', act: (_t, s) => (s.speed * 3.6 > 18 ? { rear: 0.18 } : { rear: 0 }) },
    { step: 'hold', seconds: 5, watch: 'Brakes off, a breath of throttle: the slower speed holds through the gravel bend.', act: () => ({ throttle: 0.14, rear: 0, front: 0, clutch: 0 }) },
  ],
}

/** A car pulls out from the left and stops across the lane, this far ahead, m. */
const PULL_OUT = 32
const pullOut: WorldSpec = {
  cross: { at: PULL_OUT, x0: -7, vx: (w) => (w.crossX != null && w.crossX < 0.3 ? 5.5 : 0) },
}
const pullOutWatch = (spec: WorldSpec) => (_prev: { distance: number }, s: { distance: number }, _i: unknown, _d: unknown, w: { crossX: number | null }) => {
  const cg = crossGap(spec, s.distance)
  return cg != null && Math.abs(cg) < NOSE && w.crossX != null && Math.abs(w.crossX) < 1.5 ? ('collision' as const) : null
}

export const emergencyBraking: CockpitScenario = {
  id: 'emergency-braking',
  title: 'Emergency braking',
  summary: 'A car pulls out from the side: brake as hard as the tyres allow and stop before reaching it.',
  setup: { gear: 3, running: true, kmh: 50, throttle: 0.25, paused: true },
  view: 'rider',
  world: pullOut,
  watch: pullOutWatch(pullOut),
  situation: `You are riding at 50 km/h in third gear on a dry road. A car pulls out from the left and stops across your lane, ${PULL_OUT} m ahead. The scenario waits, paused, until you touch a control.`,
  objective: 'Stop as quickly as the tyres allow, before you reach the car, without locking a wheel.',
  actions: ['Close the throttle and squeeze the front brake firmly but progressively, with the rear brake too.', 'Pull the clutch in and hold both brakes until you stop.'],
  mechanical: 'The harder you squeeze, the harder the pads clamp the disc — up to the point where the tyre can no longer grip and the wheel stops turning. Load transfer takes a fraction of a second to build, which is why the lever is squeezed rather than grabbed.',
  road:
    'The car comes from the left and sits across your lane. As you brake, load moves onto the front tyre and the fork compresses. The front tyre can then grip much harder than at rest; the rear, now lightly loaded, locks easily. At 50 km/h, braking at about 0.8 g takes roughly 12 m — plus the distance covered before you react.',
  why: 'An emergency stop is a skill practised beforehand, not invented on the day. Squeezing the front progressively, but quickly, uses all the grip without exceeding it.',
  mistakes: [
    { id: 'collision', title: 'Reaching the car', text: 'You did not stop in the space you had. Brake sooner and harder — firmly squeezing the front, with the rear too.' },
    { id: 'front-lock', title: 'Locking the front wheel', text: 'A grabbed lever asks for full force before the load has moved onto the front tyre. Release and squeeze again — on a real motorcycle a locked front wheel usually means a fall.' },
    { id: 'rear-lock', title: 'Locking the rear wheel', text: 'Hard braking takes almost all the load off the rear tyre. Ease off the pedal.' },
    { id: 'stall', title: 'Stalling as you stop', text: 'Pull the clutch in as you come to a stop.' },
  ],
  safety: [RIDE_SAFETY, 'Brake hard only while upright and travelling straight. ABS stops the wheels locking, but it does not shorten the distance you need.', MODEL_NOTE],
  steps: [
    {
      id: 'brake',
      title: 'Brake hard',
      instruction: 'Close the throttle and squeeze the front brake firmly — with the rear too — until you are slowing at 0.6 g or more, without locking a wheel.',
      highlight: ['frontBrake', 'rearBrake', 'throttle'],
      done: (s, i) => i.throttle === 0 && (i.front ?? 0) > 0 && -s.acceleration >= 0.6 * G && !s.brakes.front.locked && !s.brakes.rear.locked,
      explanation: 'Most of the load is now on the front tyre: it is doing most of the stopping, close to the limit of its grip.',
    },
    {
      id: 'stop',
      title: 'Stop before the car',
      instruction: 'Pull the clutch in and hold both brakes until you stop — before you reach the car.',
      highlight: ['clutch', 'frontBrake', 'rearBrake'],
      done: (s, _i, d) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (crossGap(pullOut, s.distance) ?? 0) >= NOSE,
      explanation: 'Stopped with room to spare, engine running and no wheel locked.',
    },
  ],
  demo: [
    { step: 'brake', seconds: 1.2, watch: 'The car pulls out from the left. Throttle shut and the front brake squeezed hard but progressively, with some rear.', act: (t) => ({ throttle: 0, front: Math.min(0.6, t * 1.2), rear: 0.1 }) },
    { step: 'stop', seconds: 4, watch: 'Clutch in, both brakes held: the motorcycle stops short of the car, engine running, no wheel locked.', act: () => ({ clutch: 1, front: 0.6, rear: 0.1 }) },
  ],
}

export const emergencyAbs: CockpitScenario = {
  id: 'emergency-abs',
  title: 'Emergency stop with ABS',
  summary: 'The same car pulls out. This motorcycle has ABS: grab both brakes and let it work.',
  setup: { gear: 3, running: true, kmh: 50, throttle: 0.25, paused: true, abs: true },
  view: 'rider',
  world: pullOut,
  watch: pullOutWatch(pullOut),
  situation: `You are riding at 50 km/h in third. A car pulls out from the left and stops across your lane, ${PULL_OUT} m ahead. This motorcycle has ABS. The scenario waits, paused, until you touch a control.`,
  objective: 'Grab both brakes hard and stop before you reach the car. ABS keeps the wheels turning; it does not invent extra distance.',
  actions: ['Close the throttle and grab both brakes hard — this motorcycle has ABS.', 'Keep them on. Let ABS chatter rather than releasing.', 'Pull the clutch in and stop short of the car.'],
  mechanical: 'ABS holds the brake force at the tyre’s limit instead of letting the wheel lock. A grab that would lock the front without ABS is now a hard, straight stop. The distance is still set by grip and speed: ABS does not shorten it, it stops you wasting it on a slide.',
  road: 'The car comes from the left and sits across your lane. At 50 km/h a hard stop still needs roughly 12 m plus reaction. Grabbing without ABS locks the front; grabbing with it keeps the wheel rolling.',
  why: 'ABS is not a shorter stop. It is permission to grab and stay upright. Without it, the same grab is a fall. The distance you need does not change.',
  mistakes: [
    { id: 'collision', title: 'Reaching the car', text: 'ABS did not invent metres. Brake at once — a late grab still runs out of road.' },
    { id: 'front-lock', title: 'Locking the front wheel', text: 'This motorcycle has ABS, so a grab should not lock. If it did, the system was not holding.' },
    { id: 'rear-lock', title: 'Locking the rear wheel', text: 'ABS should keep the rear turning too. Keep the pedal on and let it work.' },
    { id: 'stall', title: 'Stalling as you stop', text: 'Pull the clutch in as you come to a stop.' },
  ],
  safety: [RIDE_SAFETY, 'ABS keeps the wheels turning so you can still steer. It does not let you arrive faster than you can stop.', MODEL_NOTE],
  steps: [
    {
      id: 'grab',
      title: 'Grab both brakes',
      instruction: 'Close the throttle and grab both brakes hard. This motorcycle has ABS — keep them on.',
      highlight: ['frontBrake', 'rearBrake', 'throttle'],
      done: (s, i) => i.throttle === 0 && (i.front ?? 0) >= 0.85 && (i.rear ?? 0) >= 0.15 && -s.acceleration >= 0.6 * G && !s.brakes.front.locked,
      explanation: 'A grab that would lock the front without ABS is now a hard stop. The wheels are still turning.',
    },
    {
      id: 'stop',
      title: 'Stop before the car',
      instruction: 'Keep the brakes on, pull the clutch in, and stop short of the car.',
      highlight: ['clutch', 'frontBrake', 'rearBrake'],
      done: (s, _i, d) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && (crossGap(pullOut, s.distance) ?? 0) >= NOSE,
      explanation: 'Stopped with room to spare. ABS held the tyres at the limit; the distance was still the distance.',
    },
  ],
  demo: [
    { step: 'grab', seconds: 1, watch: 'The car pulls out. Throttle shut and both brakes grabbed: ABS holds the wheels at the limit instead of locking them.', act: () => ({ throttle: 0, clutch: 1, front: 1, rear: 0.25 }) },
    { step: 'stop', seconds: 4, watch: 'Brakes held, clutch in: the motorcycle stops short of the car, wheels still turning.', act: () => ({ clutch: 1, front: 1, rear: 0.25 }) },
  ],
}

export const roadConditionScenarios = [uphillStart, downhill, wetRoad, gravel, emergencyBraking, emergencyAbs]
