import { expect } from 'vitest'
import type { PowertrainState } from '@/lib/mechanics/powertrain'
import { runScenario } from './run'
import type { CockpitScenario, DemoControls } from './types'

/*
 * Test helper: a scripted rider for cockpit scenarios, on the shared runner (run.ts) — the
 * same set-up, model, world, guided checks and mistake spotting as the cockpit.
 */

export type Action = (t: number, s: PowertrainState) => DemoControls

/** Ride the actions, one per guided step; with `strict`, each step must be done by the end of its action. */
export function ride(sc: CockpitScenario, actions: [Action, number][], { strict = true, trace = false } = {}) {
  const r = runScenario(
    sc,
    actions.map(([act, seconds]) => ({ act, seconds })),
    { trace },
  )
  if (strict) r.stepDone.forEach((done, k) => expect(done, `${sc.id}: ${sc.steps[k]?.id}`).toBe(true))
  return { complete: r.complete, mistakes: r.mistakes.map((m) => m.id), s: r.s, w: r.w }
}
