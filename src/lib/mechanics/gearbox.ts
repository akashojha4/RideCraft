/**
 * Five-speed constant-mesh sequential gearbox with ratios typical of a small commuter
 * motorcycle, plus the primary and final drive reductions around it.
 */
export const GEARS = [
  { main: 12, counter: 36 },
  { main: 17, counter: 32 },
  { main: 20, counter: 28 },
  { main: 23, counter: 26 },
  { main: 25, counter: 24 },
] as const

/** Crankshaft-to-clutch reduction. */
export const PRIMARY_RATIO = 3.35
/** 45-tooth rear / 15-tooth front sprocket. */
export const FINAL_RATIO = 3
/** Rolling circumference of a typical 17–18 inch rear tyre, metres. */
export const TYRE_CIRCUMFERENCE = 1.88
export const REDLINE_RPM = 9000

export const gearRatio = (gear: number) => GEARS[gear - 1].counter / GEARS[gear - 1].main

/** Engine turns per rear-wheel turn in a gear. */
export const overallRatio = (gear: number) => PRIMARY_RATIO * gearRatio(gear) * FINAL_RATIO

/** Engine RPM at a road speed: wheel RPM × final drive × gear × primary reduction. */
export const rpmAtSpeed = (kmh: number, gear: number) =>
  (kmh / 3.6 / TYRE_CIRCUMFERENCE) * 60 * overallRatio(gear)

export const TOP_GEAR = GEARS.length

/** Rider's movement of the gear lever: a full press, a full lift, or a gentle half-shift. */
export type LeverAction = 'down' | 'up' | 'half'

/**
 * Sequential 1–N–2–3–4–5 selector. A full press or lift moves one gear and goes straight
 * past neutral between first and second; neutral is found with a half-shift from first or
 * second. Returns the new gear (0 = neutral) and a description of what happened.
 */
export function shiftLever(gear: number, action: LeverAction): { gear: number; moved: boolean; note: string } {
  if (action === 'down') {
    if (gear === 1) return { gear, moved: false, note: 'Already in first — there is no lower gear.' }
    if (gear === 0) return { gear: 1, moved: true, note: 'Pressed down from neutral into first gear.' }
    return { gear: gear - 1, moved: true, note: gear === 2 ? 'Pressed down from second, through neutral, into first.' : `Pressed down into gear ${gear - 1}.` }
  }
  if (action === 'up') {
    if (gear === TOP_GEAR) return { gear, moved: false, note: `Already in ${TOP_GEAR === 5 ? 'fifth' : 'top gear'} — the top gear.` }
    if (gear === 0) return { gear: 2, moved: true, note: 'Lifted from neutral into second gear.' }
    return { gear: gear + 1, moved: true, note: gear === 1 ? 'Lifted from first, through neutral, into second.' : `Lifted into gear ${gear + 1}.` }
  }
  if (gear === 1) return { gear: 0, moved: true, note: 'A gentle half-lift from first selected neutral.' }
  if (gear === 2) return { gear: 0, moved: true, note: 'A gentle half-press from second selected neutral.' }
  return { gear, moved: false, note: gear === 0 ? 'Already in neutral.' : 'Neutral sits between first and second — you can only reach it from those gears.' }
}

/**
 * A gear-lever pattern: the gear at each lever position from the bottom of its travel to the
 * top, with 0 for neutral. A full press or lift moves one gear and goes straight past neutral;
 * neutral is found with a half movement from the gear on either side of it.
 */
export type GearPattern = readonly number[]

/** The usual road pattern, 1-N-2-3-4-5: press down for first, lift for every other gear. */
export const STANDARD_PATTERN: GearPattern = [1, 0, 2, 3, 4, 5]
/** The reversed ("race" or "GP") pattern: lift for first, press down for every other gear. */
export const REVERSED_PATTERN: GearPattern = [5, 4, 3, 2, 0, 1]

const gearWord = (g: number) => (g === 0 ? 'neutral' : `gear ${g}`)

/** Move the lever in a pattern. Returns the new gear (0 = neutral) and what happened. */
export function shiftInPattern(pattern: GearPattern, gear: number, action: LeverAction): { gear: number; moved: boolean; note: string } {
  const at = pattern.indexOf(gear)
  const n = pattern.indexOf(0)
  if (action === 'half') {
    if (gear !== 0 && Math.abs(at - n) === 1) return { gear: 0, moved: true, note: `A gentle half-${at < n ? 'lift' : 'press'} from ${gearWord(gear)} selected neutral.` }
    return { gear, moved: false, note: gear === 0 ? 'Already in neutral.' : `Neutral sits next to ${pattern.filter((g, i) => g && Math.abs(i - n) === 1).map(gearWord).join(' and ')} — you can only reach it from there.` }
  }
  const dir = action === 'up' ? 1 : -1
  let to = at + dir
  const skipped = gear !== 0 && pattern[to] === 0
  if (skipped) to += dir
  if (to < 0 || to >= pattern.length) return { gear, moved: false, note: `The lever is already at the ${dir > 0 ? 'top' : 'bottom'} of its travel (${gearWord(gear)}).` }
  const verb = dir > 0 ? 'Lifted' : 'Pressed down'
  return { gear: pattern[to], moved: true, note: `${verb} from ${gearWord(gear)}${skipped ? ', through neutral,' : ''} into ${gearWord(pattern[to])}.` }
}

/** Final-drive sprockets (15 / 45 teeth, the 3 : 1 FINAL_RATIO) on a 520 chain (15.875 mm pitch). */
export const FRONT_SPROCKET_TEETH = 15
export const REAR_SPROCKET_TEETH = 45
export const CHAIN_PITCH = 0.015875
/** Pitch radius of a sprocket, m: p / (2 · sin(π / teeth)). */
export const sprocketRadius = (teeth: number) => CHAIN_PITCH / (2 * Math.sin(Math.PI / teeth))
/**
 * Average chain speed for a front-sprocket speed in RPM, m/s: teeth passing per second × pitch,
 * the same at both sprockets. (Pitch radii aren't exactly proportional to tooth count, so
 * ω × pitch radius would differ slightly between them — the chain's "chordal" ripple.)
 */
export const chainSpeed = (frontRpm: number) => (frontRpm / 60) * FRONT_SPROCKET_TEETH * CHAIN_PITCH
