import { SWEPT } from './combustion'

/*
 * Simple, physically grounded models of the engine's support systems for a 125 cc
 * single. Each is an approximation that keeps the right relationships — the numbers are
 * representative, not those of a specific engine.
 */

const R_AIR = 287
const T_AIR = 300

// ─── Fuel injection ──────────────────────────────────────────────────────────
/** Manifold pressure, bar: about 0.3 bar at idle (throttle nearly closed), close to 1 bar wide open. */
export const manifoldPressure = (throttle: number) => 0.3 + 0.68 * Math.sqrt(Math.min(1, Math.max(0, throttle)))
/** Volumetric efficiency: how well the cylinder fills; best in the mid-range. */
export const volumetricEfficiency = (rpm: number) => 0.72 + 0.16 * Math.sin((Math.PI * Math.min(rpm, 9500)) / 9500)
/** Air drawn in per cycle, mg. */
export const airPerCycle = (rpm: number, throttle: number) => ((volumetricEfficiency(rpm) * manifoldPressure(throttle) * 1e5 * SWEPT) / (R_AIR * T_AIR)) * 1e6

const INJECTOR_FLOW = 2.4 // mg of fuel per ms open
const DEAD_TIME = 0.6 // ms the injector takes to open

/** Target air–fuel ratio the ECU aims for. */
export function targetAfr(throttle: number, coolant: number) {
  if (coolant < 40) return 11.5 + (3.2 * Math.max(0, coolant)) / 40 // cold-start enrichment
  if (throttle > 0.85) return 13 // full-power enrichment
  return 14.7 // stoichiometric: lets the catalytic converter work, held by the oxygen sensor
}

export function injection(rpm: number, throttle: number, coolant: number) {
  const air = airPerCycle(rpm, throttle)
  const afr = targetAfr(throttle, coolant)
  const fuel = air / afr
  const pulse = fuel / INJECTOR_FLOW + DEAD_TIME
  const cycleMs = 120000 / rpm
  return { air, afr, fuel, pulse, cycleMs, duty: pulse / cycleMs, closedLoop: afr === 14.7 }
}

// ─── Carburettor ─────────────────────────────────────────────────────────────
const VENTURI_D = 0.024
const VENTURI_AREA = (Math.PI * VENTURI_D * VENTURI_D) / 4
const JET_AREA = 1.9e-6
const RHO_FUEL = 740
const CD = 0.7

/** Air density at an altitude (m), kg/m³. */
export const airDensity = (altitude: number) => 1.2 * Math.exp(-altitude / 8500)

/**
 * Carburettor at a throttle-slide opening. Air speeds up through the venturi, its pressure
 * falls (Bernoulli: Δp = ½ρv²) and that suction draws fuel up through the jet. The tapered
 * needle lifts with the slide, opening the jet in step with the airway.
 */
export function carburettor(rpm: number, slide: number, altitude: number, choke: boolean) {
  const rho = airDensity(altitude)
  const q = (SWEPT * rpm) / 120 * volumetricEfficiency(rpm) * (0.15 + 0.85 * Math.pow(slide, 0.6))
  const airway = VENTURI_AREA * (0.12 + 0.88 * slide) * (choke ? 0.75 : 1)
  const v = q / airway
  const dp = 0.5 * rho * v * v
  const jet = JET_AREA * (0.16 + 0.84 * slide)
  const fuelFlow = CD * jet * Math.sqrt(2 * RHO_FUEL * dp)
  const airFlow = rho * q
  return { velocity: v, dp, airFlow, fuelFlow, afr: airFlow / fuelFlow }
}

// ─── Cooling ─────────────────────────────────────────────────────────────────
/**
 * Steady engine temperature. About half the fuel’s energy beyond the power output leaves
 * through the cooling system (the rest goes out of the exhaust) — roughly as much heat as
 * the engine’s power. Air cooling: fins of 0.25 m² shed heat at h = 25 + 8·v^0.8 W/m²K.
 * Liquid cooling: a thermostat keeps the coolant at about 85 °C until the radiator (with a
 * fan that switches on at 100 °C) can’t keep up.
 */
export function engineTemp(powerKw: number, speedKmh: number, liquid: boolean, ambient = 30) {
  const v = speedKmh / 3.6
  const heat = Math.max(0.5, powerKw) * 1000
  if (!liquid) {
    const hA = (25 + 8 * Math.pow(v, 0.8)) * 0.25
    return { temp: ambient + heat / hA, thermostat: 1, fan: false }
  }
  const radiator = (v: number, fan: boolean) => (40 + 14 * Math.pow(Math.max(v, fan ? 6 : 0), 0.8)) * 1.0
  let temp = ambient + heat / radiator(v, false)
  let fan = false
  if (temp > 100) {
    fan = true
    temp = ambient + heat / radiator(v, true)
  }
  const thermostat = Math.min(1, Math.max(0.1, (temp - 82) / 10))
  return { temp: Math.max(85, temp), thermostat: temp < 85 ? 0.1 : thermostat, fan }
}

// ─── Lubrication ─────────────────────────────────────────────────────────────
/** Kinematic viscosity of a 10W-30 oil, cSt (fitted to 70 cSt at 40 °C and 10.5 cSt at 100 °C). */
export const viscosity = (tempC: number) => Math.exp(-1.917 + 832.4 / (tempC + 95))
const RELIEF_BAR = 5

/** Oil pressure and relative film thickness for an engine speed and oil temperature. */
export function oilSystem(rpm: number, tempC: number, levelOk = true) {
  const nu = viscosity(tempC)
  const flow = 0.0011 * rpm * (levelOk ? 1 : 0.45) // L/min from the gear pump
  const raw = 0.184 * flow * Math.sqrt(nu)
  const pressure = Math.min(RELIEF_BAR, raw)
  const film = Math.sqrt((nu * rpm) / (viscosity(90) * 4000)) * (levelOk ? 1 : 0.6)
  return { viscosity: nu, flow, pressure, relief: raw > RELIEF_BAR, film }
}
