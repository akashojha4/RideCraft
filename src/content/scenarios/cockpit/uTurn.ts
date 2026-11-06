import { KERB_MARGIN, LOCK_RADIUS, edgeGap } from '@/lib/simulation/cockpitWorld'
import type { CockpitScenario } from './types'

/*
 * The U-turn: the one scenario that steers. The handlebar has three positions (full lock left,
 * straight, full lock right) because a walking-pace U-turn is ridden at full lock, with the
 * speed held by the clutch, throttle and rear brake rather than by steering.
 */

const RIDE_SAFETY = 'Practise U-turns for real only in a closed area with a qualified instructor, before trying one on a road.'
const MODEL_NOTE = 'This simulator is a simplified model: on a real motorcycle you also balance it, and a real turning circle depends on the machine.'
/** Leaning further than this at full lock, at walking pace, is too fast for the turn (deg; about 11 km/h). */
export const MAX_LOCK_LEAN = 20

/** Walking pace by feel: slip the clutch more when faster, less when slower (used by the demonstration). */
const walk = (s: { speed: number }) => ({ throttle: 0.15, clutch: s.speed > 2 ? 0.36 : s.speed < 1.2 ? 0.3 : 0.33 })

export const uTurn: CockpitScenario = {
  id: 'u-turn',
  title: 'U-turn',
  summary: 'Turn round on a two-lane road at walking pace: full lock, speed on the clutch and rear brake, no front brake.',
  setup: { gear: 0, running: true },
  view: 'rider',
  world: { pose: { y: -2.8 } },
  watch: (_prev, s, i, _d, w) => {
    if (!w.pose) return null
    if ((edgeGap(w) ?? 99) < KERB_MARGIN) return 'kerb'
    if (Math.abs(w.pose.lean) > MAX_LOCK_LEAN) return 'too-fast-turn'
    if (w.pose.steer !== 0 && (i.front ?? 0) > 0.05 && s.speed > 0.3) return 'lock-front-brake'
    return null
  },
  situation: `You have pulled in to the left edge of a quiet two-lane road, engine idling in neutral, and need to turn round. The road is 7 m wide; at full lock this motorcycle turns on a circle about ${(LOCK_RADIUS * 2).toFixed(1)} m across.`,
  objective: 'Turn round into the other lane in one smooth movement, at walking pace, without reaching the kerb.',
  actions: [
    'Pull the clutch in and select first.',
    'Look over your right shoulder, then turn the handlebar to full lock right.',
    'Ease the clutch into the friction zone with a little throttle, and ride round at walking pace — speed on the clutch and rear brake.',
    'As you face the other way, straighten the handlebar and ride away.',
  ],
  mechanical:
    'At walking pace the engine at idle would push the motorcycle too fast for the turn even in first. Holding the clutch in its friction zone passes only part of the engine’s torque to the rear wheel; a light rear brake against that drive keeps the speed steady and the drivetrain taut.',
  road:
    'At full lock the front wheel points about 25° across the motorcycle, so it follows a tight circle. Any speed on a circle needs a lean (v² / g·R): at walking pace only a few degrees, but it grows with the square of the speed. A front brake at full lock pushes the front tyre sideways and tips the motorcycle into the turn — the classic low-speed drop.',
  why: 'U-turns are one of the most-failed manoeuvres in riding tests. Doing them on the clutch and rear brake, never the front, at full lock and walking pace, is what keeps the motorcycle stable.',
  mistakes: [
    { id: 'kerb', title: 'Reaching the kerb', text: 'The turn ran out of road. Start from the left edge, turn to full lock before you move off, and keep it there until you face the other way.' },
    { id: 'too-fast-turn', title: 'Too fast for full lock', text: `Leaning more than ${MAX_LOCK_LEAN}° at full lock means too much speed for the turn. Slip the clutch more and drag the rear brake lightly to slow down.` },
    { id: 'lock-front-brake', title: 'Front brake at full lock', text: 'With the handlebar turned, the front brake pushes the tyre sideways and can tip the motorcycle over. Control your speed with the clutch and the rear brake instead.' },
    { id: 'stall', title: 'Stalling in the turn', text: 'The clutch took up too much load at walking pace. Keep it in the friction zone, with a little throttle.' },
    { id: 'lurch', title: 'A jerky take-up', text: 'The clutch gripped suddenly and the motorcycle jumped forward. Keep the lever in the friction zone throughout the turn.' },
  ],
  safety: [RIDE_SAFETY, 'Before turning, check both ways and over your shoulder: a U-turn crosses the whole road.', MODEL_NOTE],
  steps: [
    {
      id: 'first',
      title: 'Select first',
      instruction: 'Pull the clutch lever fully in and select first gear.',
      highlight: ['clutch', 'gearbox'],
      done: (s, i) => s.running && i.gear === 1 && i.clutch >= 0.9 && Math.abs(s.speed) < 0.2,
      explanation: 'Ready to move, with the clutch holding the drive back.',
    },
    {
      id: 'lock',
      title: 'Full lock right',
      instruction: 'Look over your right shoulder, then turn the handlebar to full lock right (→ key, or the “Full lock right” button) before moving.',
      highlight: ['frontWheel'],
      done: (s, _i, _d, w) => w.pose?.steer === 1 && Math.abs(s.speed) < 0.2,
      explanation: 'Turning to full lock before moving uses the whole turning circle from the very start.',
    },
    {
      id: 'round',
      title: 'Ride round at walking pace',
      instruction: 'Ease the clutch into the friction zone with a little throttle and ride round until you face the other way, keeping to walking pace with the clutch and rear brake.',
      highlight: ['clutch', 'throttle', 'rearBrake'],
      done: (s, _i, _d, w) => s.running && (w.pose?.heading ?? 0) >= 2.9 && s.speed > 0.3,
      explanation: 'Round on full lock at walking pace, now facing the other way: only a few degrees of lean, and the clutch setting the speed. Straighten now — any earlier and you would head for the far kerb.',
    },
    {
      id: 'away',
      title: 'Straighten and ride away',
      instruction: 'As you face the other way, straighten the handlebar (← key, or “Straight”) and ride away in the other lane.',
      highlight: ['frontWheel', 'clutch', 'throttle'],
      done: (s, _i, _d, w) => s.running && w.pose?.steer === 0 && Math.abs((w.pose?.heading ?? 0) - Math.PI) < 0.35 && (w.pose?.y ?? 0) > 0.5 && s.speed > 1.5,
      explanation: 'Turned round within the road, in the other lane and riding away.',
    },
  ],
  demo: [
    { step: 'first', seconds: 0.8, watch: 'Clutch in and first selected, standing at the left edge.', act: (t) => (t < 0.4 ? { clutch: Math.min(1, t * 3) } : { gear: 1 }) },
    { step: 'lock', seconds: 0.6, watch: 'A look over the right shoulder, then the handlebar turned to full lock right — before moving.', act: () => ({ steer: 1 }) },
    {
      step: 'round',
      seconds: 9,
      watch: 'Into the friction zone with a little throttle: walking pace on the clutch, full lock all the way round — watch the path on the map and the small lean.',
      act: (_t, s, w) => ({ ...walk(s), steer: (w.pose?.heading ?? 0) < 3.12 ? 1 : 0 }),
    },
    { step: 'away', seconds: 3, watch: 'Facing the other way: handlebar straight, and away in the other lane.', act: (_t, s) => ({ ...walk(s), steer: 0 }) },
  ],
}
