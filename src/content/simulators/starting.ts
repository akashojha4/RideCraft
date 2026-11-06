import type { ControlId } from '@/components/mechanics/controls'
import { clampingForce } from '@/lib/mechanics/clutch'
import { FINAL_RATIO, PRIMARY_RATIO, TYRE_CIRCUMFERENCE, gearRatio } from '@/lib/mechanics/gearbox'
import { buildTimeline, type StepModel } from '@/lib/simulation/timeline'
import type { Assumption } from '@/lib/simulation/model'

/*
 * Starting a geared, fuel-injected single-cylinder motorcycle, from key off to riding
 * away in first gear.
 *
 * Channels hold real-world values (RPM, km/h, volts, amps). Rotations shown in the
 * internal view are the real speeds divided by VISUAL_SLOWDOWN, so every part turns in
 * the right proportion to every other. The engine fires when the cranking crankshaft
 * first passes top dead centre on the compression stroke (cycle angle 360°).
 */

export const VISUAL_SLOWDOWN = 28
const IDLE_RPM = 1400
const CRANKING_RPM = 280
/** Crank cycle angle at rest: part-way through compression. */
const REST_ANGLE = 250
const FIRE_ANGLE = 362
const visual = (rpm: number) => (rpm * 6) / VISUAL_SLOWDOWN

export type Channel = 'ignition' | 'kill' | 'clutch' | 'gear' | 'throttle' | 'starter' | 'rpm' | 'speed' | 'voltage' | 'current'
export type Rotation = 'crank' | 'starterMotor' | 'basket' | 'mainshaft' | 'countershaft' | 'wheel'
export type ActionId = 'ignition' | 'kill' | 'clutch-in' | 'starter' | 'release-starter' | 'first-gear' | 'bite' | 'release-clutch'

export const actionLabels: Record<ActionId, string> = {
  ignition: 'Turn the key to ON',
  kill: 'Kill switch to RUN',
  'clutch-in': 'Pull in the clutch',
  starter: 'Press the starter',
  'release-starter': 'Release the starter',
  'first-gear': 'Press the gear lever down',
  bite: 'Ease the clutch out, a little throttle',
  'release-clutch': 'Release the clutch fully',
}

export interface StartingStep {
  title: string
  action: ActionId
  /** Cockpit control used in this step. */
  control: ControlId
  riderAction: string
  mechanical: string
  why: string
  mistakes: string[]
  safety: string
  model: StepModel<Channel>
}

// Cranking: starter engages at 0.3 s and reaches cranking speed at 0.6 s (9° of rotation
// during the ramp), then turns at cranking speed until the crank reaches FIRE_ANGLE.
const RAMP_END = 0.6
const FIRE_TIME = RAMP_END + (FIRE_ANGLE - REST_ANGLE - (visual(CRANKING_RPM) * 0.3) / 2) / visual(CRANKING_RPM)

export const startingSteps: StartingStep[] = [
  {
    title: 'Turn the ignition on',
    action: 'ignition',
    control: 'ignition',
    riderAction: 'Turn the key to ON. Don’t press anything else yet.',
    mechanical:
      'Battery power reaches the instruments, the engine control unit and the fuel pump. The pump runs for a couple of seconds to pressurise the fuel line, and the warning lights come on as a self-check.',
    why: 'Nothing electrical works until the ignition is on — including the starter circuit.',
    mistakes: [
      'Pressing the starter the instant the key turns, before the fuel pump has primed.',
      'Leaving the ignition on without starting, which slowly drains the battery.',
    ],
    safety: 'Check the green N light: the gearbox should be in neutral.',
    model: { duration: 3, tracks: { ignition: [[0.3, 1]], voltage: [[0, 12.6], [0.6, 12.4]], current: [[0.3, 0], [0.5, 4]] } },
  },
  {
    title: 'Set the kill switch to RUN',
    action: 'kill',
    control: 'right-switches',
    riderAction: 'Flick the red kill switch on the right handlebar to RUN.',
    mechanical: 'The kill switch completes the ignition circuit. At OFF it disables the spark — and on most motorcycles the starter too.',
    why: 'With the kill switch at OFF the engine can’t start. It is one of the most common reasons a motorcycle “won’t start”.',
    mistakes: ['Not noticing it is at OFF and flattening the battery by pressing the starter again and again.'],
    safety: 'Know where it is: flicking it to OFF is the fastest way to stop the engine in an emergency.',
    model: { duration: 2, tracks: { kill: [[0.4, 1]] } },
  },
  {
    title: 'Pull in the clutch',
    action: 'clutch-in',
    control: 'clutch-lever',
    riderAction: 'Pull the clutch lever all the way to the grip and hold it.',
    mechanical: 'The release mechanism lifts the pressure plate. The clutch plates separate, so the gearbox is disconnected from the engine.',
    why: 'If the gearbox is in gear by mistake, the motorcycle can’t lurch forward when the engine starts. Many motorcycles won’t crank in gear unless the clutch is pulled in.',
    mistakes: ['Trusting the neutral light alone — a false neutral or faulty switch can fool you.'],
    safety: 'On a slope, hold the motorcycle on the front brake with your right hand.',
    model: { duration: 2.5, tracks: { clutch: [[0.2, 0], [1, 1]] } },
  },
  {
    title: 'Press the starter',
    action: 'starter',
    control: 'right-switches',
    riderAction: 'With the throttle closed, press and hold the starter button.',
    mechanical:
      'The starter relay closes and around 100 A flows from the battery to the starter motor; the battery voltage dips to about 10.5 V. Through reduction gears and a one-way starter clutch, the motor turns the crankshaft at about 280 RPM. The piston finishes its compression stroke, the spark plug fires — and the engine catches and runs on its own.',
    why: 'An engine can’t start itself: it needs to be turned until a power stroke happens. Fuel injection meters the right mixture, so on most fuel-injected motorcycles you don’t touch the throttle.',
    mistakes: [
      'Holding the starter for more than about five seconds at a time — it overheats. Pause between attempts.',
      'Opening the throttle while starting a fuel-injected engine, which can make it harder to start.',
    ],
    safety: 'Keep the clutch pulled in until the engine is running smoothly.',
    model: {
      duration: FIRE_TIME + 1.3,
      tracks: {
        starter: [[0.25, 1]],
        rpm: [[0, 0], [0.3, 0], [RAMP_END, CRANKING_RPM], [FIRE_TIME, CRANKING_RPM], [FIRE_TIME + 0.5, 1700], [FIRE_TIME + 1.1, 1600]],
        voltage: [[0, 12.4], [0.3, 12.4], [0.45, 10.4], [FIRE_TIME, 10.4], [FIRE_TIME + 0.4, 11.8]],
        current: [[0, 4], [0.3, 4], [0.45, 110], [FIRE_TIME, 110], [FIRE_TIME + 0.4, 30]],
      },
    },
  },
  {
    title: 'Release the starter and let it idle',
    action: 'release-starter',
    control: 'right-switches',
    riderAction: 'Let go of the starter button as soon as the engine runs. Let it idle for a moment.',
    mechanical:
      'The engine runs on its own power strokes; the one-way starter clutch lets the crankshaft overrun the starter, which stops. Oil pressure builds, so the oil light goes out, and the generator begins charging the battery at about 14 V.',
    why: 'Holding the button once the engine is running wears the starter. A short idle lets oil reach every moving part.',
    mistakes: ['Revving a cold engine hard immediately after starting.'],
    safety: 'Check that the oil and charging warning lights have gone out.',
    model: {
      duration: 4,
      tracks: {
        starter: [[0.2, 0]],
        rpm: [[0, 1600], [1.5, IDLE_RPM]],
        voltage: [[0, 11.8], [0.3, 12.6], [2.5, 14.1]],
        current: [[0, 30], [0.2, 0]],
      },
    },
  },
  {
    title: 'Select first gear',
    action: 'first-gear',
    control: 'gear-lever',
    riderAction: 'Keeping the clutch pulled in, press the gear lever firmly down with your left toe.',
    mechanical:
      'The shift drum turns and a fork slides first gear’s dogs into engagement. With the clutch disengaged the engine stays disconnected, so the motorcycle doesn’t move — you may hear a soft clunk as first gear locks the gearbox shafts together.',
    why: 'First gear gives the biggest torque multiplication — about 30 engine turns for every turn of the rear wheel — for pulling away from a standstill.',
    mistakes: ['Selecting first with the clutch out: the motorcycle lurches and stalls.'],
    safety: 'Cover the front brake. Check your mirrors and look over your shoulder before moving off.',
    model: { duration: 3, tracks: { gear: [[0.5, 1]] } },
  },
  {
    title: 'Find the biting point',
    action: 'bite',
    control: 'clutch-lever',
    riderAction: 'Open the throttle slightly, then slowly let the clutch lever out until you feel it bite.',
    mechanical:
      'The pressure plate starts to clamp the clutch plates. They slip, but now pass some torque: the gearbox, chain and rear wheel start to turn. Under the new load the engine slows a little, so the bit of throttle keeps it from stalling.',
    why: 'Feeding the drive in gradually is what makes pulling away smooth instead of jerky — and prevents stalling.',
    mistakes: ['Letting the clutch out too quickly, which stalls the engine.', 'Too much throttle with a slipping clutch — the engine races and the plates wear.'],
    safety: 'Look ahead to where you want to go, not down at the controls.',
    model: {
      duration: 5,
      tracks: {
        throttle: [[0, 0], [0.8, 0.12]],
        // Biting point: 30 % of lever travel leaves about 10 % of the clamp load (clutch.ts), so the plates slip.
        clutch: [[0, 1], [0.4, 1], [2.5, 0.3]],
        rpm: [[0, IDLE_RPM], [0.8, 2100], [2.5, 1900], [5, 1950]],
        speed: [[0, 0], [2.2, 0], [5, 4]],
      },
    },
  },
  {
    title: 'Release the clutch and ride away',
    action: 'release-clutch',
    control: 'clutch-lever',
    riderAction: 'Keep easing the clutch out until it is fully released, adding a little throttle as you go.',
    mechanical:
      'With the clutch fully engaged, the engine and rear wheel are locked together through first gear — about 267 engine RPM for every km/h. Each power stroke now pushes the motorcycle forward.',
    why: 'Once the motorcycle is rolling there’s nothing left to slip, so the clutch can be fully released. At around 15–20 km/h you would change up to second.',
    mistakes: ['Riding with the clutch half-in after moving off — it overheats and wears the plates.'],
    safety: 'Both feet up on the pegs once you are moving and balanced.',
    model: {
      duration: 5,
      tracks: {
        clutch: [[0, 0.3], [1.2, 0.14], [1.6, 0]],
        throttle: [[0, 0.12], [1.5, 0.2]],
        speed: [[0, 4], [1.2, 7.5], [5, 12]],
        rpm: [[0, 1950], [1.2, 2005], [5, 3208]],
      },
    },
  },
]

export const startingTimeline = buildTimeline<Channel, Rotation>(
  startingSteps.map((s) => s.model),
  {
    initial: { ignition: 0, kill: 0, clutch: 0, gear: 0, throttle: 0, starter: 0, rpm: 0, speed: 0, voltage: 12.6, current: 0 },
    discrete: ['ignition', 'kill', 'gear', 'starter'],
    initialAngles: { crank: REST_ANGLE },
    rotations: (v) => {
      const wheelRpm = (v.speed / 3.6 / TYRE_CIRCUMFERENCE) * 60
      const countershaft = v.gear > 0 ? wheelRpm * FINAL_RATIO : 0
      const basket = v.rpm / PRIMARY_RATIO
      return {
        crank: visual(v.rpm),
        starterMotor: v.starter ? visual(v.rpm < 500 ? v.rpm * 12 : 4000) : 0,
        basket: visual(basket),
        mainshaft: visual(v.gear > 0 ? countershaft * gearRatio(v.gear) : basket * clampingForce(v.clutch)),
        countershaft: visual(countershaft),
        wheel: visual(wheelRpm),
      }
    },
  },
)

export type StartingValues = ReturnType<typeof startingTimeline.valuesAt>

/** Derived status shown on the instruments and in the internal view. */
export function derive(v: StartingValues) {
  const running = v.rpm > 500
  return {
    running,
    cranking: v.starter > 0 && v.rpm > 0 && v.rpm < 500,
    neutralLight: v.ignition > 0 && v.gear === 0,
    oilLight: v.ignition > 0 && !running,
    chargeLight: v.ignition > 0 && !running,
    engineLight: v.ignition > 0 && !running,
    charging: running && v.voltage > 12.8,
    clamp: clampingForce(v.clutch),
  }
}

/**
 * What happens if the rider does `action` now, when the next step expects something else.
 * Mirrors the real motorcycle: e.g. the starter does nothing with the kill switch at OFF.
 */
export function diagnose(action: ActionId, v: StartingValues): string {
  const d = derive(v)
  switch (action) {
    case 'ignition':
      return v.ignition ? 'The ignition is already on.' : 'Turn the key first.'
    case 'kill':
      return v.kill ? 'The kill switch is already at RUN.' : 'Turn the ignition on first — the kill switch only matters once there is power.'
    case 'clutch-in':
      return v.clutch > 0.9 ? 'The clutch is already pulled in.' : 'Not yet.'
    case 'starter':
      if (!v.ignition) return 'Nothing happens: the ignition is off, so the starter circuit has no power.'
      if (!v.kill) return 'The starter won’t turn: the kill switch is at OFF.'
      if (d.running) return 'The engine is already running — pressing the starter now would grind the starter gears.'
      return 'Pull in the clutch first. Many motorcycles won’t crank in gear without it, and it stops the motorcycle lurching if a gear is engaged.'
    case 'release-starter':
      return v.starter ? 'Wait until the engine has started.' : 'The starter isn’t being pressed.'
    case 'first-gear':
      if (!d.running) return 'Start the engine first — selecting a gear now would mean starting in gear.'
      return v.gear ? 'You are already in first gear.' : 'Not yet.'
    case 'bite':
      if (!d.running) return 'The engine isn’t running yet.'
      if (!v.gear) return 'In neutral, letting the clutch out won’t move the motorcycle — select first gear first.'
      return 'Not yet.'
    case 'release-clutch':
      if (!d.running) return 'The engine isn’t running yet.'
      if (!v.gear) return 'In neutral, letting the clutch out won’t move the motorcycle — select first gear first.'
      if (v.speed < 1) return 'Dropping the clutch all at once from a standstill in first would stall the engine or make the motorcycle lurch. Ease it out to the biting point first.'
      return 'Not yet.'
  }
}

/** What this simulator simplifies, shown in its "Model limits" panel. */
export const assumptions: readonly Assumption[] = [
  { id: 'scripted', text: 'A scripted sequence: the correct procedure is played step by step, and each action you take is checked against it.' },
  { id: 'vehicle', text: 'A typical fuel-injected 125 cc single with an electric starter. Battery voltage, starter current and cranking speed (about 280 RPM) are representative values.' },
  { id: 'variants', text: 'Starting procedures and safety interlocks differ between motorcycles — some have a choke, a kick-starter or a side-stand switch.', effect: 'Always follow your own motorcycle’s owner’s manual.' },
]
