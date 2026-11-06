import { describe, expect, it } from 'vitest'
import { initialPowertrain, stepPowertrain, type PowertrainInputs } from '@/lib/mechanics/powertrain'
import { checkGuided, goToGuided, guidedComplete, startGuided } from '@/lib/simulation/guided'
import { derivePowertrain } from '@/lib/simulation/models/powertrain'
import { initialWorld, stepWorld } from '@/lib/simulation/cockpitWorld'
import { detectMistake } from '@/lib/simulation/ridingMistakes'
import { withWorld } from './index'
import { startAndMoveOff as scenario } from './startAndMoveOff'

describe('Starting and moving off', () => {
  it('covers every part the brief asks for', () => {
    for (const k of ['situation', 'objective', 'mechanical', 'road', 'why'] as const) expect(scenario[k].length).toBeGreaterThan(40)
    expect(scenario.actions.length).toBeGreaterThanOrEqual(scenario.steps.length)
    expect(scenario.mistakes.length).toBeGreaterThanOrEqual(4)
    expect(scenario.safety.some((s) => /instructor/.test(s))).toBe(true)
  })

  it('can be completed in order by a careful rider, with no mistakes along the way', () => {
    let s = initialPowertrain({ running: false, engine: 0 })
    let i: PowertrainInputs = { clutch: 0, throttle: 0, brake: 0, front: 0, rear: 0, gear: scenario.setup.gear, grade: 0 }
    let p = startGuided(scenario.steps.length)
    let w = initialWorld(scenario.world)
    const steps = withWorld(scenario.steps, () => w)
    const mistakes: string[] = []
    const DT = 1 / 60
    const act = (fn: (t: number) => Partial<PowertrainInputs> | 'start', seconds: number) => {
      for (let t = 0; t < seconds; t += DT) {
        const r = fn(t)
        if (r === 'start') s = s.running ? s : initialPowertrain({ speed: s.speed, distance: s.distance })
        else i = { ...i, ...r }
        const next = stepPowertrain(s, i, DT)
        const m = detectMistake(s, next, i, derivePowertrain(next, i), DT)
        if (m) mistakes.push(m)
        s = next
        w = stepWorld(scenario.world, w, DT, s.distance)
        p = checkGuided(steps, p, s, i, derivePowertrain(s, i))
      }
      expect(p.done[p.index], scenario.steps[p.index].id).toBe(true)
      p = goToGuided(p, p.index + 1)
    }
    act(() => ({ gear: 0 }), 0.1) // find neutral
    act(() => 'start', 0.3) // start
    act((t) => ({ clutch: Math.min(1, t * 3) }), 0.6) // clutch in
    act(() => ({ gear: 1 }), 0.2) // first
    act(() => ({ throttle: 0.25 }), 0.3) // a little throttle
    act((t) => ({ clutch: Math.max(0.3, 0.42 - t * 0.04) }), 3) // to the biting point
    act((t) => ({ clutch: Math.max(0, 0.3 - t * 0.1), throttle: 0.35 }), 6) // ride away
    act((t) => (t < 0.3 ? { clutch: 1, throttle: 0 } : t < 0.4 ? { gear: 2 } : { clutch: Math.max(0, 0.4 - (t - 0.4) * 0.3), throttle: 0.3 }), 4) // second
    expect(guidedComplete(p)).toBe(true)
    expect(mistakes).toEqual([])
  })
})
