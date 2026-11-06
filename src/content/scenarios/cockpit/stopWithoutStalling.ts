import { G } from '@/lib/mechanics/braking'
import { radToRpm } from '@/lib/mechanics/powertrain'
import type { CockpitScenario } from './types'

/*
 * Stopping without stalling: the controlled stop every ride ends with. The brakes stop the
 * motorcycle; the clutch keeps the stopping rear wheel from dragging the engine below idle.
 */

const MOVING = 0.2 // m/s
const RIDE_SAFETY = 'Practise stopping for real only in a closed area with a qualified instructor, before doing it in traffic.'
const MODEL_NOTE = 'This simulator is a simplified model: a real motorcycle’s engine, gearing and brakes will feel different.'
/** In the demonstration the clutch goes in as the engine falls towards this speed — on this simulated motorcycle, in third, about 20 km/h. */
const CLUTCH_IN_RPM = 2500

export const stopWithoutStalling: CockpitScenario = {
  id: 'stop-without-stalling',
  title: 'Stopping without stalling',
  summary: 'Slow down and stop smoothly with the engine still running: brakes to stop, clutch in before the engine falls below idle.',
  setup: { gear: 3, running: true, kmh: 40, throttle: 0.2 },
  view: 'split',
  situation: 'You are riding at about 40 km/h in third gear on a quiet, straight, dry road, and need to stop at the end of it — with the engine still running, ready to move off again.',
  objective: 'Come to a smooth, controlled stop without stalling, without locking a wheel, and in first gear ready to go.',
  actions: [
    'Close the throttle smoothly.',
    'Squeeze the front brake progressively, with a little rear brake.',
    'Pull the clutch in fully before the engine slows to idle.',
    'Keeping the clutch in, change down to first while still rolling.',
    'Brake gently to a stop, holding the clutch in.',
  ],
  mechanical:
    'With the clutch out, engine and rear wheel are locked together through the gearbox: in third the engine turns a fixed number of times for each turn of the wheel. As the brakes slow the wheel, they slow the engine with it. The engine can’t run below its idle speed, so before that point the clutch must separate the two — then the engine idles on its own while the wheel stops.',
  road: 'Braking moves load onto the front tyre and the fork compresses. With the clutch pulled in the motorcycle simply rolls on its momentum, slowed only by the brakes; it settles back on its suspension as it stops.',
  why: 'Every stop needs this. Stalling at a junction leaves you stranded in traffic, and a stall while still rolling locks the drivetrain briefly — a jolt you don’t want with the brakes on.',
  mistakes: [
    { id: 'stall', title: 'Stalling as you stop', text: 'The clutch stayed out until the stopping rear wheel dragged the engine below its idle speed. Pull the clutch in sooner — before the revs fall to idle.' },
    { id: 'front-lock', title: 'Locking the front wheel', text: 'The lever was grabbed before the load had moved onto the front tyre. Squeeze it progressively.' },
    { id: 'rear-lock', title: 'Locking the rear wheel', text: 'Braking takes load off the rear tyre, so it locks easily. Press the pedal more lightly.' },
    { id: 'shift-without-clutch', title: 'Changing gear without the clutch', text: 'Pull the clutch in fully before moving the gear lever.' },
  ],
  safety: [RIDE_SAFETY, 'Check your mirrors before slowing, and keep the brake on once stopped so drivers behind see your brake light.', MODEL_NOTE],
  steps: [
    {
      id: 'roll-off',
      title: 'Close the throttle',
      instruction: 'Close the throttle smoothly and feel the motorcycle start to slow.',
      highlight: ['throttle'],
      done: (s, i) => i.throttle === 0 && s.acceleration < 0 && s.speed > MOVING,
      explanation: 'With the clutch still out, the rear wheel now turns the engine: its friction and pumping losses slow you gently — engine braking.',
    },
    {
      id: 'brake',
      title: 'Brake progressively',
      instruction: 'Squeeze the front brake progressively, with a little rear brake, until you are slowing firmly — without locking a wheel.',
      highlight: ['frontBrake', 'rearBrake'],
      done: (s, i) => (i.front ?? 0) > 0 && (i.rear ?? 0) > 0 && -s.acceleration >= 0.2 * G && !s.brakes.front.locked && !s.brakes.rear.locked && s.speed > MOVING,
      explanation: 'The brakes slow the wheels, and with the clutch out the engine slows with them — watch the rev counter fall with the speed.',
    },
    {
      id: 'clutch',
      title: 'Clutch in before idle',
      instruction: 'Pull the clutch lever fully in before the engine slows to idle — keep braking.',
      highlight: ['clutch', 'crank', 'rearWheel'],
      done: (s, _i, d) => s.running && d.clamp === 0 && s.speed > MOVING,
      explanation: 'The plates have separated: the engine is free and settles at idle, while the motorcycle rolls on, slowed only by the brakes.',
    },
    {
      id: 'down',
      title: 'Down to first while rolling',
      instruction: 'Keeping the clutch in, press the gear lever down to first while the motorcycle is still rolling.',
      highlight: ['gearbox', 'clutch'],
      done: (s, i, d) => s.running && i.gear === 1 && d.clamp === 0 && s.speed > MOVING,
      explanation: 'The gears still turn as you roll, so they mesh easily; with the clutch in, the lower gear doesn’t reach the engine yet.',
    },
    {
      id: 'stop',
      title: 'Stop, clutch held in',
      instruction: 'Brake gently to a stop, holding the clutch in.',
      highlight: ['frontBrake', 'rearBrake', 'clutch'],
      done: (s, i, d) => s.running && Math.abs(s.speed) < 0.05 && d.clamp === 0 && i.gear === 1,
      explanation: 'Stopped, engine idling, in first and ready to move off. For a longer wait, select neutral (a half-lift) and let the clutch out.',
    },
  ],
  demo: [
    { step: 'roll-off', seconds: 1.5, watch: 'The throttle closes; the speed and the revs start to fall together.', act: () => ({ throttle: 0 }) },
    { step: 'brake', seconds: 1.6, watch: 'Front brake squeezed on progressively, a touch of rear: the fork dives and the revs fall with the speed.', act: (t) => ({ front: Math.min(0.2, 0.05 + t * 0.3), rear: 0.08 }) },
    {
      step: 'clutch',
      seconds: 1.5,
      watch: 'As the revs fall towards idle the clutch goes in: the plates separate and the engine settles at idle on its own.',
      act: (t, s) => ({ front: 0.15, rear: 0.08, clutch: radToRpm(s.engine) < CLUTCH_IN_RPM || t > 0.8 ? 1 : 0 }),
    },
    { step: 'down', seconds: 1.2, watch: 'Clutch held in, two presses of the gear lever: third, second, first — while still rolling.', act: (t) => ({ clutch: 1, front: 0.08, rear: 0.05, ...(t > 0.3 ? { gear: t > 0.7 ? 1 : 2 } : {}) }) },
    { step: 'stop', seconds: 3, watch: 'Gentle braking to a stop, clutch held in: engine idling, first gear ready.', act: () => ({ clutch: 1, front: 0.25, rear: 0.08 }) },
  ],
}
