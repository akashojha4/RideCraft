import { GRIP } from '@/lib/mechanics/braking'
import { canRestart, drivelineSpeed, initialPowertrain, stepPowertrain, type PowertrainInputs, type PowertrainState } from '@/lib/mechanics/powertrain'
import { SURFACE_GRIP, initialWorld, stepWorld, type WorldState } from '@/lib/simulation/cockpitWorld'
import { checkGuided, goToGuided, guidedComplete, startGuided } from '@/lib/simulation/guided'
import { derivePowertrain } from '@/lib/simulation/models/powertrain'
import { detectMistake, type MistakeId } from '@/lib/simulation/ridingMistakes'
import type { CockpitScenario, CockpitSetup, CockpitStep, DemoControls } from './types'

/*
 * One way to ride a scenario, shared by everything that needs to: the cockpit's set-up, the
 * scripted riders in the tests, the lesson timeline and the "Watch it done" playback. A plan is
 * a list of timed actions, one per guided step; running it steps the same powertrain model and
 * road world as the cockpit, checks the same guided steps and spots the same mistakes.
 */

/** Simulation inputs with every control at rest. */
export const AT_REST: PowertrainInputs = { gear: 0, clutch: 0, throttle: 0, brake: 0, front: 0, rear: 0, grade: 0, grip: GRIP.dry, abs: false, cbs: false }

/** The simulation's inputs and state for how a scenario finds the motorcycle: engine off, idling, or rolling in gear. */
export function setupState({ gear, running, kmh = 0, throttle = 0, rear = 0, grade = 0, surface = 'dry' }: CockpitSetup): { inputs: PowertrainInputs; state: Partial<PowertrainState> } {
  const v = kmh / 3.6
  return {
    inputs: { ...AT_REST, gear, throttle, rear, grade, grip: SURFACE_GRIP[surface] },
    state: !running ? { running: false, engine: 0 } : v > 0 && gear > 0 ? { speed: v, engine: drivelineSpeed(v, gear), locked: true } : {},
  }
}

/** Steps the guided-mode runner can check: each is handed the current world when it checks. */
export const withWorld = (steps: readonly CockpitStep[], world: () => WorldState) =>
  steps.map((st) => ({ ...st, done: (s: Parameters<CockpitStep['done']>[0], i: Parameters<CockpitStep['done']>[1], d: Parameters<CockpitStep['done']>[2]) => st.done(s, i, d, world()) }))

/** One timed action of a plan: what the rider does, for how long. */
export interface PlanStep {
  seconds: number
  act: (t: number, s: PowertrainState, w: WorldState) => DemoControls
}

/** The rider's controls and the motorcycle's response at one moment of a run. */
export interface RunSample {
  t: number
  /** Index of the guided step being ridden. */
  step: number
  clutch: number
  throttle: number
  front: number
  rear: number
  gear: number
  steer: number
  running: boolean
  engineRpm: number
  kmh: number
  /** Clamp on the clutch plates, 0–1. */
  clamp: number
  slipping: boolean
  /** Clutch fully gripping: engine and rear wheel turn together. */
  locked: boolean
  /** Drive force at the rear tyre, N (negative = engine braking). */
  driveForce: number
  /** Acceleration, m/s². */
  acceleration: number
  frontLocked: boolean
  rearLocked: boolean
}

/** Everything needed to put the simulation back where a step started. */
export interface RunSnapshot {
  t: number
  state: PowertrainState
  inputs: PowertrainInputs
  world: WorldState
  steer: number
}

export interface RunResult {
  complete: boolean
  /** Whether each step's check was met by the end of its action. */
  stepDone: boolean[]
  mistakes: { id: MistakeId; t: number; step: number }[]
  samples: RunSample[]
  /** Where each step started (index = step). */
  stepStarts: RunSnapshot[]
  /** Simulated time each step ended. */
  stepEnds: number[]
  s: PowertrainState
  w: WorldState
}

const DT = 1 / 60

/** Ride a plan through a scenario on the shared model, as the cockpit would. */
export function runScenario(sc: CockpitScenario, plan: readonly PlanStep[], { sampleEvery = 0.1, trace = false } = {}): RunResult {
  const setup = setupState(sc.setup)
  let s = initialPowertrain(setup.state)
  let i: PowertrainInputs = setup.inputs
  let w = initialWorld(sc.world)
  let steer = 0
  let p = startGuided(sc.steps.length)
  const steps = withWorld(sc.steps, () => w)
  const out: RunResult = { complete: false, stepDone: [], mistakes: [], samples: [], stepStarts: [], stepEnds: [], s, w }
  let t = 0
  let nextSample = 0
  const sample = (step: number) => {
    const d = derivePowertrain(s, i)
    out.samples.push({
      t,
      step,
      clutch: i.clutch,
      throttle: i.throttle,
      front: i.front ?? 0,
      rear: i.rear ?? 0,
      gear: i.gear,
      steer,
      running: s.running,
      engineRpm: d.engineRpm,
      kmh: d.kmh,
      clamp: d.clamp,
      slipping: d.slipping,
      locked: s.locked,
      driveForce: d.driveForce,
      acceleration: s.acceleration,
      frontLocked: s.brakes.front.locked,
      rearLocked: s.brakes.rear.locked,
    })
  }
  // How the motorcycle was found, before the rider does anything.
  if (plan.length) {
    sample(0)
    nextSample = sampleEvery
  }
  plan.forEach((ps, index) => {
    // The world's scratch memory is shared from step to step, so a snapshot keeps its own copy of it.
    out.stepStarts.push({ t, state: s, inputs: i, world: { ...w, mem: { ...w.mem } }, steer })
    for (let local = 0; local < ps.seconds - 1e-9; local += DT) {
      const { steer: turn, start, ...change } = ps.act(local, s, w)
      if (turn !== undefined) steer = turn
      i = { ...i, ...change }
      // The starter button, as in the cockpit: only in neutral or with the clutch in.
      if (start && !s.running && canRestart(i)) s = initialPowertrain({ speed: s.speed, distance: s.distance })
      if (t >= nextSample) {
        sample(index)
        nextSample += sampleEvery
      }
      const next = stepPowertrain(s, i, DT)
      const d = derivePowertrain(next, i)
      const nextWorld = stepWorld(sc.world, w, DT, next.distance, { speed: next.speed, steer, gear: i.gear, clutch: i.clutch, stage: index })
      const m = detectMistake(s, next, i, d, DT) ?? sc.watch?.(s, next, i, d, nextWorld) ?? null
      if (m) out.mistakes.push({ id: m, t, step: index })
      s = next
      w = nextWorld
      t += DT
      p = checkGuided(steps, p, s, i, derivePowertrain(s, i))
      if (trace && Math.round(t * 60) % 15 === 0) console.log(`t=${t.toFixed(2)} step=${p.index} v=${(s.speed * 3.6).toFixed(1)} x=${s.distance.toFixed(1)} g=${i.gear} cl=${i.clutch.toFixed(2)} th=${i.throttle.toFixed(2)} f=${(i.front ?? 0).toFixed(2)} r=${(i.rear ?? 0).toFixed(2)} lock=${s.locked} run=${s.running} m=${out.mistakes.at(-1)?.id ?? ''}`)
    }
    out.stepDone.push(!!p.done[p.index])
    out.stepEnds.push(t)
    p = goToGuided(p, p.index + 1)
  })
  sample(plan.length - 1)
  out.complete = guidedComplete(p)
  out.s = s
  out.w = w
  return out
}

/** A scenario's own demonstration as a plan, if it has one. */
export const demoPlan = (sc: CockpitScenario): PlanStep[] => (sc.demo ?? []).map((d) => ({ seconds: d.seconds, act: d.act }))
