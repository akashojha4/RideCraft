import { describe, expect, it } from 'vitest'
import { drivelineSpeed, initialPowertrain, stepPowertrain, type PowertrainInputs, type PowertrainState } from '@/lib/mechanics/powertrain'
import { checkGuided, goToGuided, guidedComplete, startGuided } from '@/lib/simulation/guided'
import { derivePowertrain } from '@/lib/simulation/models/powertrain'
import { initialWorld, stepWorld } from '@/lib/simulation/cockpitWorld'
import { detectMistake } from '@/lib/simulation/ridingMistakes'
import { brakesDrill, clutchDrill, gearsDrill } from './drills'
import { cockpitScenarioGroups, cockpitScenarios, withWorld } from './index'
import type { CockpitScenario } from './types'

const DT = 1 / 60
type Action = (t: number, s: PowertrainState) => Partial<PowertrainInputs>

/** Set the scenario up as the cockpit does, then ride the actions, one per step. */
function ride(sc: CockpitScenario, actions: [Action, number][]) {
  const { gear, running, kmh = 0, throttle = 0 } = sc.setup
  const v = kmh / 3.6
  let s = !running ? initialPowertrain({ running: false, engine: 0 }) : v > 0 ? initialPowertrain({ speed: v, engine: drivelineSpeed(v, gear), locked: true }) : initialPowertrain()
  let i: PowertrainInputs = { clutch: 0, throttle, brake: 0, front: 0, rear: 0, gear, grade: 0 }
  let p = startGuided(sc.steps.length)
  let w = initialWorld(sc.world)
  const steps = withWorld(sc.steps, () => w)
  const mistakes: string[] = []
  for (const [fn, seconds] of actions) {
    for (let t = 0; t < seconds; t += DT) {
      i = { ...i, ...fn(t, s) }
      const next = stepPowertrain(s, i, DT)
      const m = detectMistake(s, next, i, derivePowertrain(next, i), DT)
      if (m) mistakes.push(m)
      s = next
      w = stepWorld(sc.world, w, DT, s.distance)
      p = checkGuided(steps, p, s, i, derivePowertrain(s, i))
    }
    expect(p.done[p.index], `${sc.id}: ${sc.steps[p.index].id}`).toBe(true)
    p = goToGuided(p, p.index + 1)
  }
  return { complete: guidedComplete(p), mistakes }
}

/** A clean gear change: clutch in, throttle off, select, clutch out smoothly, throttle back. */
const change = (gear: number, after = 0.3): Action => (t) => (t < 0.3 ? { clutch: 1, throttle: 0 } : t < 0.4 ? { gear } : { clutch: Math.max(0, 0.4 - (t - 0.4) * 0.3), throttle: after })

describe('cockpit practice drills', () => {
  it('each has every part of the brief and its own view', () => {
    for (const sc of cockpitScenarios) {
      for (const k of ['situation', 'objective', 'mechanical', 'road', 'why'] as const) expect(sc[k].length, `${sc.id}.${k}`).toBeGreaterThan(40)
      expect(sc.mistakes.length).toBeGreaterThanOrEqual(3)
      expect(sc.safety.length).toBeGreaterThanOrEqual(2)
      expect(new Set(sc.steps.map((x) => x.id)).size).toBe(sc.steps.length)
    }
    expect(new Set(cockpitScenarios.map((s) => s.id)).size).toBe(cockpitScenarios.length)
    // Every scenario is listed in exactly one group.
    expect(cockpitScenarioGroups.flatMap((g) => g.ids).sort()).toEqual(cockpitScenarios.map((s) => s.id).sort())
  })

  it('clutch drill: can be completed cleanly', () => {
    const r = ride(clutchDrill, [
      [(t) => ({ clutch: Math.min(1, t * 3) }), 0.6],
      [() => ({ gear: 1 }), 0.2],
      [(t) => ({ throttle: 0.25, clutch: Math.max(0.3, 0.42 - t * 0.04) }), 3],
      [(t) => ({ throttle: 0.35, clutch: Math.max(0, 0.3 - t * 0.1) }), 5],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
  })

  it('gears drill: up to second and third, then down to second with engine braking', () => {
    const r = ride(gearsDrill, [
      [change(2), 3],
      [change(3), 3],
      [change(2, 0), 3],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
  })

  it('brakes drill: front progressively, rear alone, then both to a stop — no locked wheel', () => {
    const r = ride(brakesDrill, [
      [(t) => ({ throttle: 0, front: Math.min(0.4, t * 0.6) }), 1.2],
      [() => ({ front: 0, rear: 0.2 }), 0.8],
      [() => ({ clutch: 1, front: 0.4, rear: 0.15 }), 5],
    ])
    expect(r.complete).toBe(true)
    expect(r.mistakes).toEqual([])
  })
})
