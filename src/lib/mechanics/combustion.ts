/*
 * Single-zone model of one cylinder of a 125 cc four-stroke at full throttle, from bottom
 * dead centre on the compression stroke (−180°) to bottom dead centre after the power
 * stroke (+180°), with top dead centre at 0°.
 *
 * Geometry: bore 57 mm, stroke 49 mm (125 cc), connecting rod 98 mm, compression ratio
 * as given (9.5 : 1 by default).
 * Gas: starts at 0.95 bar and 330 K; ratio of specific heats 1.32.
 * Heat release: the charge burns over 45° of crank rotation following a Wiebe curve
 * (fraction burnt = 1 − exp(−5·(θ/45°)³) after the spark), releasing the fuel's energy
 * (stoichiometric mixture, 44 MJ/kg) less heat lost to the walls (taken as 40 %).
 * Each step: dp = ((γ − 1)·dQ − γ·p·dV) / V (first law, ideal gas, no blow-by).
 * Work per cycle = ∮ p dV over the two strokes; pumping on the other two is ignored.
 */

export const BORE = 0.057
export const STROKE = 0.049
const ROD = 0.098
const GAMMA = 1.32
const P0 = 0.95e5
const T0 = 330
const R_AIR = 287
const AFR = 14.7
const LHV = 44e6
const WALL_LOSS = 0.4
export const BURN_DURATION = 45
const AREA = (Math.PI * BORE * BORE) / 4
export const SWEPT = AREA * STROKE

/** Cylinder volume at crank angle θ (deg, 0 = TDC), m³. */
export function volume(thetaDeg: number, cr: number) {
  const clearance = SWEPT / (cr - 1)
  const t = (thetaDeg * Math.PI) / 180
  const a = STROKE / 2
  const x = a + ROD - (a * Math.cos(t) + Math.sqrt(ROD * ROD - (a * Math.sin(t)) ** 2))
  return clearance + AREA * x
}

export interface CycleResult {
  /** [crank angle deg, pressure bar] */
  pressure: [number, number][]
  /** Pressure with no combustion (motoring), bar. */
  motoring: [number, number][]
  work: number
  heat: number
  efficiency: number
  peakBar: number
  peakAngle: number
  /** Unburnt mixture temperature at the end of combustion (K) — a proxy for knock risk. */
  endGasTemp: number
}

/** Run one cycle with the spark `advance` degrees before TDC. */
export function runCycle(advance: number, cr = 9.5, step = 0.5): CycleResult {
  const v0 = volume(-180, cr)
  const airMass = (P0 * v0) / (R_AIR * T0)
  const heat = (airMass / AFR) * LHV * (1 - WALL_LOSS)
  const spark = -advance
  const burnt = (th: number) => (th <= spark ? 0 : 1 - Math.exp(-5 * Math.pow(Math.min(1, (th - spark) / BURN_DURATION), 3)))
  let p = P0
  let pm = P0
  let work = 0
  let peak = { p: 0, th: 0 }
  let endGas = T0
  const pressure: [number, number][] = []
  const motoring: [number, number][] = []
  for (let th = -180; th <= 180 + 1e-9; th += step) {
    pressure.push([th, p / 1e5])
    motoring.push([th, pm / 1e5])
    if (p > peak.p) peak = { p, th }
    const V = volume(th, cr)
    const V2 = volume(th + step, cr)
    const dV = V2 - V
    const dQ = heat * (burnt(th + step) - burnt(th))
    work += (p * dV)
    p += ((GAMMA - 1) * dQ - GAMMA * p * dV) / V
    pm += (-GAMMA * pm * dV) / V
    // Unburnt gas is compressed by the piston and by the burning charge (adiabatic from the start).
    if (burnt(th) < 0.98) endGas = T0 * Math.pow(p / P0, (GAMMA - 1) / GAMMA)
  }
  return { pressure, motoring, work, heat, efficiency: work / heat, peakBar: peak.p / 1e5, peakAngle: peak.th, endGasTemp: endGas }
}

/** Ideal (air-standard Otto) efficiency for a compression ratio. */
export const ottoEfficiency = (cr: number, gamma = 1.4) => 1 - Math.pow(cr, 1 - gamma)
/** Pressure (bar) and temperature (K) at the end of compression, from 1 bar and 330 K (polytropic n = 1.3). */
export const compressionEnd = (cr: number) => ({ bar: Math.pow(cr, 1.3), kelvin: T0 * Math.pow(cr, 0.3) })
