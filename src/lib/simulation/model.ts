/*
 * The contract every real-time simulation follows, so that one runtime, one set of
 * controls and one set of teaching panels work for all of them.
 *
 *   physics (lib/mechanics)  →  model (this contract)  →  runtime (useSimulation)
 *                            →  views and controls      →  teaching content
 *
 * A model is pure TypeScript: it can be stepped and tested without React.
 */

export type Tone = 'ok' | 'info' | 'caution' | 'danger'

/** The four stages of cause and effect: rider input → mechanical state → force/power transmission → vehicle response. */
export type Stage = 'input' | 'mechanism' | 'transmission' | 'response'

export const STAGES: readonly Stage[] = ['input', 'mechanism', 'transmission', 'response']

export const stageLabels: Record<Stage, string> = {
  input: 'Your input',
  mechanism: 'Mechanism',
  transmission: 'Power transfer',
  response: 'Motorcycle’s response',
}

/** One link in the chain, with the parts to highlight for it. */
export interface CausalLink<C extends string = string> {
  stage: Stage
  label: string
  value: string
  components?: readonly C[]
}

export interface Explanation<C extends string = string> {
  tone: Tone
  title: string
  text: string
  chain: CausalLink<C>[]
}

/** A simplification the model makes, shown to the learner. */
export interface Assumption {
  id: string
  text: string
  /** How the real machine differs. */
  effect?: string
}

export interface SimModel<I, S, D, C extends string = string> {
  id: string
  initial(overrides?: Partial<S>): S
  /** Advance by `dt` seconds. */
  step(state: S, inputs: I, dt: number): S
  /** Everything the views and text need, computed from state and inputs. */
  derive(state: S, inputs: I): D
  /** Speeds of rotating parts, RPM (negative turns the other way), for animation. */
  rotations?(state: S, inputs: I, derived: D): Partial<Record<C, number>>
  explain(state: S, inputs: I, derived: D): Explanation<C>
  assumptions: readonly Assumption[]
}

/** A guided step: what to do, what to highlight, and how to tell it has been done. */
export interface GuidedStep<I, S, D, C extends string = string> {
  id: string
  title: string
  instruction: string
  highlight?: readonly C[]
  /** Applied when the step starts. */
  setup?: { inputs?: Partial<I>; state?: Partial<S> }
  done(state: S, inputs: I, derived: D): boolean
  /** Shown once the step is complete: why it happened. */
  explanation: string
}

/** Components named by the links of the given stage (or all stages). */
export function chainComponents<C extends string>(chain: readonly CausalLink<C>[], stage?: Stage): C[] {
  const out = new Set<C>()
  for (const link of chain) if (!stage || link.stage === stage) for (const c of link.components ?? []) out.add(c)
  return [...out]
}
