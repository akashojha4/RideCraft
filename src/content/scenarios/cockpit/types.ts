import type { CockpitMode } from '@/components/cockpit/ModeSwitcher'
import type { PowertrainInputs, PowertrainState } from '@/lib/mechanics/powertrain'
import type { GuidedStep } from '@/lib/simulation/model'
import type { PowertrainDerived, PowertrainPart } from '@/lib/simulation/models/powertrain'
import type { Surface, WorldSpec, WorldState } from '@/lib/simulation/cockpitWorld'
import type { MistakeId } from '@/lib/simulation/ridingMistakes'

/*
 * A guided cockpit scenario or practice drill, in the brief's eight parts (situation,
 * objective, rider actions, mechanical response, road response, why, common mistakes,
 * safety), plus how the motorcycle is found, the view it is best seen in, and the steps that
 * check each action on the shared simulation.
 */

type Base = GuidedStep<PowertrainInputs, PowertrainState, PowertrainDerived, PowertrainPart>

/** A guided step that may also look at the world (the car ahead, the signal, the speed breaker). */
export type CockpitStep = Omit<Base, 'done'> & { done: (s: PowertrainState, i: PowertrainInputs, d: PowertrainDerived, w: WorldState) => boolean }

/** Scenario-specific mistakes, spotted from one step to the next with the world in view. */
export type WorldWatch = (prev: PowertrainState, s: PowertrainState, i: PowertrainInputs, d: PowertrainDerived, w: WorldState) => MistakeId | null

/** What the rider does with the controls at one moment (only what changes needs giving). */
export interface DemoControls extends Partial<Pick<PowertrainInputs, 'clutch' | 'throttle' | 'front' | 'rear' | 'gear'>> {
  /** Handlebar: −1 full lock left, 0 straight, 1 full lock right. */
  steer?: number
  /** Press the starter button. */
  start?: boolean
}

/**
 * One step of a scenario's demonstration: how a careful rider does that guided step. The same
 * plan drives "Watch it done", draws the lesson timeline and is checked by the tests.
 */
export interface DemoStep {
  /** The guided step this demonstrates (its id). */
  step: string
  /** How long the step takes at normal speed, s. */
  seconds: number
  /** What to watch for while it plays. */
  watch: string
  /** What the rider does `t` seconds into the step, seeing the motorcycle and the road (the car, the light, where they face). */
  act: (t: number, s: PowertrainState, w: WorldState) => DemoControls
}

export interface CockpitSetup {
  gear: number
  running: boolean
  /** Rolling at this speed with the clutch out, km/h (0 = standing). */
  kmh?: number
  throttle?: number
  /** Brake held on at the start (e.g. waiting on a hill), 0–1. */
  rear?: number
  /** Road gradient, rise / run (0.12 = 12 % uphill, negative downhill). */
  grade?: number
  surface?: Surface
  /** Wait for the rider: the clock starts at the first touch of a control (traffic that is already close). */
  paused?: boolean
}

export interface CockpitScenario {
  id: string
  title: string
  /** One line for lists and lesson links. */
  summary: string
  setup: CockpitSetup
  view: CockpitMode
  situation: string
  objective: string
  actions: string[]
  mechanical: string
  road: string
  why: string
  mistakes: { id: MistakeId; title: string; text: string }[]
  safety: string[]
  steps: CockpitStep[]
  /** Cars, signals or speed breakers on the road. */
  world?: WorldSpec
  watch?: WorldWatch
  /** A careful rider's way through, one entry per guided step (same order). */
  demo?: DemoStep[]
  /** A message for the status line that depends on what is happening (e.g. waiting for the light). */
  hint?: (s: PowertrainState, i: PowertrainInputs, w: WorldState) => string | null
}
