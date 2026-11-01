import type { Scenario } from '@/lib/scenarios/types'
import { gravel, nightRiding, pillion, wetRoad } from './conditions'
import { emergencyBraking, suddenObstacle } from './emergency'
import { downhill, pothole, speedBreaker, uphillStart } from './roads'
import { heavyTraffic, highway, overtaking, trafficSignals } from './traffic'

/** The fourteen real-world scenarios, in roadmap order. */
export const scenarios: Scenario[] = [
  trafficSignals,
  heavyTraffic,
  uphillStart,
  downhill,
  speedBreaker,
  pothole,
  wetRoad,
  gravel,
  emergencyBraking,
  suddenObstacle,
  overtaking,
  highway,
  nightRiding,
  pillion,
].sort((a, b) => a.number - b.number)

export const getScenario = (id: string | undefined) => scenarios.find((s) => s.id === id)
