import { useEffect, useImperativeHandle, type Ref } from 'react'
import type { RunResult } from '@/content/scenarios/cockpit/run'
import type { CockpitScenario } from '@/content/scenarios/cockpit/types'
import { useDemoPlayer, type DemoStatus } from '@/hooks/useDemoPlayer'
import type { RideNudge } from '@/lib/simulation/rideNudge'
import type { CockpitSim } from '@/hooks/useCockpitSim'

/** What the page can ask the demonstration to do. */
export interface DemoHandle {
  play: () => void
  pause: () => void
  replay: () => void
}

/**
 * Rides the scenario's demonstration on the page's own cockpit. Mounting it starts the
 * demonstration from the beginning; unmounting hands the controls back.
 */
export function DemoDriver({
  cockpit,
  scenario,
  run,
  handle,
  onChange,
}: {
  cockpit: CockpitSim
  scenario: CockpitScenario
  run: RunResult
  handle: Ref<DemoHandle>
  onChange: (state: { index: number; status: DemoStatus; done: readonly boolean[]; nudge: RideNudge }) => void
}) {
  const player = useDemoPlayer(cockpit, scenario, run, undefined, { autoPlay: true })
  // Start once. The effect is re-run in development after the player's own pause, so it has to
  // play again rather than remember that it already did.
  useEffect(() => {
    player.play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useImperativeHandle(handle, () => ({ play: player.play, pause: player.pause, replay: player.replay }), [player.play, player.pause, player.replay])
  useEffect(() => {
    onChange({ index: player.index, status: player.status, done: player.done, nudge: player.nudge })
  }, [player.index, player.status, player.done, player.nudge, onChange])
  return null
}
