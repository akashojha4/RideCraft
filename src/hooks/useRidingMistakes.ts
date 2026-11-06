import { useCallback, useEffect, useRef, useState } from 'react'
import type { WorldWatch } from '@/content/scenarios/cockpit/types'
import type { WorldState } from '@/lib/simulation/cockpitWorld'
import { detectMistake, type MistakeId } from '@/lib/simulation/ridingMistakes'
import type { PowertrainSim } from './usePowertrainSim'

/** The same mistake is reported again only after this many simulated seconds. */
const REPEAT_AFTER = 3

/** Watches every simulation step for learner mistakes (plus a scenario's own, with the world in view); keeps the latest one. */
export function useRidingMistakes(sim: PowertrainSim, scenario?: { watch: () => WorldWatch | undefined; world: () => WorldState }) {
  const { onStep, inputs, model } = sim
  const [mistake, setMistake] = useState<{ id: MistakeId; at: number } | null>(null)
  const prev = useRef<{ s: Parameters<Parameters<PowertrainSim['onStep']>[0]>[0]; t: number } | null>(null)
  const last = useRef<{ id: MistakeId; at: number } | null>(null)

  useEffect(
    () =>
      onStep((s, t) => {
        const p = prev.current
        prev.current = { s, t }
        if (!p) return
        const d = model.derive(s, inputs.current)
        const id = detectMistake(p.s, s, inputs.current, d, t - p.t) ?? scenario?.watch()?.(p.s, s, inputs.current, d, scenario.world()) ?? null
        if (!id) return
        const l = last.current
        if (l && l.id === id && t - l.at < REPEAT_AFTER) return
        last.current = { id, at: t }
        setMistake({ id, at: t })
      }),
    [onStep, inputs, model, scenario],
  )

  const clear = useCallback(() => {
    last.current = null
    setMistake(null)
  }, [])

  return { mistake, clear }
}
