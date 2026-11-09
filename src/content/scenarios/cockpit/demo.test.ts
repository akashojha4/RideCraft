import { describe, expect, it } from 'vitest'
import { scenarios } from '@/content/scenarios'
import { cockpitScenarios } from './index'
import { cockpitForDecision } from '../cockpitLink'
import { demoPlan, runScenario } from './run'

/*
 * Every scenario with a demonstration: the demo is a careful rider. Played on the shared
 * model it must complete every guided step in order, with no mistake — the same run the
 * lesson's timeline is drawn from and "Watch it done" plays.
 */
describe('scenario demonstrations', () => {
  const withDemo = cockpitScenarios.filter((sc) => sc.demo)

  it('every cockpit scenario has one', () => {
    expect(withDemo.map((sc) => sc.id).sort()).toEqual(cockpitScenarios.map((sc) => sc.id).sort())
  })

  it('every decision-scenario link points at a real cockpit demonstration', () => {
    const ids = new Set(cockpitScenarios.map((s) => s.id))
    for (const [from, to] of Object.entries(cockpitForDecision)) {
      expect(ids.has(to), `${from} → ${to}`).toBe(true)
    }
  })

  it('every decision scenario has a cockpit ride', () => {
    for (const s of scenarios) {
      expect(cockpitForDecision[s.id], s.id).toBeDefined()
    }
  })

  for (const sc of withDemo) {
    it(`${sc.id}: one demo step per guided step, in order`, () => {
      expect(sc.demo!.map((d) => d.step)).toEqual(sc.steps.map((s) => s.id))
      for (const d of sc.demo!) expect(d.watch.length).toBeGreaterThan(20)
    })
    it(`${sc.id}: the demo completes every step with no mistake`, () => {
      const r = runScenario(sc, demoPlan(sc))
      expect(r.stepDone).toEqual(sc.steps.map(() => true))
      expect(r.complete).toBe(true)
      expect(r.mistakes).toEqual([])
    })
  }

  it('starting and moving off: the run shows the clutch passing through the friction zone while the motorcycle moves away', () => {
    const sc = withDemo.find((s) => s.id === 'start-and-move-off')!
    const r = runScenario(sc, demoPlan(sc))
    const bite = r.samples.filter((x) => sc.steps[x.step].id === 'bite')
    expect(bite.some((x) => x.slipping && x.clamp > 0 && x.clamp < 1)).toBe(true)
    const end = r.samples.at(-1)!
    expect(end.gear).toBe(2)
    expect(end.locked).toBe(true)
    expect(end.kmh).toBeGreaterThan(10)
  })

  it('stopping without stalling: the clutch goes in while the engine is still above idle, and the engine keeps running to the stop', () => {
    const sc = withDemo.find((s) => s.id === 'stop-without-stalling')!
    const r = runScenario(sc, demoPlan(sc))
    const firstIn = r.samples.find((x) => x.clutch >= 1)!
    expect(firstIn.engineRpm).toBeGreaterThan(1400)
    expect(firstIn.kmh).toBeGreaterThan(5)
    expect(r.samples.every((x) => x.running)).toBe(true)
    const end = r.samples.at(-1)!
    expect(end.kmh).toBe(0)
    expect(end.gear).toBe(1)
    expect(end.engineRpm).toBeGreaterThan(1000)
  })

  it('at a coarser time step, like a live animation frame, each demo still completes', () => {
    for (const sc of withDemo) {
      const r = runScenario(sc, demoPlan(sc), { sampleEvery: 0.2 })
      expect(r.complete, sc.id).toBe(true)
      expect(r.stepDone, sc.id).toEqual(sc.steps.map(() => true))
      expect(r.mistakes, sc.id).toEqual([])
    }
  })

  it('step snapshots keep the world as it was then (a light that turns amber later is still green in the first snapshot)', () => {
    const sc = cockpitScenarios.find((s) => s.id === 'traffic-signal')!
    const r = runScenario(sc, demoPlan(sc))
    expect(r.stepStarts[0].world.mem).toEqual({})
    expect(r.stepStarts[0].world.signal).toBe('green')
    expect(r.w.mem.amberAt).toBeGreaterThan(0)
  })
})
