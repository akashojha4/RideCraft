import { getCockpitScenario } from './cockpit'

/**
 * Decision-scenario id → cockpit scenario id, where the same riding can be practised
 * in the rider’s seat after (or beside) the decision animation.
 */
export const cockpitForDecision: Readonly<Record<string, string>> = {
  'traffic-signals': 'traffic-signal',
  'heavy-traffic': 'slow-traffic',
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
}

export const cockpitScenarioForDecision = (decisionId: string) => {
  const id = cockpitForDecision[decisionId]
  return id ? getCockpitScenario(id) : undefined
}
