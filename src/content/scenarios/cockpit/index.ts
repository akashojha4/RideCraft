import { brakesDrill, clutchDrill, gearsDrill } from './drills'
import { hazardScenarios } from './hazards'
import { roadConditionScenarios } from './roadConditions'
import { trafficScenarios } from './traffic'
import { uTurn } from './uTurn'
import { startAndMoveOff } from './startAndMoveOff'
import { stopWithoutStalling } from './stopWithoutStalling'
import type { CockpitScenario } from './types'

/** Every guided cockpit scenario and drill, in the order a learner would take them. */
export const cockpitScenarios: readonly CockpitScenario[] = [startAndMoveOff, stopWithoutStalling, clutchDrill, gearsDrill, brakesDrill, ...roadConditionScenarios, ...trafficScenarios, ...hazardScenarios, uTurn]

export const getCockpitScenario = (id: string | null | undefined) => cockpitScenarios.find((s) => s.id === id)

export { withWorld } from './run'

/** The scenarios in the groups the cockpit lists them under. */
export const cockpitScenarioGroups: readonly { title: string; ids: readonly string[] }[] = [
  { title: 'Basics', ids: ['start-and-move-off', 'stop-without-stalling', 'clutch-drill', 'gears-drill', 'brakes-drill'] },
  { title: 'Road conditions', ids: ['uphill-start', 'downhill', 'wet-road', 'gravel', 'emergency-braking', 'pothole'] },
  { title: 'Traffic and hazards', ids: ['traffic-signal', 'moving-in-traffic', 'slow-traffic', 'speed-breaker', 'sudden-obstacle', 'overtaking', 'highway'] },
  { title: 'Manoeuvres', ids: ['u-turn'] },
]
