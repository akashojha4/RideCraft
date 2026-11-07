import { startAndMoveOffTeaching } from '../situations/startAndMoveOff'
import { stopWithoutStallingTeaching } from '../situations/stopWithoutStalling'
import { brakesTeaching, clutchTeaching, gearsTeaching } from '../situations/drills'
import { downhillTeaching, emergencyTeaching, gravelTeaching, hillStartTeaching, wetRoadTeaching } from '../situations/roadConditions'
import { highwayTeaching, overtakingTeaching, potholeTeaching, suddenObstacleTeaching } from '../situations/hazards'
import { movingInTrafficTeaching, slowTrafficTeaching, speedBreakerTeaching, trafficSignalTeaching, uTurnTeaching } from '../situations/traffic'
import type { SituationTeaching } from '../situations/types'
import type { Lesson } from '../types'

/*
 * Riding Situations: one lesson per cockpit scenario, teaching each control before the
 * learner practises (and is tested) in the cockpit. Each lesson references its scenario by
 * id; the scenario supplies the steps, demonstration and set-up, so lesson, demonstration and
 * cockpit describe the same riding.
 */

export const ridingSituationLessons: Lesson[] = [
  {
    id: 'starting-and-moving-off',
    title: 'Starting and moving off',
    summary: 'From a cold engine to rolling in second: the clutch’s friction zone, a little throttle and first gear working together.',
    durationMinutes: 12,
    objectives: ['Start the engine safely', 'Use the friction zone to move off without stalling or jerking', 'Change up to second once rolling'],
    blocks: [],
    knowledgeCheck: startAndMoveOffTeaching.questions,
    situation: startAndMoveOffTeaching,
  },
  {
    id: 'stopping-without-stalling',
    title: 'Stopping without stalling',
    summary: 'Brakes to stop, clutch in before the engine falls below idle, and first gear ready for moving off.',
    durationMinutes: 10,
    objectives: ['Stop smoothly with progressive braking', 'Pull the clutch in at the right moment, judged from the engine', 'Stop in first gear, ready to move off'],
    blocks: [],
    knowledgeCheck: stopWithoutStallingTeaching.questions,
    situation: stopWithoutStallingTeaching,
  },
  situationLesson(clutchTeaching, 'using-the-clutch', 'Using the clutch', 'Disengaged, slipping, locked: what the clutch lever does to the plates and what reaches the rear wheel.', 8, ['Find the friction zone and the biting point', 'Explain what the plates do in each state', 'Use only a little throttle while the clutch slips']),
  situationLesson(gearsTeaching, 'changing-gear', 'Changing gear', 'Up to second and third and back down: the clutch, throttle and gear lever in the right order.', 10, ['Change up smoothly', 'Explain why the revs fall in a taller gear', 'Change down and use engine braking']),
  situationLesson(brakesTeaching, 'using-the-brakes', 'Using the brakes', 'Front, rear and both together: load transfer, grip and stopping without locking a wheel.', 10, ['Explain why the front brake does most of the work', 'Brake progressively without locking a wheel', 'Stop with the clutch in']),
  situationLesson(hillStartTeaching, 'hill-start', 'Hill start', 'Move off uphill without rolling back: the rear brake holds, the clutch takes the strain.', 10, ['Hold the motorcycle on a slope with the rear brake', 'Find the point where the clutch holds against gravity', 'Release the brake and move off without rolling back']),
  situationLesson(downhillTeaching, 'riding-downhill', 'Riding downhill', 'Control your speed on a long descent with the brakes and a lower gear.', 8, ['Explain why speed rises downhill even in gear', 'Brake to a safe speed, then change down', 'Let engine braking hold the speed']),
  situationLesson(wetRoadTeaching, 'wet-road', 'Braking on a wet road', 'Half the grip: smooth, earlier, progressive braking without locking a wheel.', 8, ['Explain what changes on a wet road', 'Brake progressively within the lower grip', 'Allow more distance']),
  situationLesson(gravelTeaching, 'gravel', 'Slowing on gravel', 'The lowest grip: gentle inputs and mostly rear brake.', 8, ['Explain why gravel needs gentle inputs', 'Slow mainly with the rear brake', 'Finish with a very gentle front']),
  situationLesson(emergencyTeaching, 'emergency-braking', 'Emergency braking', 'Stop as fast as the tyres allow: a quick but progressive front brake.', 10, ['Use the front brake to its limit without locking', 'Explain load transfer under hard braking', 'Estimate how stopping distance grows with speed']),
  situationLesson(trafficSignalTeaching, 'traffic-signal', 'Stopping at a traffic signal', 'React to amber, stop at the line without stalling, and wait in neutral.', 10, ['React to an amber light in time', 'Brake to the stop line and change down while rolling', 'Wait in neutral at the line']),
  situationLesson(movingInTrafficTeaching, 'moving-in-traffic', 'Moving again in traffic', 'Ready in first at the red light, away only once the car ahead has gone, then a safe gap.', 8, ['Wait in gear with the clutch held in', 'Move off only when the light and the car ahead allow', 'Keep a two-second gap']),
  situationLesson(slowTrafficTeaching, 'slow-traffic', 'Riding in slow traffic', 'Creep, stop and go behind a car at walking pace, with the clutch as the speed control.', 10, ['Use the friction zone to set walking pace', 'Stop smoothly with the rear brake', 'Follow again without stalling or closing in']),
  situationLesson(speedBreakerTeaching, 'speed-breaker', 'Crossing a speed breaker', 'Slow early, roll over off the brakes, ride away.', 8, ['Explain why speed makes the jolt harder', 'Finish braking before the bump', 'Choose a low gear for crossing']),
  situationLesson(potholeTeaching, 'pothole', 'A pothole in your path', 'If you must go over it: slow early, roll over upright and off the brakes.', 8, ['Choose a small change of line when there is room', 'Finish braking before the hole', 'Roll over it upright']),
  situationLesson(suddenObstacleTeaching, 'sudden-obstacle', 'A sudden obstacle', 'Brake immediately, hard and straight — or swerve, never both at full strength.', 10, ['Brake at once in a straight line', 'Explain why reaction distance matters', 'Avoid braking and swerving at the limit together']),
  situationLesson(overtakingTeaching, 'overtaking', 'Waiting to overtake', 'Hold a two-second gap and stay behind until the road is clearly clear.', 8, ['Hold a two-second gap', 'Explain why closing in does not help a pass', 'Change down before a real overtake']),
  situationLesson(highwayTeaching, 'highway', 'Highway following', 'Two seconds at 80 km/h, then a hard stop when the car ahead brakes.', 10, ['Hold a two-second gap at highway speed', 'Brake as soon as the car does', 'Explain why a one-second gap is used up by reaction']),
  situationLesson(uTurnTeaching, 'u-turn', 'U-turn', 'Turn round at walking pace: full lock, clutch and rear brake, never the front brake.', 10, ['Turn to full lock before moving', 'Hold walking pace with the clutch and rear brake', 'Straighten only when facing the other way']),
]

/** A Riding Situations lesson around a scenario's teaching (its questions are the knowledge check). */
function situationLesson(teaching: SituationTeaching, id: string, title: string, summary: string, durationMinutes: number, objectives: string[]): Lesson {
  return { id, title, summary, durationMinutes, objectives, blocks: [], knowledgeCheck: teaching.questions, situation: teaching }
}

