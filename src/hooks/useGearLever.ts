import { useState } from 'react'
import { clampingForce } from '@/lib/mechanics/clutch'
import { shiftLever, type LeverAction } from '@/lib/mechanics/gearbox'
import { autoShift } from '@/lib/simulation/autoShift'
import type { PowertrainSim } from './usePowertrainSim'

export interface LeverNotice {
  text: string
  warn: boolean
}

/**
 * The gear lever on a powertrain simulation: sequential pattern, optional auto-clutch
 * (the textbook clutch-and-throttle sequence) with an optional rev-matching blip.
 * `onShift` is told about each accepted change.
 */
export function useGearLever(sim: PowertrainSim, { onShift }: { onShift?: (from: number, to: number, autoClutch: boolean) => void } = {}) {
  const [autoClutch, setAutoClutch] = useState(true)
  const [blip, setBlip] = useState(false)
  const [notice, setNotice] = useState<LeverNotice | null>(null)
  const { state: s, inputs, busy } = sim.snapshot

  const lever = (action: LeverAction) => {
    if (busy) return
    const r = shiftLever(inputs.gear, action)
    if (!r.moved) return setNotice({ text: r.note, warn: true })
    if (!autoClutch && s.running && clampingForce(inputs.clutch) > 0) return setNotice({ text: 'Pull the clutch in fully to change gear — or turn on the auto-clutch.', warn: true })
    setNotice({ text: r.note, warn: false })
    onShift?.(inputs.gear, r.gear, autoClutch)
    if (autoClutch) {
      const stationary = Math.abs(s.speed) < 1
      sim.runSequence(autoShift(r.gear, { blip: blip && r.gear > 0 && r.gear < inputs.gear, holdClutch: stationary && r.gear > 0 }))
    } else {
      sim.setInputs({ gear: r.gear })
    }
  }

  return { lever, autoClutch, setAutoClutch, blip, setBlip, notice, setNotice, gear: inputs.gear, busy }
}

export type GearLeverControl = ReturnType<typeof useGearLever>
