/*
 * The academy path: existing RideCraft modules, in the order a beginner should actually
 * meet them — machine, kit, first contact, yard controls, turning, then the road.
 * Riding Situations stay one module; this path interleaves them with handling so an
 * emergency stop and a basic turn come before traffic and highways.
 */

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export type ChallengeMode = 'sim' | 'live' | 'both'

export interface AcademyRef {
  moduleId: string
  lessonId: string
}

export interface AcademyPhase {
  id: string
  title: string
  goal: string
  /** Where this phase is practised for real. */
  practise: string
  lessons: readonly AcademyRef[]
}

export const academyPhases: readonly AcademyPhase[] = [
  {
    id: 'machine',
    title: 'The machine',
    goal: 'Know what a motorcycle is and what each control does before you sit on one.',
    practise: 'Lessons and the anatomy explorer — no public road.',
    lessons: [
      { moduleId: 'basics', lessonId: 'what-is-a-motorcycle' },
      { moduleId: 'basics', lessonId: 'types-of-motorcycles' },
      { moduleId: 'basics', lessonId: 'motorcycle-controls' },
      { moduleId: 'basics', lessonId: 'engine-basics' },
      { moduleId: 'basics', lessonId: 'understanding-rpm' },
      { moduleId: 'basics', lessonId: 'understanding-torque' },
      { moduleId: 'basics', lessonId: 'understanding-gears' },
      { moduleId: 'basics', lessonId: 'understanding-clutch' },
      { moduleId: 'basics', lessonId: 'understanding-throttle' },
      { moduleId: 'basics', lessonId: 'understanding-brakes' },
      { moduleId: 'basics', lessonId: 'understanding-drivetrain' },
    ],
  },
  {
    id: 'prepare',
    title: 'Prepare to ride',
    goal: 'Kit on, posture set, and the checks that belong before every ride.',
    practise: 'Your own motorcycle in a car park, or the checklist on this site.',
    lessons: [
      { moduleId: 'pre-ride', lessonId: 'riding-posture' },
      { moduleId: 'pre-ride', lessonId: 'protective-equipment' },
      { moduleId: 'pre-ride', lessonId: 'helmet' },
      { moduleId: 'pre-ride', lessonId: 'mirrors' },
      { moduleId: 'pre-ride', lessonId: 'tyre-inspection' },
      { moduleId: 'pre-ride', lessonId: 'brake-inspection' },
      { moduleId: 'pre-ride', lessonId: 'chain-inspection' },
      { moduleId: 'pre-ride', lessonId: 'fuel' },
      { moduleId: 'pre-ride', lessonId: 'instrument-cluster' },
      { moduleId: 'pre-ride', lessonId: 'neutral-gear' },
      { moduleId: 'pre-ride', lessonId: 'side-stand' },
      { moduleId: 'pre-ride', lessonId: 'pre-ride-checklist' },
    ],
  },
  {
    id: 'first-contact',
    title: 'First contact',
    goal: 'Get on, walk it, stall, pick it up — engine skills before traffic.',
    practise: 'Closed, flat, sealed ground with an instructor. Not a public road.',
    lessons: [
      { moduleId: 'first-ride', lessonId: 'before-the-road' },
      { moduleId: 'first-ride', lessonId: 'getting-on' },
      { moduleId: 'first-ride', lessonId: 'walking-the-bike' },
      { moduleId: 'first-ride', lessonId: 'stalling' },
      { moduleId: 'first-ride', lessonId: 'picking-it-up' },
      { moduleId: 'first-ride', lessonId: 'first-practice' },
    ],
  },
  {
    id: 'first-controls',
    title: 'First controls',
    goal: 'Move off, stop, clutch, gears and brakes until they are boring.',
    practise: 'Cockpit first, then a closed area on a real motorcycle.',
    lessons: [
      { moduleId: 'riding-situations', lessonId: 'starting-and-moving-off' },
      { moduleId: 'riding-situations', lessonId: 'stopping-without-stalling' },
      { moduleId: 'riding-situations', lessonId: 'using-the-clutch' },
      { moduleId: 'riding-situations', lessonId: 'changing-gear' },
      { moduleId: 'riding-situations', lessonId: 'using-the-brakes' },
    ],
  },
  {
    id: 'yard',
    title: 'Yard manoeuvres',
    goal: 'Slow riding, a U-turn, and how a motorcycle actually turns — before any junction.',
    practise: 'Cockpit for the U-turn rehearsal; figure-eight and slalom only on a real motorcycle.',
    lessons: [
      { moduleId: 'handling', lessonId: 'slow-speed' },
      { moduleId: 'handling', lessonId: 'u-turns' },
      { moduleId: 'riding-situations', lessonId: 'u-turn' },
      { moduleId: 'handling', lessonId: 'basic-turning' },
      { moduleId: 'handling', lessonId: 'leaning' },
      { moduleId: 'handling', lessonId: 'countersteering' },
      { moduleId: 'handling', lessonId: 'body-positioning' },
      { moduleId: 'handling', lessonId: 'tight-turns' },
      { moduleId: 'handling', lessonId: 'tyre-grip' },
      { moduleId: 'handling', lessonId: 'weight-transfer' },
    ],
  },
  {
    id: 'conditions',
    title: 'Stops you will need',
    goal: 'Hills, poor surfaces, a speed breaker, a pothole, and a practised emergency stop — still before busy traffic.',
    practise: 'Cockpit, then a closed area. Not invented on the road on the day.',
    lessons: [
      { moduleId: 'riding-situations', lessonId: 'hill-start' },
      { moduleId: 'riding-situations', lessonId: 'riding-downhill' },
      { moduleId: 'riding-situations', lessonId: 'wet-road' },
      { moduleId: 'riding-situations', lessonId: 'gravel' },
      { moduleId: 'riding-situations', lessonId: 'emergency-braking' },
      { moduleId: 'riding-situations', lessonId: 'speed-breaker' },
      { moduleId: 'riding-situations', lessonId: 'pothole' },
    ],
  },
  {
    id: 'traffic',
    title: 'Other traffic',
    goal: 'Signals, queues, a sudden obstacle, waiting to overtake, a highway gap, a roundabout.',
    practise: 'Cockpit and decision scenarios, then quiet real roads with an instructor.',
    lessons: [
      { moduleId: 'riding-situations', lessonId: 'traffic-signal' },
      { moduleId: 'riding-situations', lessonId: 'moving-in-traffic' },
      { moduleId: 'riding-situations', lessonId: 'slow-traffic' },
      { moduleId: 'riding-situations', lessonId: 'sudden-obstacle' },
      { moduleId: 'riding-situations', lessonId: 'overtaking' },
      { moduleId: 'riding-situations', lessonId: 'highway' },
      { moduleId: 'handling', lessonId: 'roundabouts' },
    ],
  },
  {
    id: 'roadcraft',
    title: 'Roadcraft',
    goal: 'Seeing, space, junctions, other people, and what to do when the ride goes wrong.',
    practise: 'Decision scenarios and, later, real roads. Night and a pillion wait until the rest is automatic.',
    lessons: [
      { moduleId: 'roadcraft', lessonId: 'seeing-and-being-seen' },
      { moduleId: 'roadcraft', lessonId: 'space-and-following' },
      { moduleId: 'roadcraft', lessonId: 'junctions' },
      { moduleId: 'roadcraft', lessonId: 'other-people' },
      { moduleId: 'roadcraft', lessonId: 'defensive-riding' },
      { moduleId: 'roadcraft', lessonId: 'night-riding' },
      { moduleId: 'roadcraft', lessonId: 'pillion' },
      { moduleId: 'roadcraft', lessonId: 'when-it-goes-wrong' },
    ],
  },
]

export const academyPath: readonly AcademyRef[] = academyPhases.flatMap((p) => p.lessons)

export const academyRefKey = (moduleId: string, lessonId: string) => `${moduleId}/${lessonId}`

export function getAcademyPhase(id: string | undefined) {
  return academyPhases.find((p) => p.id === id)
}

export function phasePath(id: string) {
  return `/learn/phase/${id}`
}

export function phaseForLesson(moduleId: string, lessonId: string) {
  return academyPhases.find((p) => p.lessons.some((s) => s.moduleId === moduleId && s.lessonId === lessonId))
}

export function academyNeighbors(moduleId: string, lessonId: string) {
  const index = academyPath.findIndex((s) => s.moduleId === moduleId && s.lessonId === lessonId)
  if (index < 0) return { index: -1, previous: undefined, next: undefined }
  return { index, previous: academyPath[index - 1], next: academyPath[index + 1] }
}

/** This module’s lessons in academy-path order (leftovers, if any, stay at the end). */
export function academyLessonIdsForModule(moduleId: string) {
  return academyPath.filter((s) => s.moduleId === moduleId).map((s) => s.lessonId)
}

export interface PracticalChallenge {
  id: string
  title: string
  perform: string
  skill: string
  difficulty: Difficulty
  mode: ChallengeMode
  lessonIds: readonly string[]
  to?: string
}

export const practicalChallenges: readonly PracticalChallenge[] = [
  { id: 'straight-start-stop', title: 'Start, roll, stop', perform: 'From idle in first, move off smoothly, ride a straight 20 m, stop without stalling. Repeat until it is boring.', skill: 'Friction zone, a little throttle, progressive brakes, clutch in at the stop.', difficulty: 'Beginner', mode: 'both', lessonIds: ['riding-situations/starting-and-moving-off', 'riding-situations/stopping-without-stalling'], to: '/simulators/cockpit?practice=start-and-move-off' },
  { id: 'clutch-control', title: 'Clutch control', perform: 'Hold a walking-pace crawl on the friction zone, then stop with the rear brake, then go again without a stall.', skill: 'The clutch as the speed control at walking pace.', difficulty: 'Beginner', mode: 'both', lessonIds: ['riding-situations/using-the-clutch', 'handling/slow-speed'], to: '/simulators/cockpit?practice=clutch-drill' },
  { id: 'gears', title: 'Clean gear changes', perform: 'Change up to third and back down to first on a straight, clutch in, throttle timed, no clunks.', skill: 'Gear, clutch and throttle in order.', difficulty: 'Beginner', mode: 'both', lessonIds: ['riding-situations/changing-gear'], to: '/simulators/cockpit?practice=gears-drill' },
  { id: 'smooth-braking', title: 'Smooth braking', perform: 'From about 30 km/h, stop on a mark with both brakes, no lock, clutch in as you stop.', skill: 'Progressive front, light rear, load transfer.', difficulty: 'Beginner', mode: 'both', lessonIds: ['riding-situations/using-the-brakes'], to: '/simulators/cockpit?practice=brakes-drill' },
  { id: 'hill-start', title: 'Hill-start challenge', perform: 'Hold the motorcycle on a slope with the rear brake, find the bite, leave without rolling back.', skill: 'Rear brake, biting point, more throttle than on the flat.', difficulty: 'Intermediate', mode: 'both', lessonIds: ['riding-situations/hill-start'], to: '/simulators/cockpit?practice=uphill-start' },
  { id: 'emergency-stop', title: 'Emergency stop', perform: 'From 40–50 km/h in a straight line, stop as short as the tyres allow without locking a wheel. With ABS, brake hard and let it work.', skill: 'A quick but progressive front brake. Must be clean before any public road.', difficulty: 'Intermediate', mode: 'both', lessonIds: ['riding-situations/emergency-braking'], to: '/simulators/cockpit?practice=emergency-braking' },
  { id: 'u-turn', title: 'U-turn challenge', perform: 'Turn round in a marked width at walking pace: full lock, clutch, rear brake. Front brake is a fail.', skill: 'Slow-speed balance and lock.', difficulty: 'Intermediate', mode: 'both', lessonIds: ['handling/u-turns', 'riding-situations/u-turn'], to: '/simulators/cockpit?practice=u-turn' },
  { id: 'traffic-sim', title: 'Queue and gap', perform: 'In the cockpit: ready at red, away after the car, two-second gap; then a crawling queue without closing in.', skill: 'Patience, clutch, following distance.', difficulty: 'Intermediate', mode: 'sim', lessonIds: ['riding-situations/moving-in-traffic', 'riding-situations/slow-traffic'], to: '/simulators/cockpit?practice=moving-in-traffic' },
  { id: 'observation', title: 'Road observation', perform: 'On the decision scenarios, name the hazard before you pick. On a real road with an instructor, say what you see out loud.', skill: 'Looking well ahead, not at the front wheel.', difficulty: 'Intermediate', mode: 'both', lessonIds: ['roadcraft/seeing-and-being-seen', 'roadcraft/defensive-riding'], to: '/scenarios' },
  { id: 'figure-eight', title: 'Figure-eight', perform: 'Ride a linked pair of circles at walking pace, eyes up, clutch and rear brake, without putting a foot down.', skill: 'Look, lean, slow-speed throttle/clutch. Not in the cockpit — the road there is straight.', difficulty: 'Intermediate', mode: 'live', lessonIds: ['handling/slow-speed', 'handling/u-turns'] },
  { id: 'slalom', title: 'Slalom', perform: 'Weave a line of cones at a slow jog, pressing the bar for each change, without hitting a cone or grabbing the front brake.', skill: 'Look through, gentle countersteer, no target fixation.', difficulty: 'Intermediate', mode: 'live', lessonIds: ['handling/countersteering', 'handling/slow-speed'] },
  { id: 'swerve', title: 'Obstacle avoidance', perform: 'At about 30 km/h, swerve around a cone and straighten. Brakes off during the lean. Fail if you brake and turn at the limit together.', skill: 'Eyes on the gap, a firm press, then the other bar.', difficulty: 'Advanced', mode: 'live', lessonIds: ['handling/countersteering', 'riding-situations/sudden-obstacle'] },
]

export interface SituationStage {
  level: Difficulty
  title: string
  happening: string
  decide: string
  /** Existing decision-scenario id, if this stage can be played today. */
  scenarioId?: string
  unlocksAfter: readonly string[]
}

export interface ProgressiveGroup {
  id: string
  title: string
  stages: readonly SituationStage[]
}

export const progressiveGroups: readonly ProgressiveGroup[] = [
  {
    id: 'pedestrian',
    title: 'A person in the road',
    stages: [
      { level: 'Beginner', title: 'Someone is crossing ahead', happening: 'You see a pedestrian on a crossing, well ahead, in daylight, dry road.', decide: 'How do you adjust speed and position?', scenarioId: 'pedestrian-ahead', unlocksAfter: ['riding-situations/using-the-brakes'] },
      { level: 'Intermediate', title: 'They run', happening: 'A person steps off the kerb suddenly at moderate speed. You have enough room to brake hard in a straight line.', decide: 'Brake, swerve, or both?', scenarioId: 'sudden-obstacle', unlocksAfter: ['riding-situations/emergency-braking', 'riding-situations/sudden-obstacle'] },
      { level: 'Advanced', title: 'Wet, and someone is behind you', happening: 'They step out on a wet road. A car is close behind. The other lane is not clearly empty.', decide: 'What do you protect first — the stop, the swerve, or the rider behind?', scenarioId: 'pedestrian-wet-behind', unlocksAfter: ['riding-situations/wet-road', 'roadcraft/space-and-following', 'roadcraft/other-people'] },
    ],
  },
  {
    id: 'vehicle-brakes',
    title: 'The vehicle ahead stops',
    stages: [
      { level: 'Beginner', title: 'A car slows in front', happening: 'Daylight, dry, you are following with room.', decide: 'How do you match its slowing without locking a wheel?', scenarioId: 'following-with-room', unlocksAfter: ['riding-situations/using-the-brakes'] },
      { level: 'Intermediate', title: 'It stops harder than you expected', happening: 'You have about two seconds. The car’s brake lights come on hard.', decide: 'Can you stop in the gap you actually have?', scenarioId: 'highway', unlocksAfter: ['riding-situations/highway'] },
      { level: 'Advanced', title: 'One second, in the rain', happening: 'You have drifted to about one second behind, it is raining, and they stop as a car with ABS can.', decide: 'What should already have been true before this second?', scenarioId: 'following-one-second-wet', unlocksAfter: ['riding-situations/wet-road', 'roadcraft/space-and-following'] },
    ],
  },
  {
    id: 'pothole',
    title: 'A hole in the wheel track',
    stages: [
      { level: 'Beginner', title: 'You see it early', happening: 'A pothole, 40 m ahead, with room in your lane to ease around it.', decide: 'Change line, or go over it?', scenarioId: 'pothole', unlocksAfter: ['riding-situations/pothole'] },
      { level: 'Intermediate', title: 'Too late to go around', happening: 'You see it close. Braking on it would compress the fork.', decide: 'What must be finished before the wheel drops in?', scenarioId: 'pothole-late', unlocksAfter: ['riding-situations/pothole', 'riding-situations/speed-breaker'] },
      { level: 'Advanced', title: 'Leaned, in the wet', happening: 'The hole sits in a bend on a damp road. A last-moment swerve would take you toward oncoming traffic.', decide: 'Upright and over, or a line you should have chosen earlier?', scenarioId: 'pothole-leaned-wet', unlocksAfter: ['handling/tyre-grip', 'riding-situations/wet-road'] },
    ],
  },
  {
    id: 'overtake',
    title: 'A slow vehicle ahead',
    stages: [
      { level: 'Beginner', title: 'You are not sure', happening: 'A slow vehicle, a two-lane road. You cannot yet see far enough past it.', decide: 'Pass, or wait?', scenarioId: 'overtaking', unlocksAfter: ['riding-situations/overtaking'] },
      { level: 'Intermediate', title: 'A gap that looks possible', happening: 'Oncoming traffic is distant. You are in a tall gear.', decide: 'Which gear, and is the road clear well beyond the pass?', scenarioId: 'overtake-gap', unlocksAfter: ['riding-situations/changing-gear', 'riding-situations/overtaking'] },
      { level: 'Advanced', title: 'Someone behind is pushing you', happening: 'A horn from behind, a short gap, a bend you cannot see around.', decide: 'Who owns the risk if you go?', scenarioId: 'overtake-pressured', unlocksAfter: ['roadcraft/defensive-riding'] },
    ],
  },
  {
    id: 'hill',
    title: 'A slope',
    stages: [
      { level: 'Beginner', title: 'Move off uphill, road empty', happening: 'You have stopped on a moderate slope. Nothing is behind you.', decide: 'How do you leave without rolling back?', scenarioId: 'uphill-start', unlocksAfter: ['riding-situations/hill-start'] },
      { level: 'Intermediate', title: 'A car is close behind', happening: 'Same slope, a bumper in the mirrors, engine idling.', decide: 'What holds the motorcycle while you find the bite?', scenarioId: 'hill-car-behind', unlocksAfter: ['riding-situations/hill-start', 'riding-situations/moving-in-traffic'] },
      { level: 'Advanced', title: 'Wet cobbles, downhill', happening: 'A long descent on a poor, damp surface.', decide: 'Brakes, gear, or both — and how much of each?', scenarioId: 'downhill', unlocksAfter: ['riding-situations/riding-downhill', 'riding-situations/wet-road'] },
    ],
  },
  {
    id: 'wet',
    title: 'Rain on the road',
    stages: [
      { level: 'Beginner', title: 'It starts to rain', happening: 'A dry road becomes wet. You are at a moderate speed, traffic light.', decide: 'What changes about braking and the gap?', scenarioId: 'wet-road', unlocksAfter: ['riding-situations/wet-road'] },
      { level: 'Intermediate', title: 'A painted line in a bend', happening: 'A wet white line sits where you wanted to brake while leaned.', decide: 'Where do you brake, and how upright?', scenarioId: 'wet-painted-line', unlocksAfter: ['handling/tyre-grip', 'riding-situations/wet-road'] },
      { level: 'Advanced', title: 'First rain after a hot day', happening: 'The first shower after a dry spell, diesel at a roundabout, traffic closing in.', decide: 'Speed, lean, and whether you join at all.', scenarioId: 'wet-first-rain', unlocksAfter: ['handling/roundabouts', 'roadcraft/defensive-riding'] },
    ],
  },
  {
    id: 'emergency',
    title: 'You have to stop now',
    stages: [
      { level: 'Beginner', title: 'A clear, dry straight', happening: 'A cone stands in for a stopped car, 40 m ahead at 50 km/h.', decide: 'How do you use the front brake?', scenarioId: 'emergency-braking', unlocksAfter: ['riding-situations/emergency-braking'] },
      { level: 'Intermediate', title: 'With ABS, and without', happening: 'Same stop. One motorcycle has ABS; yours in the yard might not.', decide: 'What changes, and what does not?', scenarioId: 'emergency-abs', unlocksAfter: ['riding-situations/emergency-braking', 'mechanics/abs'] },
      { level: 'Advanced', title: 'In a bend', happening: 'You need a hard stop while leaned. Grip is already used for the turn.', decide: 'Stand it up first, or brake leaned?', scenarioId: 'emergency-in-bend', unlocksAfter: ['handling/weight-transfer', 'handling/tyre-grip'] },
    ],
  },
  {
    id: 'obstacle',
    title: 'Something in your lane',
    stages: [
      { level: 'Beginner', title: 'You have room to stop', happening: 'A hazard ahead, enough distance, dry and straight.', decide: 'Straight-line braking.', scenarioId: 'emergency-braking', unlocksAfter: ['riding-situations/emergency-braking'] },
      { level: 'Intermediate', title: 'You do not have room, a lane is empty', happening: '26–32 m at 50 km/h, other lane clear.', decide: 'Brake, or a swerve with the eyes on the gap?', scenarioId: 'sudden-obstacle', unlocksAfter: ['riding-situations/sudden-obstacle', 'handling/countersteering'] },
      { level: 'Advanced', title: 'You do not have room, and the other lane is not empty', happening: 'Oncoming traffic, a wet surface, something in your wheel track.', decide: 'What can you still reduce, and what must you not do?', scenarioId: 'obstacle-no-escape', unlocksAfter: ['riding-situations/wet-road', 'roadcraft/other-people'] },
    ],
  },
  {
    id: 'signal',
    title: 'A traffic signal',
    stages: [
      { level: 'Beginner', title: 'Amber, with room', happening: 'The light turns amber. You can stop comfortably at the line.', decide: 'Stop how, in which gear?', scenarioId: 'traffic-signals', unlocksAfter: ['riding-situations/traffic-signal'] },
      { level: 'Intermediate', title: 'Amber, and a car behind', happening: 'You can stop, but someone is close behind. The junction is not empty.', decide: 'Stop, or go — and how do you tell them?', scenarioId: 'signal-amber-behind', unlocksAfter: ['riding-situations/traffic-signal', 'roadcraft/space-and-following'] },
      { level: 'Advanced', title: 'Green, and it does not look right', happening: 'The light is green. A car from the cross road is not stopping.', decide: 'Do you enter on green?', scenarioId: 'signal-green-cross', unlocksAfter: ['roadcraft/junctions', 'roadcraft/defensive-riding'] },
    ],
  },
  {
    id: 'following',
    title: 'Pressure from behind',
    stages: [
      { level: 'Beginner', title: 'Someone sits close', happening: 'Dry, straight, a car filling the mirror.', decide: 'Speed up, brake-check, or restore your own gap ahead?', scenarioId: 'tailgater', unlocksAfter: ['roadcraft/space-and-following'] },
      { level: 'Intermediate', title: 'They want you to pass', happening: 'A slow truck ahead, a tailgater behind, a blind bend.', decide: 'Who are you protecting if you pull out?', scenarioId: 'overtaking', unlocksAfter: ['riding-situations/overtaking', 'roadcraft/defensive-riding'] },
      { level: 'Advanced', title: 'Night, rain, a horn', happening: 'You are already at a sensible night speed. They flash and horn.', decide: 'Does their hurry change the beam you can stop in?', scenarioId: 'night-rain-horn', unlocksAfter: ['roadcraft/night-riding', 'roadcraft/when-it-goes-wrong'] },
    ],
  },
]
