import { GRIP, G, frontShare } from '@/lib/mechanics/braking'
import type { Tone } from '@/lib/simulation/model'
import { clampingForce } from '@/lib/mechanics/clutch'
import { drivelineSpeed, radToRpm, type PowertrainInputs, type PowertrainState } from '@/lib/mechanics/powertrain'
import type { Exercise, ExerciseContext, Topic, Verdict } from '@/lib/simulation/exercises'
import { powertrainAssumptions } from '@/lib/simulation/models/powertrain'
import type { Assumption } from '@/lib/simulation/model'

/** Content, course layouts and scoring for the riding-and-stopping simulator. */

/** A car ahead whose speed follows straight-line segments between [time s, km/h] keys. */
export interface LeadProfile {
  /** Distance of its rear bumper ahead of the start, m. */
  start: number
  keys: [number, number][]
}

/** Features along the road for an exercise. Distances are from the start, m. */
export interface Course {
  stopLine?: number
  finish?: number
  zone?: { at: number; kmh: number }
  /** Gradient rising from 0 at `from` to `grade` at `to`, then staying there. */
  hill?: { from: number; to: number; grade: number }
  lead?: LeadProfile
  /** Speed band to stay in, km/h. */
  band?: [number, number]
}

export type RideExercise = Exercise & { course?: Course }

export const CAR_LENGTH = 4
export const SMOOTH_ACCEL_LIMIT = 3.5
export const STEADY_SECONDS = 15
export const SLOW_DISTANCE = 15
export const SLOW_MIN_TIME = 13
export const SLOW_MAX_KMH = 6
export const STOP_DISTANCE_LIMIT = 18
export const JOLT_LIMIT = 2.5

export const kmhOf = (s: PowertrainState) => (Math.abs(s.speed) < 0.003 ? 0 : s.speed * 3.6)

/** Position (m) and speed (m/s) of the lead car `t` seconds into the exercise. */
export function leadAt(p: LeadProfile, t: number) {
  let position = p.start
  let [prevT, prevV] = [0, p.keys[0][1] / 3.6]
  for (const [kt, kKmh] of p.keys) {
    const v = kKmh / 3.6
    if (t <= kt) {
      const vt = kt > prevT ? prevV + ((v - prevV) * (t - prevT)) / (kt - prevT) : v
      return { position: position + ((prevV + vt) / 2) * (t - prevT), speed: vt }
    }
    position += ((prevV + v) / 2) * (kt - prevT)
    ;[prevT, prevV] = [kt, v]
  }
  return { position: position + prevV * (t - prevT), speed: prevV }
}

export function gradeAt(hill: Course['hill'], distance: number) {
  if (!hill || distance <= hill.from) return 0
  return hill.grade * Math.min(1, (distance - hill.from) / (hill.to - hill.from))
}

const base: PowertrainInputs = { gear: 1, clutch: 1, throttle: 0, brake: 0, grade: 0, front: 0, rear: 0, abs: false, cbs: false, grip: GRIP.dry }
const atSpeed = (speedKmh: number, gear: number): Partial<PowertrainState> => ({ speed: speedKmh / 3.6, engine: drivelineSpeed(speedKmh / 3.6, gear), locked: true })

/** Failures every riding exercise shares: a stall (with its cause) or a locked wheel. */
function commonFailure(c: ExerciseContext, { allowStopStall = false } = {}): Verdict {
  const { front, rear } = c.state.brakes
  if (front.locked) return { result: 'fail', text: 'The front wheel locked. A sliding front tyre can’t steer or keep the motorcycle upright — in real riding this usually ends in a fall. Squeeze the front brake progressively instead of grabbing it.' }
  if (rear.locked) return { result: 'fail', text: 'The rear wheel locked and skidded. Most of the weight had moved to the front, so the rear tyre could only take a light pedal.' }
  if (c.stalled && !(allowStopStall && Math.abs(c.state.speed) < 1)) {
    if (c.state.stallCause === 'wheel') return { result: 'fail', text: 'Stalled: the locked rear wheel stopped the engine.' }
    return { result: 'fail', text: 'Stalled. Pull the clutch in before the engine drops below idle — when pulling away, and again as you come to a stop.' }
  }
  if (c.overRevved) return { result: 'fail', text: 'Over-revved: a downshift at too high a speed forced the engine past its limit.' }
  return null
}

/** Notes the instant the motorcycle comes to rest and how hard it was still decelerating (the "jolt"). */
function trackStop(c: ExerciseContext) {
  const moving = Math.abs(c.state.speed) > 0.05
  if (moving) c.memo.moving = 1
  else if (c.memo.moving && c.memo.stoppedAt === undefined) {
    c.memo.stoppedAt = c.t
    c.memo.jolt = Math.max(0, -(c.memo.lastFelt ?? 0))
  }
  if (moving && c.memo.stoppedAt !== undefined) delete c.memo.stoppedAt
  c.memo.lastFelt = c.felt
  c.memo.top = Math.max(c.memo.top ?? 0, kmhOf(c.state))
  return c.memo.stoppedAt !== undefined
}

const STOP_LINE = 60
const TRAFFIC: LeadProfile = { start: 12, keys: [[0, 0], [2, 0], [8, 30], [15, 30], [18.5, 0]] }
const HILL = { from: 70, to: 100, grade: 0.05 }
const ZONE = { at: 120, kmh: 30 }

export const exercises: RideExercise[] = [
  {
    id: 'stop-line',
    title: 'Pull away and stop at the line',
    goal: `The full sequence: pull away from a standstill, ride up to at least 20 km/h, then brake and stop with the front wheel within 3 m before the line, ${STOP_LINE} m ahead.`,
    tips: [
      'You are in first with the clutch pulled in. Add a little throttle and ease the clutch out through the friction zone.',
      'Change up to second once you are moving. Look at the distance to the line on the road view.',
      'Close the throttle, apply both brakes progressively, and pull the clutch in before you stop.',
    ],
    setup: { inputs: base },
    course: { stopLine: STOP_LINE },
    evaluate: (c) => {
      const stopped = trackStop(c)
      const fail = commonFailure(c)
      if (fail) return fail
      const over = c.state.distance - STOP_LINE
      if (over > 0.2) return { result: 'fail', text: `Over the line by ${over.toFixed(1)} m. Start braking earlier — braking distance grows with the square of speed.` }
      if (stopped && c.t - c.memo.stoppedAt >= 0.5 && over >= -3) {
        if ((c.memo.top ?? 0) < 20) return { result: 'fail', text: `You stopped at the line, but never went faster than ${Math.round(c.memo.top ?? 0)} km/h. Build up to at least 20 km/h first.` }
        return { result: 'pass', text: `Stopped ${Math.abs(over).toFixed(1)} m before the line after reaching ${Math.round(c.memo.top)} km/h — pulling away, riding and stopping as one controlled sequence.` }
      }
      if (c.t > 60) return { result: 'fail', text: 'A minute has passed. Pull away, ride to the line and stop.' }
      return null
    },
  },
  {
    id: 'smooth-accel',
    title: 'Accelerate smoothly',
    goal: `From a standstill, reach 40 km/h within 20 seconds without the acceleration you feel ever passing ${SMOOTH_ACCEL_LIMIT} m/s².`,
    tips: ['Ease the clutch out over a couple of seconds — that is where jolts come from.', 'Roll the throttle on progressively, and change up as the RPM climbs.'],
    setup: { inputs: base },
    evaluate: (c) => {
      const fail = commonFailure(c)
      if (fail) return fail
      if (c.maxAccel > SMOOTH_ACCEL_LIMIT) return { result: 'fail', text: `A jolt of ${c.maxAccel.toFixed(1)} m/s². The clutch bit too suddenly with the engine spinning faster than the wheel side — release it more slowly through the friction zone.` }
      if (kmhOf(c.state) >= 40) return { result: 'pass', text: `40 km/h in ${c.t.toFixed(1)} s with a peak of only ${c.maxAccel.toFixed(1)} m/s².` }
      if (c.t > 20) return { result: 'fail', text: `20 seconds and only ${Math.round(kmhOf(c.state))} km/h. Smooth doesn’t mean timid — open the throttle progressively and keep changing up.` }
      return null
    },
  },
  {
    id: 'steady',
    title: 'Hold a steady speed',
    goal: `You are riding at 40 km/h in third. Keep between 37 and 43 km/h for ${STEADY_SECONDS} seconds in a row — the road starts to climb ${HILL.from} m ahead.`,
    tips: ['On the flat, about a third of the throttle holds 40 km/h.', 'As the road climbs, gravity pulls you back: open the throttle further to keep your speed.'],
    setup: { inputs: { ...base, gear: 3, clutch: 0, throttle: 0.29 }, state: atSpeed(40, 3) },
    course: { hill: HILL, band: [37, 43] },
    evaluate: (c) => {
      const fail = commonFailure(c)
      if (fail) return fail
      const v = kmhOf(c.state)
      c.memo.inBand = v >= 37 && v <= 43 ? (c.memo.inBand ?? 0) + c.dt : 0
      if (c.memo.inBand >= STEADY_SECONDS && c.state.distance > HILL.to) return { result: 'pass', text: `${STEADY_SECONDS} seconds within 3 km/h of 40, including the climb. The throttle had to rise as the gradient added to the resistance.` }
      if (c.t > 45) return { result: 'fail', text: 'Not steady for long enough. Watch the speed and correct small changes early, before they become big ones.' }
      return null
    },
  },
  {
    id: 'slow',
    title: 'Slow race',
    goal: `Ride ${SLOW_DISTANCE} m taking at least ${SLOW_MIN_TIME} seconds — without stopping, stalling or going above ${SLOW_MAX_KMH} km/h.`,
    tips: [
      'Pull away with a little throttle, then close it once you are rolling: in first gear with the clutch fully out, the idle alone carries you at walking pace.',
      'Slower still: drag the rear brake lightly against the engine, or slip the clutch. Too much brake with the clutch out stalls the engine.',
      'Keep your eyes up and your speed constant; at low speed, stopping means putting a foot down.',
    ],
    setup: { inputs: base },
    course: { finish: SLOW_DISTANCE },
    evaluate: (c) => {
      const fail = commonFailure(c)
      if (fail) return fail
      const v = kmhOf(c.state)
      if (c.memo.start === undefined && c.state.distance > 0.3) c.memo.start = c.t
      if (v > SLOW_MAX_KMH) return { result: 'fail', text: `${v.toFixed(1)} km/h — too fast. Close the throttle: idle in first is already walking pace.` }
      if (c.memo.start !== undefined && v < 1 && c.state.distance < SLOW_DISTANCE) return { result: 'fail', text: 'You came to a stop — in real riding, that means putting a foot down. Keep a little drive from the engine against the brake.' }
      if (c.state.distance >= SLOW_DISTANCE) {
        const time = c.t - c.memo.start
        if (time < SLOW_MIN_TIME) return { result: 'fail', text: `Finished in ${time.toFixed(1)} s — needed at least ${SLOW_MIN_TIME}. Drag the rear brake lightly to ride slower than idle speed.` }
        return { result: 'pass', text: `${SLOW_DISTANCE} m in ${time.toFixed(1)} s without a stop: the engine pulled steadily against a light rear brake.` }
      }
      if (c.t > 60) return { result: 'fail', text: 'A minute has passed. Release the clutch and let the idle carry you.' }
      return null
    },
  },
  {
    id: 'traffic',
    title: 'Follow traffic',
    goal: 'Follow the car ahead as it pulls away, cruises and stops. Never get closer than a 1-second gap while moving, and stop 1.5–8 m behind it.',
    tips: ['The two-second rule: let at least two seconds pass between the car passing a mark and you reaching it.', 'Match its speed with the throttle; when its brake lights come on, close the throttle and brake early and gently.'],
    setup: { inputs: base },
    course: { lead: TRAFFIC },
    evaluate: (c) => {
      const stopped = trackStop(c)
      const fail = commonFailure(c)
      if (fail) return fail
      const lead = leadAt(TRAFFIC, c.t)
      const gap = lead.position - c.state.distance
      if (gap < 0.3) return { result: 'fail', text: 'You hit the car. Leave a gap that grows with speed — at least two seconds.' }
      const v = c.state.speed
      if (v * 3.6 > 10 && gap / v < 1) return { result: 'fail', text: `Too close: ${(gap / v).toFixed(1)} s behind at ${Math.round(v * 3.6)} km/h. If it braked hard now, you could not stop in time.` }
      if (gap > 60) return { result: 'fail', text: 'You fell far behind. In traffic, keep up with the flow so the gap stays predictable.' }
      if (stopped && lead.speed === 0 && c.t - c.memo.stoppedAt >= 0.5) {
        if (gap <= 8 && (c.memo.top ?? 0) > 15) return { result: 'pass', text: `Stopped ${gap.toFixed(1)} m behind the car without ever closing below a one-second gap.` }
      }
      if (c.t > 50) return { result: 'fail', text: 'The car stopped long ago. Ride up and stop 1.5–8 m behind it.' }
      return null
    },
  },
  {
    id: 'roll-off',
    title: 'Roll off for the 30 zone',
    goal: `Riding at 60 km/h in fourth, slow to 30 km/h or less by the 30 sign ${ZONE.at} m ahead — without touching the brakes.`,
    tips: ['Close the throttle early: engine braking and drag then slow you.', 'Change down a gear for stronger engine braking — but keep the RPM out of the red.'],
    setup: { inputs: { ...base, gear: 4, clutch: 0, throttle: 0.5 }, state: atSpeed(60, 4) },
    course: { zone: ZONE },
    evaluate: (c) => {
      const fail = commonFailure(c)
      if (fail) return fail
      if (c.brakeUsed) return { result: 'fail', text: 'You used the brakes — this one is throttle and engine braking only.' }
      if (c.state.distance >= ZONE.at) {
        const v = kmhOf(c.state)
        if (v <= ZONE.kmh + 1) return { result: 'pass', text: `Into the zone at ${Math.round(v)} km/h using only the engine and drag — anticipation instead of braking.` }
        return { result: 'fail', text: `${Math.round(v)} km/h at the sign. In fourth, engine braking alone needs about 115 m to lose 30 km/h — roll off sooner or change down.` }
      }
      return null
    },
  },
  {
    id: 'shortest-stop',
    title: 'Shortest stop',
    goal: `From 50 km/h, stop within ${STOP_DISTANCE_LIMIT} m of first touching a brake — without locking either wheel. No ABS.`,
    tips: [
      'The front brake does most of the work, because braking transfers load onto the front tyre.',
      'Squeeze it on progressively over about half a second — grabbing it locks the front before the weight arrives.',
      'Add a little rear brake — about 10–20 % of the pedal. It adds stopping power, but the unloaded rear tyre locks easily.',
    ],
    setup: { inputs: { ...base, gear: 3, clutch: 0, throttle: 0 }, state: atSpeed(50, 3) },
    evaluate: (c) => {
      const stopped = trackStop(c)
      const fail = commonFailure(c, { allowStopStall: true })
      if (fail) return fail
      const { front = 0, rear = 0 } = c.inputs
      if (c.memo.brakeFrom === undefined && (front > 0 || rear > 0)) c.memo.brakeFrom = c.state.distance
      if (!stopped || c.memo.brakeFrom === undefined) return c.t > 20 ? { result: 'fail', text: 'Brake to a stop.' } : null
      const d = c.state.distance - c.memo.brakeFrom
      const stall = c.stalled ? ' The engine stalled as you stopped — pull the clutch in as well.' : ''
      if (d <= STOP_DISTANCE_LIMIT) return { result: 'pass', text: `Stopped in ${d.toFixed(1)} m without locking a wheel.${stall}` }
      return { result: 'fail', text: `${d.toFixed(1)} m — more than ${STOP_DISTANCE_LIMIT}. Use more front brake (built up progressively) together with some rear.${stall}` }
    },
  },
  {
    id: 'smooth-stop',
    title: 'Smooth stop',
    goal: `From 40 km/h, stop using both brakes, without locking a wheel or stalling, and ease off at the end so the final jolt stays under ${JOLT_LIMIT} m/s².`,
    tips: ['Close the throttle, then squeeze both brakes gently.', 'Pull the clutch in below about 15 km/h.', 'In the last metre, ease the front brake off so the fork doesn’t spring back as you stop.'],
    setup: { inputs: { ...base, gear: 3, clutch: 0, throttle: 0.2 }, state: atSpeed(40, 3) },
    evaluate: (c) => {
      const stopped = trackStop(c)
      const fail = commonFailure(c)
      if (fail) return fail
      const { front = 0, rear = 0 } = c.inputs
      if (front > 0.02) c.memo.front = 1
      if (rear > 0.02) c.memo.rear = 1
      if (!stopped) return c.t > 30 ? { result: 'fail', text: 'Brake to a stop.' } : null
      if (!c.memo.front || !c.memo.rear) return { result: 'fail', text: `You only used the ${c.memo.front ? 'front' : 'rear'} brake. Use both: the front for stopping power, the rear to settle the motorcycle.` }
      if (c.memo.jolt > JOLT_LIMIT) return { result: 'fail', text: `Final jolt ${c.memo.jolt.toFixed(1)} m/s²: still braking hard at the moment you stopped, so the motorcycle pitched back. Ease the brakes off just before stopping.` }
      return { result: 'pass', text: `A smooth stop: both brakes, no lock, and a final jolt of only ${c.memo.jolt.toFixed(1)} m/s².` }
    },
  },
]

export const topics: Topic[] = [
  { title: 'Starting from stationary', text: 'First gear, a little throttle, and the clutch eased out through the friction zone until the plates grip. Look ahead, not down.', exercise: 'stop-line' },
  { title: 'Smooth acceleration', text: 'Jolts come from the clutch biting suddenly or the throttle snapping open. Release the clutch progressively, roll the throttle on and change up before the RPM gets high.', exercise: 'smooth-accel' },
  { title: 'Maintaining speed', text: 'At a steady speed, the drive force just balances air drag, rolling resistance and any slope. A climb needs more throttle for the same speed; a descent, less.', exercise: 'steady' },
  { title: 'Low-speed riding', text: 'In first gear with the clutch out, the idle carries the motorcycle at walking pace. For even slower, slip the clutch or drag the rear brake lightly against the engine — never the front.', exercise: 'slow' },
  { title: 'Traffic riding', text: 'Keep at least two seconds behind the vehicle ahead, more in the wet. Match its speed with the throttle and brake early and gently when it slows.', exercise: 'traffic' },
  { title: 'Releasing the throttle', text: 'Closing the throttle is the first, gentlest way to slow down. Roll it off early and smoothly when you see a reason to slow.', exercise: 'roll-off' },
  { title: 'Engine braking', text: 'With the throttle closed and the clutch out, the wheel has to turn the engine against its friction and intake vacuum. Lower gears turn it faster — stronger engine braking.', exercise: 'roll-off' },
  { title: 'Front brake', text: 'Braking transfers load onto the front tyre, so the harder you brake, the more of the stopping the front can do — about two-thirds in moderate braking, well over 80 % in an emergency stop on a dry road. Squeeze it progressively: grabbed, it locks before the load arrives.', exercise: 'shortest-stop' },
  { title: 'Rear brake', text: 'The rear tyre loses load as you brake, so it locks easily under hard braking. It is most useful at low speed and for stability, and settles the motorcycle in a stop.', exercise: 'slow' },
  { title: 'Progressive braking', text: 'Apply the brakes in stages: a light squeeze first lets the weight transfer onto the front, then increase the pressure. That way the tyre’s grip has risen before you ask for it.', exercise: 'shortest-stop' },
  { title: 'Combined braking', text: 'Using both brakes stops shortest. Many small motorcycles have CBS, which makes the rear pedal apply part of the front brake too; ABS releases a brake just before its wheel locks.', exercise: 'smooth-stop' },
  { title: 'Smooth stopping', text: 'Pull the clutch in before the engine drops below idle, and ease the front brake off in the last metre so the motorcycle doesn’t pitch back as it stops.', exercise: 'smooth-stop' },
]

/** Plain-language account of what the motorcycle is doing and why. */
export function explainRide(s: PowertrainState, input: PowertrainInputs): { title: string; text: string; tone: Tone } {
  const { front, rear } = s.brakes
  const v = kmhOf(s)
  const share = frontShare(s.loadAccel)
  const pct = (x: number) => `${Math.round(x * 100)} %`
  const decelG = -s.acceleration / G
  const clutch = clampingForce(input.clutch)
  if (!s.running) {
    if (s.stallCause === 'wheel') return { title: 'Stalled — the locked rear wheel stopped the engine', text: 'The clutch was out, so a rear wheel that stopped turning stopped the gearbox and the engine with it. Pull the clutch in whenever you brake hard. Restart in neutral or with the clutch in.', tone: 'danger' }
    return { title: 'Stalled', text: 'The engine was dragged below the speed it can run at. As you slow to a stop, pull the clutch in so the engine is no longer tied to the wheel. Restart in neutral or with the clutch in.', tone: 'danger' }
  }
  if (front.locked) return { title: 'Front wheel locked!', text: `The front brake asked for more than the tyre could grip (${pct(share)} of the weight on it). A sliding front tyre can’t steer or balance the motorcycle — in real riding this is how falls happen. Release the lever, then squeeze again progressively.`, tone: 'danger' }
  if (rear.locked) return { title: 'Rear wheel skidding', text: `Braking has transferred load to the front, leaving only ${pct(1 - share)} on the rear tyre, so it could not take that much pedal. Ease off the rear brake until the wheel turns again.${input.gear > 0 && clutch > 0 ? ' Pull the clutch in, or the locked wheel will stop the engine.' : ''}`, tone: 'caution' }
  const braking = (front.force > 1 || rear.force > 1) && v > 0.5
  if (braking && (front.abs || rear.abs)) return { title: 'ABS working', text: `ABS is holding the ${front.abs && rear.abs ? 'brakes' : front.abs ? 'front brake' : 'rear brake'} just below the point where the wheel would lock: ${decelG.toFixed(2)} g with steering intact.`, tone: 'ok' }
  if (braking) {
    const total = front.force + rear.force
    const which = front.force > 1 && rear.force > 1 ? 'both brakes' : front.force > 1 ? 'the front brake' : 'the rear brake'
    const cbs = input.cbs && (input.rear ?? 0) > 0 ? ' The CBS links part of the front brake to the pedal.' : ''
    const margin = Math.min(front.grip > 0 ? 1 - front.force / front.grip : 1, rear.grip > 0 && rear.force > 1 ? 1 - rear.force / rear.grip : 1)
    return {
      title: `Braking at ${decelG.toFixed(2)} g with ${which}`,
      text: `The motorcycle pitches forward: ${pct(share)} of the weight is now on the front tyre, which is doing ${pct(front.force / total)} of the braking.${cbs}${margin < 0.12 ? ' Close to the grip limit — any more and a wheel will lock.' : ''}`,
      tone: margin < 0.12 ? 'caution' : 'info',
    }
  }
  if (v < 0.5) {
    if (input.gear === 0) return { title: 'Stopped in neutral', text: 'The engine idles with nothing to drive. Select first, with the clutch in, to move off.', tone: 'ok' }
    if (clutch === 0) return { title: 'Stopped in gear, clutch pulled in', text: 'The clutch separates the idling engine from the gearbox. Add a little throttle and ease the clutch out to pull away.', tone: 'ok' }
    return { title: 'Pulling away', text: 'The clutch plates are starting to grip. Keep easing the lever out through the friction zone.', tone: 'info' }
  }
  if (input.gear > 0 && !s.locked && clutch > 0) return { title: 'Clutch slipping', text: `The clutch is in the friction zone: the engine (${Math.round(radToRpm(s.engine))} RPM) and the wheel side turn at different speeds, and the plates pass torque as they slip. This is how you pull away and ride at walking pace.`, tone: 'info' }
  if (input.gear === 0 || clutch === 0) return { title: 'Coasting', text: `No drive and no engine braking — only air drag and rolling resistance slow you (${Math.max(0, decelG).toFixed(2)} g).`, tone: 'info' }
  if (input.throttle < 0.02 && s.acceleration < -0.05) return { title: 'Engine braking', text: `The throttle is closed, so the rear wheel has to turn the engine against its friction and intake vacuum: ${(-s.acceleration).toFixed(1)} m/s² of deceleration. A lower gear would turn the engine faster and slow you harder.`, tone: 'info' }
  if (s.acceleration > 0.15) return { title: `Accelerating at ${s.acceleration.toFixed(1)} m/s²`, text: `The drive force exceeds the resistance. Acceleration transfers load to the rear: ${pct(1 - share)} is on the rear tyre now.`, tone: 'info' }
  if (s.acceleration < -0.15) return { title: 'Slowing', text: `The throttle isn’t holding this speed${input.grade > 0.005 ? ' on the climb — gravity is pulling you back' : ''}. Open it a little to maintain speed.`, tone: 'info' }
  return { title: `Holding ${Math.round(v)} km/h`, text: `The drive force from the engine just balances air drag, rolling resistance${input.grade > 0.005 ? ` and the ${Math.round(input.grade * 100)} % climb` : ''}, so speed stays constant.`, tone: 'ok' }
}


/** A one-line live readout for the running exercise. */
export function exerciseProgress(ex: RideExercise, p: { t: number; maxAccel: number; memo: Record<string, number> }, s: PowertrainState): string | null {
  const v = kmhOf(s)
  const course = ex.course
  switch (ex.id) {
    case 'stop-line':
      return `To the line: ${(STOP_LINE - s.distance).toFixed(1)} m · top speed ${Math.round(p.memo.top ?? 0)} km/h`
    case 'smooth-accel':
      return `${Math.round(v)} of 40 km/h · ${p.t.toFixed(1)} of 20 s · peak ${p.maxAccel.toFixed(1)} of ${SMOOTH_ACCEL_LIMIT} m/s²`
    case 'steady':
      return `Steady for ${(p.memo.inBand ?? 0).toFixed(1)} of ${STEADY_SECONDS} s · climb ${s.distance < HILL.from ? `in ${Math.round(HILL.from - s.distance)} m` : 'under way'}`
    case 'slow':
      return `${Math.min(SLOW_DISTANCE, s.distance).toFixed(1)} of ${SLOW_DISTANCE} m · ${p.memo.start !== undefined ? (p.t - p.memo.start).toFixed(1) : '0.0'} s (at least ${SLOW_MIN_TIME})`
    case 'traffic': {
      if (!course?.lead) return null
      const gap = leadAt(course.lead, p.t).position - s.distance
      return `Gap to the car: ${gap.toFixed(1)} m${s.speed > 1 ? ` · ${(gap / s.speed).toFixed(1)} s` : ''}`
    }
    case 'roll-off':
      return `To the sign: ${Math.max(0, ZONE.at - s.distance).toFixed(0)} m · ${Math.round(v)} km/h`
    case 'shortest-stop':
      return p.memo.brakeFrom !== undefined ? `Braking distance so far: ${(s.distance - p.memo.brakeFrom).toFixed(1)} m` : 'Brake when you are ready.'
    case 'smooth-stop':
      return `Front brake ${p.memo.front ? 'used' : 'not yet'} · rear brake ${p.memo.rear ? 'used' : 'not yet'}`
  }
  return null
}

/** What this simulator simplifies, shown in its "Model limits" panel. */
export const assumptions: readonly Assumption[] = [
  ...powertrainAssumptions,
  { id: 'brakes', text: 'At full lever the front brake can ask for 1 g and the rear pedal 0.6 g; ABS holds each brake at 92 % of the tyre’s peak grip; with CBS the pedal also applies 35 % of the front brake.', effect: 'Real brake strength, ABS strategy and CBS split vary between motorcycles.' },
  { id: 'straight', text: 'Riding is in a straight line only — no leaning or steering — and a locked front wheel is shown as a skid, not a fall.', effect: 'On a real motorcycle a locked front wheel usually ends in a fall within a second.' },
]
