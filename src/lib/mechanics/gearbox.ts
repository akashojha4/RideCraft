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
