import { brakesDrill, clutchDrill, gearsDrill } from './drills'
import { fullWorldCockpitScenarios } from './fullWorld'
import { hazardScenarios } from './hazards'
import { progressiveCockpitScenarios } from './progressive'
import { roadConditionScenarios } from './roadConditions'
import { trafficScenarios } from './traffic'
import { uTurn } from './uTurn'
import { startAndMoveOff } from './startAndMoveOff'
import { stopWithoutStalling } from './stopWithoutStalling'
import type { CockpitScenario } from './types'

/** Every guided cockpit scenario and drill, in the order a learner would take them. */
export const cockpitScenarios: readonly CockpitScenario[] = [startAndMoveOff, stopWithoutStalling, clutchDrill, gearsDrill, brakesDrill, ...roadConditionScenarios, ...trafficScenarios, ...hazardScenarios, ...progressiveCockpitScenarios, ...fullWorldCockpitScenarios, uTurn]

export const getCockpitScenario = (id: string | null | undefined) => cockpitScenarios.find((s) => s.id === id)

export { withWorld } from './run'

/** The scenarios in the groups the cockpit lists them under. */
export const cockpitScenarioGroups: readonly { title: string; ids: readonly string[] }[] = [
  { title: 'First controls', ids: ['start-and-move-off', 'stop-without-stalling', 'clutch-drill', 'gears-drill', 'brakes-drill'] },
  { title: 'Yard manoeuvres', ids: ['u-turn'] },
  { title: 'Stops you will need', ids: ['uphill-start', 'downhill', 'wet-road', 'gravel', 'emergency-braking', 'emergency-abs', 'speed-breaker', 'pothole', 'pothole-late', 'pothole-leaned-wet', 'wet-painted-line', 'wet-first-rain', 'emergency-in-bend', 'obstacle-no-escape', 'pillion', 'night-riding', 'night-rain-horn', 'hill-car-behind'] },
  { title: 'Other traffic', ids: ['traffic-signal', 'moving-in-traffic', 'slow-traffic', 'heavy-traffic', 'sudden-obstacle', 'overtaking', 'highway', 'pedestrian-ahead', 'pedestrian-wet-behind', 'following-with-room', 'following-one-second-wet', 'overtake-gap', 'overtake-pressured', 'signal-amber-behind', 'signal-green-cross', 'tailgater'] },
]
