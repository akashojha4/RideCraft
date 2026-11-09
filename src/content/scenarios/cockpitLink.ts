import { getCockpitScenario } from './cockpit'

/**
 * Decision-scenario id → cockpit scenario id, where the same riding can be practised
 * in the rider’s seat after (or beside) the decision animation.
 */
export const cockpitForDecision: Readonly<Record<string, string>> = {
  'traffic-signals': 'traffic-signal',
  'heavy-traffic': 'heavy-traffic',
  'uphill-start': 'uphill-start',
  downhill: 'downhill',
  'speed-breaker': 'speed-breaker',
  pothole: 'pothole',
  'wet-road': 'wet-road',
  gravel: 'gravel',
  'emergency-braking': 'emergency-braking',
  'sudden-obstacle': 'sudden-obstacle',
  overtaking: 'overtaking',
  highway: 'highway',
  'pedestrian-ahead': 'pedestrian-ahead',
  'following-with-room': 'following-with-room',
  'following-one-second-wet': 'following-one-second-wet',
  'pothole-late': 'pothole-late',
  'overtake-gap': 'overtake-gap',
  'emergency-abs': 'emergency-abs',
  'night-riding': 'night-riding',
  pillion: 'pillion',
  'pedestrian-wet-behind': 'pedestrian-wet-behind',
  'pothole-leaned-wet': 'pothole-leaned-wet',
  'overtake-pressured': 'overtake-pressured',
  'hill-car-behind': 'hill-car-behind',
  'wet-painted-line': 'wet-painted-line',
  'wet-first-rain': 'wet-first-rain',
  'emergency-in-bend': 'emergency-in-bend',
  'obstacle-no-escape': 'obstacle-no-escape',
  'signal-amber-behind': 'signal-amber-behind',
  'signal-green-cross': 'signal-green-cross',
  tailgater: 'tailgater',
  'night-rain-horn': 'night-rain-horn',
}

export const cockpitScenarioForDecision = (decisionId: string) => {
  const id = cockpitForDecision[decisionId]
  return id ? getCockpitScenario(id) : undefined
}
