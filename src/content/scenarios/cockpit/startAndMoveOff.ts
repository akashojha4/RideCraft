import type { CockpitScenario } from './types'

/*
 * Cockpit scenario 1: starting the engine and moving off, up to the change into second gear.
 */

const MOVING = 0.2 // m/s

export const startAndMoveOff: CockpitScenario = {
  id: 'start-and-move-off',
  title: 'Starting and moving off',
  summary: 'From engine off to riding away in first and changing into second.',
  setup: { gear: 1, running: false },
  view: 'rider',
  situation:
    'You are sitting on a small geared motorcycle on a quiet, level road with a clear view ahead. It was parked in first gear with the engine off, as riders often leave it so it can’t roll away.',
  objective: 'Start the engine, pull away smoothly in first gear without stalling, and change up to second.',
  actions: [
    'Find neutral (the green N light) with a gentle half-lift of the gear lever.',
    'Press the starter button.',
    'Pull the clutch lever fully in.',
    'Press the gear lever down into first.',
    'Open the throttle a little (about a quarter).',
    'Ease the clutch out slowly to the biting point, until the motorcycle starts to creep.',
    'Keep easing it out, adding a little throttle, until it is fully released.',
    'At a steady speed: clutch in, throttle closed, lift the lever into second, clutch out, throttle back on.',
  ],
  mechanical:
    'The starter spins the crankshaft until the engine fires and idles. With the clutch pulled in, the pressure plate is lifted off the plates, so the basket turns with the engine while the hub — and the gearbox behind it — can stop. Selecting first slides a dog into engagement, tying the hub to the stationary rear wheel through about 30 : 1. Letting the lever out lets the springs clamp the plates again: first they slip and pass a little torque, then they grip, and engine and rear wheel turn together.',
  road:
    'The motorcycle creeps forward at the biting point, then accelerates as the clutch takes up the drive. Under acceleration load transfers to the rear tyre and the rear suspension squats slightly. In second gear the engine turns more slowly for the same road speed.',
  why:
    'A running engine can’t be connected to a stationary wheel all at once: through first gear it would be asked to accelerate the whole motorcycle instantly, and it would stall or lurch. Slipping the clutch lets the engine keep running while the wheel side speeds up; a little throttle gives it the torque to do so. Once the two sides turn at the same speed, nothing is left to slip and the clutch can be fully released.',
  mistakes: [
    { id: 'start-in-gear', title: 'Starting in gear with the clutch out', text: 'The starter won’t engage the engine with a gear selected and the clutch out — on a real motorcycle the motorcycle could leap forward. Select neutral, or pull the clutch in, then press Start.' },
    { id: 'shift-without-clutch', title: 'Changing gear without the clutch', text: 'With the engine running, the dogs are loaded and won’t slide cleanly. Pull the clutch in fully, then move the lever.' },
    { id: 'stall', title: 'Stalling', text: 'The clutch connected the engine to the rear wheel faster than it could cope with, and dragged it below its minimum speed. Pull the clutch in (or select neutral), press Start, and this time let the lever out more slowly — pause at the biting point — with a little more throttle.' },
    { id: 'lurch', title: 'A jerky start', text: 'The clutch went from slipping to gripping too quickly, so the motorcycle jolted. Let the lever out more slowly through the friction zone, especially the last part.' },
    { id: 'slip-heat', title: 'Revving hard with the clutch slipping', text: 'High revs with a slipping clutch turn a lot of the engine’s power into heat in the plates. Use less throttle and let the clutch out a little further.' },
    { id: 'over-rev', title: 'Revving too high in first', text: 'First gear runs out of revs quickly. Change up to second before the engine screams.' },
  ],
  safety: [
    'Learn and practise moving off in a closed area — a training ground or an empty car park — with a qualified instructor, not on a public road.',
    'Before moving off, check your mirrors and look over your shoulder; on a real road, signal if needed.',
    'Keep both feet ready to steady the motorcycle until it is moving, then put them on the footpegs.',
    'This simulator is a simplified model: a real motorcycle’s clutch, engine and grip will feel different.',
  ],
  steps: [
    {
      id: 'neutral',
      title: 'Find neutral',
      instruction: 'The motorcycle is in first gear with the engine off. Use a gentle half-lift of the gear lever (the Neutral button, or N) to find neutral.',
      highlight: ['gearbox'],
      done: (_s, i) => i.gear === 0,
      explanation: 'Neutral is a half-step between first and second. Now no gear pair is locked: the engine can run without driving the rear wheel.',
    },
    {
      id: 'start',
      title: 'Start the engine',
      instruction: 'On a real motorcycle: ignition on and the kill switch at RUN. Then, in neutral, press Start (or I). Holding the clutch in as well is a good habit — a backup if a gear is still selected.',
      highlight: ['crank'],
      done: (s) => s.running,
      explanation: 'The starter motor spun the crankshaft until the engine fired. It now idles at about 1,400 RPM; in neutral the clutch basket and hub turn with it, but nothing beyond the gearbox does.',
    },
    {
      id: 'clutch-in',
      title: 'Pull the clutch in',
      instruction: 'Pull the clutch lever fully to the grip (drag it, or hold A).',
      highlight: ['clutch', 'basket'],
      done: (s, _i, d) => s.running && d.clamp === 0,
      explanation: 'The pushrod has lifted the pressure plate: the plates are apart, so the gearbox can now be disconnected from the engine.',
    },
    {
      id: 'first',
      title: 'Select first gear',
      instruction: 'Keep the clutch in and press the gear lever down into first (Press, or D).',
      highlight: ['gearbox', 'mainshaft'],
      done: (s, i, d) => s.running && i.gear === 1 && d.clamp === 0,
      explanation: 'A dog slid into first gear. The clutch hub is now tied to the stationary rear wheel, so it has stopped while the basket keeps turning with the engine — the plates are apart, so only a little oil drag passes.',
    },
    {
      id: 'throttle',
      title: 'A little throttle',
      instruction: 'Open the throttle a little — about a quarter (drag the twist grip, or hold ↑).',
      highlight: ['throttle', 'crank'],
      done: (s, i) => s.running && i.gear === 1 && i.throttle >= 0.1 && i.throttle <= 0.45,
      explanation: 'The engine speeds up a little, so it has torque in reserve for the moment the clutch starts to take up the load.',
    },
    {
      id: 'bite',
      title: 'Find the biting point',
      instruction: 'Ease the clutch lever out slowly until the motorcycle starts to creep forward. Then hold it there for a moment.',
      highlight: ['clutch', 'basket', 'mainshaft'],
      done: (s, i, d) => s.running && i.gear === 1 && d.slipping && s.speed > MOVING,
      explanation: 'That is the biting point: the springs clamp the plates just enough to pass the torque that overcomes rolling resistance. The plates are slipping — the basket and hub turn at different speeds — and the difference becomes heat.',
    },
    {
      id: 'away',
      title: 'Ride away',
      instruction: 'Keep easing the clutch out, adding a little throttle, until it is fully released and you reach 10 km/h.',
      highlight: ['clutch', 'chain', 'wheel'],
      done: (s, _i, d) => s.running && s.locked && d.clamp === 1 && d.kmh >= 10,
      explanation: 'The wheel side caught up with the engine and the plates gripped: engine and rear wheel now turn together through about 30 : 1, and the power flows all the way to the tyre. Load moved onto the rear tyre as you accelerated.',
    },
    {
      id: 'second',
      title: 'Change up to second',
      instruction: 'Clutch in, close the throttle, lift the gear lever into second (Lift, or E), then let the clutch out and roll the throttle back on.',
      highlight: ['clutch', 'gearbox', 'throttle'],
      done: (s, i, d) => s.running && i.gear === 2 && s.locked && d.clamp === 1,
      explanation: 'In second the overall ratio drops to about 19 : 1, so the engine turns about a third slower for the same road speed. You’ve started the engine and moved off — well done.',
    },
  ],
  // The same careful rider the tests check: every step done in order, no mistakes.
  demo: [
    { step: 'neutral', seconds: 0.6, watch: 'The gear indicator shows N: no gear connects the engine to the rear wheel.', act: () => ({ gear: 0 }) },
    { step: 'start', seconds: 1, watch: 'The starter turns the engine over; the revs settle at idle.', act: () => ({ start: true }) },
    { step: 'clutch-in', seconds: 1, watch: 'The clutch lever comes in fully: in the machine view the plates separate.', act: (t) => ({ clutch: Math.min(1, t * 3) }) },
    { step: 'first', seconds: 0.6, watch: 'One press of the gear lever selects first. The clutch is in, so the gear doesn’t reach the engine.', act: () => ({ gear: 1 }) },
    { step: 'throttle', seconds: 0.8, watch: 'A little throttle lifts the revs above idle, so the engine has torque to spare.', act: () => ({ throttle: 0.25 }) },
    { step: 'bite', seconds: 3, watch: 'The lever eases out to the friction zone: the plates start to grip, the revs dip, and the motorcycle creeps.', act: (t) => ({ clutch: Math.max(0.3, 0.42 - t * 0.04) }) },
    { step: 'away', seconds: 6, watch: 'More lever out and a little more throttle: the plates stop slipping and engine and wheel turn together.', act: (t) => ({ clutch: Math.max(0, 0.3 - t * 0.1), throttle: 0.35 }) },
    {
      step: 'second',
      seconds: 4,
      watch: 'Throttle off, clutch in, lift to second, clutch out smoothly, throttle back on: the revs drop as the gear changes.',
      act: (t) => (t < 0.3 ? { clutch: 1, throttle: 0 } : t < 0.4 ? { gear: 2 } : { clutch: Math.max(0, 0.4 - (t - 0.4) * 0.3), throttle: 0.3 }),
    },
  ],
}
