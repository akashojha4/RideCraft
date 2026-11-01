import { GRIP, LOAD_TAU, LOCK_MIN_SPEED, brakeRequests, frontShare, wheelBrake, type WheelBrake } from './braking'
import { clampingForce } from './clutch'
import { G } from './braking'
import { FINAL_RATIO, PRIMARY_RATIO, TYRE_CIRCUMFERENCE, gearRatio } from './gearbox'

/*
 * Real-time powertrain model for a 125 cc single, rider aboard.
 *
 * Engine:  torque = demand × full-throttle curve(RPM) − friction(RPM) − pumping loss,
 *          which grows as the throttle closes (the engine works against intake vacuum). Demand is the
 *          larger of the rider's throttle and an idle controller, which opens the idle air
 *          valve as RPM falls below 1,400 (as fuel-injected engines do). With the throttle
 *          closed above idle, only friction remains: engine braking.
 *          Below 600 RPM the engine stalls. Rev limiter at 9,500 RPM.
 * Clutch:  torque capacity = 18 N·m (at the crankshaft) × clamping force, from the same
 *          lever model as the anatomy diagram. While slipping it passes the capacity in the
 *          direction of slip; it locks (static friction) when the slip speed is nearly zero
 *          and the torque needed to stay locked is within capacity.
 * Vehicle: 225 kg (motorcycle + rider), 90 % drivetrain efficiency, rolling resistance,
 *          air drag, gradient and brakes. All quantities are worked at the crankshaft
 *          through the overall ratio (primary × gear × final drive).
 * Brakes:  front and rear, each limited by the grip of its tyre under the current load
 *          transfer (see braking.ts). A locked rear wheel no longer turns the gearbox: with
 *          the clutch engaged it stops the engine.
 *
 * Values are representative of a small commuter motorcycle, not a specific model.
 */

export const IDLE_RPM = 1400
export const STALL_RPM = 600
export const LIMITER_RPM = 9500
export const CLUTCH_CAPACITY = 18
const ENGINE_INERTIA = 0.012
export const MASS = 225
export const EFFICIENCY = 0.9
export const WHEEL_RADIUS = TYRE_CIRCUMFERENCE / (2 * Math.PI)
const ROLLING = 0.015
const DRAG_AREA = 0.6
const AIR_DENSITY = 1.2
const SLIP_SMOOTHING = 3
/** Below this slip speed (rad/s, ≈ 40 RPM) the plates grip if the clutch can carry the torque. */
const LOCK_SLIP = 4
const SUBSTEP = 0.002

const rpmToRad = (rpm: number) => (rpm * 2 * Math.PI) / 60
export const radToRpm = (w: number) => (w * 60) / (2 * Math.PI)

/** Full-throttle torque at the crankshaft, N·m. */
const CURVE: [number, number][] = [
  [0, 4],
  [1000, 6.5],
  [3000, 8.5],
  [6500, 10.2],
  [8500, 9],
  [LIMITER_RPM, 7],
]
export function fullThrottleTorque(rpm: number) {
  if (rpm <= CURVE[0][0]) return CURVE[0][1]
  for (let i = 1; i < CURVE.length; i++) {
    if (rpm <= CURVE[i][0]) {
      const [r0, t0] = CURVE[i - 1]
      const [r1, t1] = CURVE[i]
      return t0 + ((t1 - t0) * (rpm - r0)) / (r1 - r0)
    }
  }
  return CURVE[CURVE.length - 1][1]
}

/** Internal friction and pumping losses, N·m. */
export const frictionTorque = (rpm: number) => 0.6 + 0.00025 * rpm

/** Pumping loss against a closed throttle, N·m: zero at full throttle. */
export const pumpingTorque = (rpm: number, demand: number) => 0.0003 * rpm * (1 - demand)

/** Demand needed to idle unloaded (torque = friction + pumping), so the idle controller is centred on it. */
const IDLE_DEMAND =
  (frictionTorque(IDLE_RPM) + 0.0003 * IDLE_RPM) / (fullThrottleTorque(IDLE_RPM) + 0.0003 * IDLE_RPM)

/** Demand (0–1) from the rider's throttle: progressive, more sensitive near closed. */
export const throttleDemand = (throttle: number) => Math.pow(Math.min(Math.max(throttle, 0), 1), 0.6)

export interface PowertrainInputs {
  /** Clutch lever pull, 0 (released) – 1 (at the grip). */
  clutch: number
  throttle: number
  /** Ideal combined brake, always shared between the wheels in proportion to their load (0–1 = 0–0.8 g). */
  brake: number
  /** Front brake lever and rear brake pedal, 0–1, each limited by its tyre's grip. */
  front?: number
  rear?: number
  /** Tyre–road friction coefficient (default: dry asphalt). */
  grip?: number
  abs?: boolean
  /** Combined braking system: the rear pedal also applies part of the front brake. */
  cbs?: boolean
  /** Load added to the 225 kg motorcycle and rider (a pillion, luggage), kg. Brake strength stays the same. */
  extraMass?: number
  /** 0 = neutral. */
  gear: number
  /** Road gradient as rise / run (0.1 = 10 % uphill). */
  grade: number
}

export interface PowertrainState {
  running: boolean
  /** Engine (crankshaft) speed, rad/s. */
  engine: number
  /** Road speed, m/s (negative = rolling backwards). */
  speed: number
  /** Distance travelled, m. */
  distance: number
  locked: boolean
  /** Torque the engine produces, and the torque the clutch is passing, N·m at the crank. */
  engineTorque: number
  clutchTorque: number
  acceleration: number
  stallCause: 'clutch' | 'load' | 'wheel' | null
  /** Acceleration the suspension has pitched to (lags the real one); sets the load on each tyre, m/s². */
  loadAccel: number
  brakes: { front: WheelBrake; rear: WheelBrake }
}

const freeWheel: WheelBrake = { force: 0, grip: 0, locked: false, abs: false }

export const initialPowertrain = (overrides: Partial<PowertrainState> = {}): PowertrainState => ({
  running: true,
  engine: rpmToRad(IDLE_RPM),
  speed: 0,
  distance: 0,
  locked: false,
  engineTorque: 0,
  clutchTorque: 0,
  acceleration: 0,
  stallCause: null,
  loadAccel: 0,
  brakes: { front: freeWheel, rear: freeWheel },
  ...overrides,
})

export const overallRatioFor = (gear: number) => (gear > 0 ? PRIMARY_RATIO * gearRatio(gear) * FINAL_RATIO : 0)

/** Crankshaft speed that corresponds to the current road speed in this gear ("wheel side"), rad/s. */
export const drivelineSpeed = (speed: number, gear: number) => (gear > 0 ? (speed / WHEEL_RADIUS) * overallRatioFor(gear) : 0)

export const clutchCapacity = (pull: number) => CLUTCH_CAPACITY * clampingForce(pull)

function engineTorqueAt(state: PowertrainState, throttle: number) {
  const rpm = radToRpm(state.engine)
  if (!state.running) return -2 * frictionTorque(rpm) * Math.sign(state.engine)
  if (rpm >= LIMITER_RPM) return -frictionTorque(rpm) - pumpingTorque(rpm, 0)
  const idle = Math.min(0.45, Math.max(0, IDLE_DEMAND + ((IDLE_RPM - rpm) / 1000) * 0.4))
  const demand = Math.max(throttleDemand(throttle), idle)
  return demand * fullThrottleTorque(rpm) - frictionTorque(rpm) - pumpingTorque(rpm, demand)
}

/** Road resistance excluding brakes, N (positive opposes forward motion). */
function resistance(speed: number, grade: number, mass: number) {
  const gradeForce = mass * G * Math.sin(Math.atan(grade))
  const rolling = Math.abs(speed) > 0.01 ? ROLLING * mass * G * Math.sign(speed) : 0
  const air = 0.5 * AIR_DENSITY * DRAG_AREA * speed * Math.abs(speed)
  return gradeForce + rolling + air
}

function substep(s: PowertrainState, input: PowertrainInputs, dt: number): PowertrainState {
  const ratio = overallRatioFor(input.gear)
  const tEngine = engineTorqueAt(s, input.throttle)

  const mass = MASS + (input.extraMass ?? 0)
  const weight = mass * G
  const share = frontShare(s.loadAccel)
  const grip = input.grip ?? GRIP.dry
  const abs = input.abs ?? false
  const rolling = Math.abs(s.speed) > LOCK_MIN_SPEED
  const request = brakeRequests({ front: input.front ?? 0, rear: input.rear ?? 0, ideal: input.brake, cbs: input.cbs ?? false }, share, MASS * G)
  const front = wheelBrake(request.front, share * weight, grip, s.brakes.front.locked, abs, rolling)
  const rear = wheelBrake(request.rear, (1 - share) * weight, grip, s.brakes.rear.locked, abs, rolling)
  const brakeForce = front.force + rear.force
  // A locked rear wheel doesn't turn, so it no longer drives (or is driven by) the gearbox.
  const capacity = input.gear > 0 && !rear.locked ? clutchCapacity(input.clutch) : 0
  const roadForce = resistance(s.speed, input.grade, mass)
  const stationary = Math.abs(s.speed) < 0.02

  let engine = s.engine
  let speed = s.speed
  let locked = s.locked && capacity > 0
  let tClutch = 0

  /** Vehicle acceleration from a drive force at the wheel, handling brakes and standing still. */
  const vehicleAccel = (driveForce: number) => {
    const net = driveForce - roadForce
    if (stationary && Math.abs(net) <= brakeForce + ROLLING * mass * G) return { a: 0, hold: true }
    const braking = brakeForce * Math.sign(stationary ? net : s.speed)
    return { a: (net - braking) / mass, hold: false }
  }

  /** Engine and vehicle turning together: combined acceleration and the clutch torque that requires. */
  const lockedSolution = () => {
    const vehicleInertia = (mass * WHEEL_RADIUS ** 2) / ratio ** 2
    const loadAtCrank = ((roadForce + brakeForce * Math.sign(s.speed || 1)) * WHEEL_RADIUS) / (ratio * EFFICIENCY)
    const alpha = (tEngine - loadAtCrank) / (ENGINE_INERTIA + vehicleInertia)
    return { alpha, required: tEngine - ENGINE_INERTIA * alpha }
  }

  if (locked) {
    const { alpha, required } = lockedSolution()
    if (Math.abs(required) <= capacity && !(stationary && alpha <= 0 && brakeForce > 0)) {
      engine += alpha * dt
      speed = (engine / ratio) * WHEEL_RADIUS
      tClutch = required
    } else {
      locked = false
    }
  }

  if (!locked) {
    const slip = engine - drivelineSpeed(speed, input.gear)
    tClutch = capacity * Math.tanh(slip / SLIP_SMOOTHING)
    engine += ((tEngine - tClutch) / ENGINE_INERTIA) * dt
    const { a, hold } = vehicleAccel(input.gear > 0 ? (tClutch * ratio * EFFICIENCY) / WHEEL_RADIUS : 0)
    speed = hold ? 0 : speed + a * dt
    // Stop cleanly instead of oscillating through zero under braking.
    if (!hold && Math.sign(speed) !== Math.sign(s.speed) && s.speed !== 0 && brakeForce > 0) speed = 0
    const newSlip = engine - drivelineSpeed(speed, input.gear)
    if (input.gear > 0 && capacity > 0 && (Math.sign(newSlip) !== Math.sign(slip) || Math.abs(newSlip) < LOCK_SLIP) && Math.abs(lockedSolution().required) <= capacity) {
      locked = true
      engine = drivelineSpeed(speed, input.gear)
    }
  }

  let running = s.running
  let stallCause = s.stallCause
  if (running && rear.locked && input.gear > 0 && clutchCapacity(input.clutch) > Math.max(tEngine, 0)) {
    // In gear with the clutch out, the locked wheel holds the gearbox still: the engine stops with it.
    running = false
    stallCause = 'wheel'
    engine = 0
  }
  if (running && radToRpm(engine) < STALL_RPM) {
    running = false
    // Slipping clutch: engaged too abruptly (or too little throttle). Locked: the wheel dragged it down.
    stallCause = locked ? 'load' : 'clutch'
  }
  if (!running) {
    // A dead engine never turns backwards; at a standstill in gear its compression holds the motorcycle.
    engine = Math.max(0, engine)
    if (engine < rpmToRad(60)) engine = 0
    // A dead engine can't be dragged round by a slowly rolling wheel: it locks it to rest.
    if (input.gear > 0 && capacity > 0 && Math.abs(speed) < 0.3) {
      speed = 0
      engine = 0
    }
  }

  return {
    running,
    engine,
    speed,
    distance: s.distance + speed * dt,
    locked,
    engineTorque: tEngine,
    clutchTorque: input.gear > 0 ? tClutch : 0,
    acceleration: (speed - s.speed) / dt,
    stallCause,
    loadAccel: s.loadAccel + ((speed - s.speed) / dt - s.loadAccel) * Math.min(1, dt / LOAD_TAU),
    brakes: { front, rear },
  }
}

/** Advance the model by `dt` seconds (internally in 2 ms substeps). */
export function stepPowertrain(state: PowertrainState, input: PowertrainInputs, dt: number): PowertrainState {
  let s = state
  const n = Math.max(1, Math.ceil(dt / SUBSTEP))
  let accel = 0
  for (let i = 0; i < n; i++) {
    s = substep(s, input, dt / n)
    accel += s.acceleration / n
  }
  return { ...s, acceleration: accel }
}

/** Restart after a stall (the starting procedure itself is Phase 5). Allowed in neutral or with the clutch in. */
export function canRestart(input: PowertrainInputs) {
  return input.gear === 0 || clampingForce(input.clutch) === 0
}

export const kmh = (ms: number) => ms * 3.6
export const rpmPerKmh = (gear: number) => radToRpm(drivelineSpeed(1 / 3.6, gear))
