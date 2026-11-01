import { clampingForce } from '@/lib/mechanics/clutch'
import {
  CLUTCH_CAPACITY,
  EFFICIENCY,
  LIMITER_RPM,
  STALL_RPM,
  WHEEL_RADIUS,
  clutchCapacity,
  drivelineSpeed,
  overallRatioFor,
  radToRpm,
  rpmPerKmh,
  type PowertrainInputs,
  type PowertrainState,
} from '@/lib/mechanics/powertrain'

import type { Exercise, ExerciseContext, Topic } from '@/lib/simulation/exercises'

/** Content and scoring for the clutch & throttle simulator. */

const kmh = (c: ExerciseContext) => c.state.speed * 3.6
const firstGear: PowertrainInputs = { gear: 1, clutch: 1, throttle: 0, brake: 0, grade: 0 }
export const SMOOTH_LIMIT = 2.5
export const HILL_GRADE = 0.12

export const exercises: Exercise[] = [
  {
    id: 'biting-point',
    title: 'Find the biting point',
    goal: 'In first gear with no throttle, let the clutch out until the motorcycle just creeps forward — then hold the lever there for 2 seconds.',
    tips: ['Release the lever very slowly from the grip.', 'Watch the two needles: the engine slows slightly and the wheel side starts to rise.', 'When it creeps, stop moving the lever.'],
    setup: { inputs: firstGear },
    evaluate: (c) => {
      if (c.stalled) return { result: 'fail', text: 'Stalled — the clutch bit too hard. Try releasing more slowly, and stop as soon as the motorcycle moves.' }
      if (c.creepSeconds >= 2) return { result: 'pass', text: 'That is the biting point: the clutch is only partly clamped, passing just enough torque to creep. Holding the lever here is how you control very slow speeds.' }
      return null
    },
  },
  {
    id: 'pull-away',
    title: 'Pull away without stalling',
    goal: 'From a standstill in first gear, reach 10 km/h with the clutch fully released.',
    tips: ['Add a little throttle first (about 15–25 %).', 'Release the clutch slowly through the friction zone.', 'Once the needles meet, let the lever out fully.'],
    setup: { inputs: firstGear },
    evaluate: (c) => {
      if (c.stalled) return { result: 'fail', text: 'Stalled. Use a little more throttle, and spend longer in the friction zone so the engine isn’t dragged down.' }
      if (kmh(c) >= 10 && c.state.locked && clampingForce(c.inputs.clutch) === 1) return { result: 'pass', text: 'Smoothly away: the clutch slipped while the speeds matched, then locked engine and wheel together.' }
      return null
    },
  },
  {
    id: 'smooth',
    title: 'Accelerate smoothly',
    goal: `Reach 20 km/h in first gear without ever accelerating harder than ${SMOOTH_LIMIT} m/s².`,
    tips: ['Use a little throttle and ease the clutch to the friction zone.', 'Hold the lever there until the two needles meet — only then let it out fully.', 'Releasing it while the engine is still much faster than the wheel side dumps the flywheel’s energy into a lurch.'],
    setup: { inputs: firstGear },
    evaluate: (c) => {
      if (c.stalled) return { result: 'fail', text: 'Stalled. Balance a little throttle against a slow clutch release.' }
      if (c.maxAccel > SMOOTH_LIMIT) return { result: 'fail', text: `Too abrupt: you hit ${c.maxAccel.toFixed(1)} m/s². That jerk unsettles the motorcycle and a passenger. Use less throttle and a slower release.` }
      if (kmh(c) >= 20 && c.state.locked) return { result: 'pass', text: `Smooth: 20 km/h with a peak of only ${c.maxAccel.toFixed(1)} m/s².` }
      return null
    },
  },
  {
    id: 'hill-start',
    title: 'Hill start',
    goal: `On a ${Math.round(HILL_GRADE * 100)} % uphill, held on the brake, pull away to 8 km/h without rolling back more than 30 cm.`,
    tips: ['Keep the brake on while you set about half throttle — a hill needs more torque than flat ground.', 'Release the clutch to the biting point until you feel the motorcycle pull against the brake.', 'Then release the brake and keep easing the clutch out until it is fully released.'],
    setup: { inputs: { ...firstGear, brake: 1, grade: HILL_GRADE } },
    evaluate: (c) => {
      if (c.minDistance < -0.3) return { result: 'fail', text: 'You rolled back. Find the biting point — so the clutch is already pulling — before you let go of the brake.' }
      if (c.stalled) return { result: 'fail', text: 'Stalled. A hill needs more torque: more throttle, and a slower clutch release.' }
      if (kmh(c) >= 8 && c.state.locked) return { result: 'pass', text: 'A clean hill start: the clutch was taking the load before the brake let go.' }
      return null
    },
  },
  {
    id: 'stall',
    title: 'Stall it on purpose',
    goal: 'In first gear at a standstill, let the clutch out quickly with no throttle — and watch what happens to the needles.',
    tips: ['Just let go of the lever.'],
    setup: { inputs: firstGear },
    evaluate: (c) =>
      c.stalled
        ? {
            result: 'pass',
            text: `That is a stall. The clutch suddenly connected the engine to a stationary rear wheel through a ${overallRatioFor(1).toFixed(0)} : 1 reduction. The engine couldn’t produce enough torque to accelerate the motorcycle, so it was dragged below ${STALL_RPM} RPM and stopped.`,
          }
        : null,
  },
  {
    id: 'stop',
    title: 'Stop without stalling',
    goal: 'You are riding at 15 km/h in first. Brake to a complete stop with the engine still running.',
    tips: ['Brake as normal.', 'Pull the clutch in before the engine drops towards idle — at around 5 km/h in first.'],
    setup: { inputs: { gear: 1, clutch: 0, throttle: 0, brake: 0, grade: 0 }, state: { speed: 15 / 3.6, engine: drivelineSpeed(15 / 3.6, 1), locked: true } },
    evaluate: (c) => {
      if (c.stalled) return { result: 'fail', text: `Stalled: in gear, the engine turns ${rpmPerKmh(1).toFixed(0)} RPM per km/h, so below about ${(STALL_RPM / rpmPerKmh(1)).toFixed(1)} km/h the wheel drags it under ${STALL_RPM} RPM. Pull in the clutch before you stop.` }
      if (c.t > 1 && Math.abs(c.state.speed) < 0.05 && c.state.running) return { result: 'pass', text: 'Stopped with the engine idling: pulling in the clutch disconnected it from the wheel before the wheel could stall it.' }
      return null
    },
  },
]

export const topics: Topic[] = [
  {
    title: 'Clutch operation',
    text: 'Pulling the lever releases the springs’ clamping force so the plates slip and the engine is disconnected from the gearbox. Releasing it clamps them together again.',
    exercise: 'biting-point',
  },
  {
    title: 'The biting point',
    text: 'The point in the lever’s travel where the plates first start to grip and pass torque. Below it nothing happens; at it, the motorcycle wants to creep.',
    exercise: 'biting-point',
  },
  {
    title: 'The friction zone',
    text: 'The range of lever travel between the biting point and full engagement. The clutch slips, passing only part of the engine’s torque — this is where you control pulling away and very slow speeds.',
    exercise: 'pull-away',
  },
  {
    title: 'Engagement and disengagement',
    text: 'Engaged: engine and wheel turn together, locked by the clutch. Disengaged: they are independent. Disengage before stopping and to change gear; engage gradually when moving off.',
    exercise: 'stop',
  },
  {
    title: 'Throttle operation',
    text: 'The throttle sets how hard the engine pushes. In neutral it only changes RPM; in gear with the clutch engaged it changes the push at the rear tyre. Closing it in gear gives engine braking.',
  },
  {
    title: 'Balancing clutch and throttle',
    text: 'Pulling away needs both: the throttle supplies torque while the clutch feeds it to the wheel gradually. Too little throttle stalls; too much makes the engine race and the clutch overheat.',
    exercise: 'hill-start',
  },
  {
    title: 'Preventing stalling',
    text: 'An engine stalls when the load drags it below its minimum speed. Engage the clutch slowly with a little throttle, and disengage it before the motorcycle stops.',
    exercise: 'stall',
  },
  {
    title: 'Smooth acceleration',
    text: 'Smoothness comes from progressive inputs: a gradual clutch release and a throttle rolled on, not snapped. Releasing the clutch at high RPM dumps the flywheel’s energy into a lurch.',
    exercise: 'smooth',
  },
]

/** A plain-language account of what the clutch, engine and wheel are doing right now. */
export function explain(s: PowertrainState, input: PowertrainInputs): { title: string; text: string; tone: 'ok' | 'caution' | 'danger' | 'info' } {
  const engineRpm = radToRpm(s.engine)
  const wheelRpm = radToRpm(drivelineSpeed(s.speed, input.gear))
  const capacity = clutchCapacity(input.clutch)
  const clamp = clampingForce(input.clutch)

  if (!s.running) {
    return {
      title: 'Engine stalled',
      tone: 'danger',
      text:
        s.stallCause === 'load'
          ? `The clutch was fully engaged, so the engine was tied to the wheel at ${rpmPerKmh(input.gear || 1).toFixed(0)} RPM per km/h. As the motorcycle slowed, the wheel dragged the engine below ${STALL_RPM} RPM. Pull in the clutch (or select neutral) and restart.`
          : `The clutch engaged faster than the engine could supply torque. Trying to accelerate the motorcycle through the gearing dragged the engine below ${STALL_RPM} RPM. Pull in the clutch (or select neutral) and restart.`,
    }
  }
  if (input.gear === 0) {
    return {
      title: 'Neutral',
      tone: 'info',
      text:
        engineRpm >= LIMITER_RPM - 50
          ? 'Neutral, with the engine on its rev limiter: it cuts power to protect itself. Ease off.'
          : `No gear pair is locked, so the clutch makes no difference to the wheel. The throttle only changes engine speed — now ${Math.round(engineRpm).toLocaleString('en')} RPM.`,
    }
  }
  if (clamp === 0) {
    return {
      title: 'Clutch disengaged',
      tone: 'info',
      text: `The plates are separated: the engine (${Math.round(engineRpm).toLocaleString('en')} RPM) and the rear wheel turn independently. Letting the lever out towards the biting point will start to connect them.`,
    }
  }
  if (!s.locked) {
    const slip = s.engine - drivelineSpeed(s.speed, input.gear)
    const heat = Math.abs(s.clutchTorque * slip)
    return {
      title: 'Friction zone — the clutch is slipping',
      tone: 'caution',
      text: `The clutch can pass up to ${capacity.toFixed(1)} N·m and is passing ${Math.abs(s.clutchTorque).toFixed(1)} N·m. The engine turns at ${Math.round(engineRpm).toLocaleString('en')} RPM but the wheel side only at ${Math.round(Math.max(0, wheelRpm)).toLocaleString('en')} RPM — that difference is slip, turning about ${Math.round(heat)} W into heat in the plates. The speeds come together as the motorcycle accelerates.`,
    }
  }
  if (s.engineTorque < 0) {
    return {
      title: 'Engaged — engine braking',
      tone: 'ok',
      text: `Engine and wheel are locked together (${rpmPerKmh(input.gear).toFixed(0)} RPM per km/h). With the throttle closed, the engine’s internal friction resists the wheel, slowing the motorcycle.`,
    }
  }
  const push = (s.clutchTorque * overallRatioFor(input.gear) * EFFICIENCY) / WHEEL_RADIUS
  return {
    title: 'Engaged — engine and wheel locked together',
    tone: 'ok',
    text:
      engineRpm >= LIMITER_RPM - 50
        ? 'On the rev limiter: the engine is at its maximum speed in this gear. Time to change up.'
        : `The clutch isn’t slipping, so engine speed is tied to road speed: ${rpmPerKmh(input.gear).toFixed(0)} RPM per km/h in first. The ${s.clutchTorque.toFixed(1)} N·m passing through the clutch becomes a push of about ${Math.round(push)} N at the tyre — well within the clutch’s ${CLUTCH_CAPACITY} N·m capacity.`,
  }
}
