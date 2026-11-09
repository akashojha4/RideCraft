import { G } from '@/lib/mechanics/braking'
import type { CockpitScenario } from './types'

/*
 * Short practice drills that lessons send learners to: each isolates one control and opens in
 * the view where its effect is clearest.
 */

const MOVING = 0.2 // m/s
const RIDE_SAFETY = 'Practise these controls for real only in a closed area with a qualified instructor, never as an experiment on a public road.'
const MODEL_NOTE = 'This simulator is a simplified model: a real motorcycle will feel different.'

export const clutchDrill: CockpitScenario = {
  id: 'clutch-drill',
  title: 'Clutch drill',
  summary: 'Pull the lever and watch the plates separate; ease it out and watch them slip, then grip.',
  setup: { gear: 0, running: true },
  view: 'machine',
  situation: 'The engine is idling in neutral and the motorcycle is standing still. “Inside the Machine” is open so you can watch the clutch as you work the lever.',
  objective: 'See how the lever controls the clamp on the plates — disengaged, slipping and locked — and what reaches the rear wheel in each state.',
  actions: ['Pull the clutch lever fully in.', 'Select first gear.', 'Open the throttle a little and ease the lever out to the biting point.', 'Keep easing it out until it is fully released.'],
  mechanical:
    'Pulling the lever makes the pushrod lift the pressure plate off the stack: the clamp load falls to zero and the plates separate. Letting it out lets the springs clamp them again — first just enough to slip and pass a little torque, then enough to grip, so the basket (driven by the crank) and the hub (on the gearbox shaft) turn as one.',
  road: 'At the biting point the motorcycle creeps; once the clutch grips, engine and rear wheel turn together.',
  why: 'The friction zone is how a rider feeds the engine’s drive to a wheel that is turning more slowly — pulling away, and riding at walking pace.',
  mistakes: [
    { id: 'stall', title: 'Stalling', text: 'The clutch took up the load faster than the engine could cope with. Pull it in, press Start, and ease the lever out more slowly with a little more throttle.' },
    { id: 'lurch', title: 'A jerky take-up', text: 'The plates went from slipping to gripping too quickly. Slow down through the last part of the lever’s travel.' },
    { id: 'slip-heat', title: 'Revving hard with the clutch slipping', text: 'High revs with slipping plates turn power into heat. Use less throttle.' },
    { id: 'shift-without-clutch', title: 'Changing gear without the clutch', text: 'Pull the clutch in fully before moving the gear lever.' },
  ],
  safety: [RIDE_SAFETY, MODEL_NOTE],
  steps: [
    {
      id: 'in',
      title: 'Pull the clutch in',
      instruction: 'Pull the clutch lever fully to the grip, and watch the clutch cross-section.',
      highlight: ['clutch', 'basket'],
      done: (s, _i, d) => s.running && d.clamp === 0,
      explanation: 'The pushrod lifted the pressure plate: the clamp load is zero and the plates have a gap between them. The springs are squeezed harder, which is why the lever feels heavier the further you pull.',
    },
    {
      id: 'first',
      title: 'Select first gear',
      instruction: 'Keep the clutch in and press the gear lever down into first.',
      highlight: ['gearbox', 'mainshaft'],
      done: (s, i, d) => s.running && i.gear === 1 && d.clamp === 0,
      explanation: 'The gearbox now ties the hub to the stationary rear wheel, so the hub has stopped while the basket keeps turning. In the power flow the link stops at the clutch: “clutch pulled in”.',
    },
    {
      id: 'slip',
      title: 'Find the biting point',
      instruction: 'Open the throttle a little and ease the lever out until the motorcycle creeps.',
      highlight: ['clutch', 'basket', 'mainshaft'],
      done: (s, i, d) => s.running && i.gear === 1 && d.slipping && s.speed > MOVING,
      explanation: 'The plates are clamped just enough to slip: they pass some torque, the basket and hub turn at different speeds, and the power flow shows the clutch “slipping” — with the heat it makes.',
    },
    {
      id: 'lock',
      title: 'Let it grip',
      instruction: 'Keep easing the lever out until it is fully released.',
      highlight: ['clutch', 'chain', 'wheel'],
      done: (s, _i, d) => s.running && s.locked && d.clamp === 1,
      explanation: 'Full clamp load: the basket and hub turn together, nothing slips, and every link from the engine to the rear wheel is driving.',
    },
  ],
  demo: [
    { step: 'in', seconds: 0.8, watch: 'The lever comes in fully: the pressure plate lifts and the plates separate — the clamp falls to zero.', act: (t) => ({ clutch: Math.min(1, t * 3) }) },
    { step: 'first', seconds: 0.6, watch: 'First gear selected with the clutch in: the gearbox now joins the rear wheel, but the plates are still apart.', act: () => ({ gear: 1 }) },
    { step: 'slip', seconds: 3, watch: 'A little throttle, and the lever eases to the biting point: the plates start to grip while still slipping — basket and hub turn at different speeds.', act: (t) => ({ throttle: 0.25, clutch: Math.max(0.3, 0.42 - t * 0.04) }) },
    { step: 'lock', seconds: 5, watch: 'The lever goes on out: the slip shrinks to nothing and the plates lock — engine and rear wheel now turn together.', act: (t) => ({ throttle: 0.35, clutch: Math.max(0, 0.3 - t * 0.1) }) },
  ],
}

/** A clean gear change: throttle off and clutch in, select, clutch out smoothly, throttle back (to `after`). */
const cleanChange =
  (gear: number, after = 0.3) =>
  (t: number) =>
    t < 0.3 ? { clutch: 1, throttle: 0 } : t < 0.4 ? { gear } : { clutch: Math.max(0, 0.4 - (t - 0.4) * 0.3), throttle: after }

export const gearsDrill: CockpitScenario = {
  id: 'gears-drill',
  title: 'Gears drill',
  summary: 'Change up and down while riding, and watch the gearbox and the RPM–speed link change.',
  setup: { gear: 1, running: true, kmh: 15, throttle: 0.25 },
  view: 'machine',
  situation: 'You are riding at about 15 km/h in first gear on a quiet road. “Inside the Machine” is open at the gearbox.',
  objective: 'Change up to second and third, then down to second, and see how each gear changes the engine speed for the same road speed.',
  actions: [
    'Change up to second: clutch in, throttle closed, lift the lever, clutch out, throttle back on.',
    'Change up to third the same way.',
    'Close the throttle and change down to second; let the clutch out smoothly.',
  ],
  mechanical:
    'Each gear is a different pair of gears locked to their shafts by a dog. Lower gears have a bigger ratio: first turns the engine 30 times for each turn of the rear wheel, second about 19, third about 14. Changing up lowers the engine speed by the ratio between the two gears; changing down raises it.',
  road: 'In a higher gear the motorcycle carries on at the same speed with the engine turning more slowly. After a downshift with the throttle closed, the rear wheel turns the engine faster and engine braking slows the motorcycle.',
  why: 'Gears keep the engine in its useful speed range across the motorcycle’s speed range: low gears for pulling away and climbing, high gears for cruising.',
  mistakes: [
    { id: 'shift-without-clutch', title: 'Changing gear without the clutch', text: 'Pull the clutch in fully before moving the gear lever.' },
    { id: 'lurch', title: 'A jerky clutch release', text: 'After the change, let the clutch out smoothly so the engine and wheel speeds can meet.' },
    { id: 'over-rev', title: 'Revving too high', text: 'Change up before the engine speed climbs too far.' },
    { id: 'stall', title: 'Stalling', text: 'At very low speed a high gear can drag the engine down. Pull the clutch in, restart, and use a lower gear.' },
  ],
  safety: [RIDE_SAFETY, MODEL_NOTE],
  steps: [
    {
      id: 'second',
      title: 'Change up to second',
      instruction: 'Clutch in, throttle closed, lift the lever into second, then clutch out and a little throttle.',
      highlight: ['clutch', 'gearbox', 'countershaft'],
      done: (s, i, d) => s.running && i.gear === 2 && s.locked && d.clamp === 1,
      explanation: 'Second gear’s ratio is 1.88 : 1 against first’s 3.00 : 1, so at the same road speed the engine turns about 1.6 times slower — about 167 RPM per km/h instead of 267.',
    },
    {
      id: 'third',
      title: 'Change up to third',
      instruction: 'Do the same again to select third.',
      highlight: ['clutch', 'gearbox', 'countershaft'],
      done: (s, i, d) => s.running && i.gear === 3 && s.locked && d.clamp === 1,
      explanation: 'Third (1.40 : 1) drops the engine speed by another third or so: about 125 RPM per km/h. The torque reaching the rear wheel drops by the same ratio.',
    },
    {
      id: 'down',
      title: 'Change down to second',
      instruction: 'Close the throttle, pull the clutch in, press the lever down into second, and let the clutch out smoothly without opening the throttle.',
      highlight: ['gearbox', 'crank', 'wheel'],
      done: (s, i, d) => s.running && i.gear === 2 && s.locked && d.clamp === 1 && s.clutchTorque < 0,
      explanation: 'Back in second the wheel turns the engine faster for the same speed, against its friction and intake vacuum — the power flow runs backwards, from the wheel to the engine. That is engine braking.',
    },
  ],
  demo: [
    { step: 'second', seconds: 3, watch: 'Throttle off, clutch in, lift to second, clutch out smoothly, throttle back: the revs drop as the taller gear takes over.', act: cleanChange(2) },
    { step: 'third', seconds: 3, watch: 'The same sequence into third: the revs drop again for the same road speed.', act: cleanChange(3) },
    { step: 'down', seconds: 3, watch: 'Clutch in, press down to second, clutch out with the throttle closed: the revs rise and engine braking slows the motorcycle.', act: cleanChange(2, 0) },
  ],
}

export const brakesDrill: CockpitScenario = {
  id: 'brakes-drill',
  title: 'Brakes drill',
  summary: 'Try the front brake, the rear brake and both together, and watch the load transfer.',
  setup: { gear: 3, running: true, kmh: 40, throttle: 0.2 },
  view: 'road',
  situation: 'You are riding at about 40 km/h in third gear on a straight, dry, empty road. “Road Response” is open so you can see the motorcycle and its suspension.',
  objective: 'Feel the difference between the front and rear brakes, and stop with both — without locking a wheel.',
  actions: ['Close the throttle and squeeze the front brake progressively.', 'Release it, then press the rear brake alone.', 'Pull the clutch in and use both brakes to stop.'],
  mechanical: 'Each lever or pedal pressurises brake fluid that pushes the caliper’s pads onto the disc. The braking force a tyre can make is limited by its grip, which depends on the load on it.',
  road:
    'Braking acts at the road, below the centre of mass, so load transfers onto the front tyre: the fork compresses and the rear extends. The front tyre gains grip and can do most of the stopping; the rear loses it and locks easily.',
  why: 'Knowing why the front brake does most of the work — and why it must be squeezed, not grabbed — is the basis of stopping quickly and safely.',
  mistakes: [
    { id: 'front-lock', title: 'Locking the front wheel', text: 'A grabbed front brake asks for full force before the load has transferred onto the front tyre. Release it and squeeze progressively — on a real motorcycle a locked front wheel usually means a fall.' },
    { id: 'rear-lock', title: 'Locking the rear wheel', text: 'Under braking the rear tyre carries little load, so it locks easily. Use a lighter foot.' },
    { id: 'stall', title: 'Stalling as you stop', text: 'In gear with the clutch out, the stopping wheel drags the engine down. Pull the clutch in before you stop.' },
  ],
  safety: [RIDE_SAFETY, 'Brake hard only upright and travelling straight.', MODEL_NOTE],
  steps: [
    {
      id: 'front',
      title: 'Front brake only',
      instruction: 'Close the throttle and squeeze the front brake progressively until you are slowing firmly — about 0.3 g, a firm but comfortable stop — without locking the wheel.',
      highlight: ['frontBrake', 'frontWheel'],
      done: (s, i) => (i.front ?? 0) > 0 && (i.rear ?? 0) === 0 && -s.acceleration >= 0.3 * G && !s.brakes.front.locked,
      explanation: 'Load moved onto the front tyre and the fork compressed: the extra load lets the front tyre grip harder, so it can do most of the stopping.',
    },
    {
      id: 'rear',
      title: 'Rear brake only',
      instruction: 'Release the front brake, then press the rear brake pedal on its own.',
      highlight: ['rearBrake', 'rearWheel'],
      done: (s, i) => (i.rear ?? 0) > 0 && (i.front ?? 0) === 0 && -s.acceleration >= 0.1 * G && Math.abs(s.speed) > MOVING,
      explanation: 'The rear brake alone slows the motorcycle only gently: braking takes load off the rear tyre, so it has little grip to give — and it locks easily if pressed harder.',
    },
    {
      id: 'stop',
      title: 'Stop with both brakes',
      instruction: 'Pull the clutch in and use both brakes to come to a stop.',
      highlight: ['frontBrake', 'rearBrake', 'clutch'],
      done: (s, _i, d) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0,
      explanation: 'Stopped, with the engine still running: the front did most of the work and the rear added a little, and the clutch kept the stopping wheel from stalling the engine.',
    },
  ],
  demo: [
    { step: 'front', seconds: 1.2, watch: 'The front brake squeezed on progressively: load moves forward, the fork compresses, the front tyre grips harder.', act: (t) => ({ throttle: 0, front: Math.min(0.4, t * 0.6) }) },
    { step: 'rear', seconds: 0.8, watch: 'Front released, rear pressed alone: the motorcycle slows only gently — the lightly loaded rear tyre has little grip to give.', act: () => ({ front: 0, rear: 0.2 }) },
    { step: 'stop', seconds: 5, watch: 'Clutch in, both brakes to a stop: the front does most of the work, and the clutch keeps the engine running.', act: () => ({ clutch: 1, front: 0.4, rear: 0.15 }) },
  ],
}
