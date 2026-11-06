import { useCallback } from 'react'
import { canRestart, initialPowertrain, type PowertrainInputs, type PowertrainState } from '@/lib/mechanics/powertrain'
import { powertrainModel, type PowertrainDerived, type PowertrainPart } from '@/lib/simulation/models/powertrain'
import { useSimulation, type InputSequence as GenericSequence } from './useSimulation'

/** Rotations in the drawings are shown this many times slower than real. */
export const VISUAL_SLOWDOWN = 28

export type InputSequence = GenericSequence<PowertrainInputs, PowertrainState>

export interface Sample {
  t: number
  engineRpm: number
  wheelRpm: number
  kmh: number
}

const PARTS = ['crank', 'basket', 'mainshaft', 'countershaft', 'wheel', 'frontWheel', 'rearWheel'] as const satisfies readonly PowertrainPart[]

const sample = (s: PowertrainState, _i: PowertrainInputs, d: PowertrainDerived, t: number): Sample => ({ t, engineRpm: d.engineRpm, wheelRpm: d.wheelSideRpm, kmh: s.speed * 3.6 })
const publishWhen = (before: PowertrainState, after: PowertrainState) => before.running !== after.running || before.locked !== after.locked

/** The powertrain model on the generic simulation runtime, plus restarting a stalled engine. */
export function usePowertrainSim(initialInputs: PowertrainInputs) {
  const sim = useSimulation(powertrainModel, initialInputs, { parts: PARTS, visualSlowdown: VISUAL_SLOWDOWN, sample, publishWhen })
  const { state, inputs, replaceState } = sim

  const restart = useCallback(() => {
    if (state.current.running || !canRestart(inputs.current)) return false
    replaceState((s) => initialPowertrain({ speed: s.speed, distance: s.distance }))
    return true
  }, [state, inputs, replaceState])

  return { ...sim, restart }
}

export type PowertrainSim = ReturnType<typeof usePowertrainSim>
