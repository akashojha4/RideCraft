import type { PowertrainInputs } from '@/lib/mechanics/powertrain'
import { SURFACE_GRIP, type SignalColour, type Surface, type WorldSpec } from '@/lib/simulation/cockpitWorld'
import type { RoadScene } from './RoadAhead'

/** What the first-person road shows for the simulation's inputs and a scenario's world: gradient, surface, signal, speed breaker, bend, night. */
export function roadSceneFor(inputs: PowertrainInputs, worldSpec: WorldSpec | undefined, signal: SignalColour | null): RoadScene {
  const surface = (Object.keys(SURFACE_GRIP) as Surface[]).find((k) => SURFACE_GRIP[k] === inputs.grip) ?? 'dry'
  return {
    grade: inputs.grade,
    surface,
    signal: worldSpec?.signal && signal ? { at: worldSpec.signal.at, colour: signal } : undefined,
    bump: worldSpec?.bump,
    curvature: worldSpec?.curvature,
    beam: worldSpec?.beam,
    night: worldSpec?.beam != null,
    pillion: (inputs.extraMass ?? 0) > 0,
    paint: worldSpec?.paint,
    island: worldSpec?.island,
  }
}
