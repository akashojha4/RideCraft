/**
 * The development roadmap, as data. It drives the availability badges on the home page
 * and the simulator hub, and an empty module renders its phase (`PhasePending`) instead of
 * fake content, so the app never presents an unbuilt feature as finished.
 *
 * Keep `status` in sync with PROJECT_PROGRESS.md.
 */

export type PhaseStatus = 'NOT STARTED' | 'IN PROGRESS' | 'TESTING' | 'COMPLETED' | 'BLOCKED'

export interface Phase {
  number: number
  title: string
  summary: string
  status: PhaseStatus
  /** Route of the app area this phase builds, if any. */
  route?: string
  scope: string[]
}

export const phases: Phase[] = [
  {
    number: 0,
    title: 'Foundation & Architecture',
    summary: 'Tooling, design system, routing, animation system and lesson structure.',
    status: 'COMPLETED',
    route: '/design-system',
    scope: ['Vite + React + TypeScript', 'Tailwind design tokens', 'Routing', 'Animation system', 'Lesson structure'],
  },
  {
    number: 1,
    title: 'Landing Page',
    summary: 'The MotoLab visual identity: hero, motorcycle visual, roadmap and categories.',
    status: 'COMPLETED',
    route: '/',
    scope: ['Navigation bar', 'Hero section', 'Motorcycle visual', 'Roadmap preview', 'Learning categories', 'Anatomy preview'],
  },
  {
    number: 2,
    title: 'Anatomy Explorer',
    summary: 'An interactive side-view motorcycle with every major component explained.',
    status: 'COMPLETED',
    route: '/anatomy',
    scope: ['Engine', 'Clutch', 'Gearbox', 'Throttle', 'Brakes', 'Chain & sprockets', 'Wheels', 'Suspension', 'Exhaust'],
  },
  {
    number: 3,
    title: 'Motorcycle Basics',
    summary: 'Eleven lessons on what a motorcycle is and how its core systems work.',
    status: 'COMPLETED',
    route: '/learn/basics',
    scope: ['Motorcycle types', 'Controls', 'Engine basics', 'RPM', 'Torque', 'Gears', 'Clutch', 'Throttle', 'Brakes', 'Drivetrain'],
  },
  {
    number: 4,
    title: 'Pre-Ride Preparation',
    summary: 'Posture, protective gear, inspections and an interactive pre-ride checklist.',
    status: 'COMPLETED',
    route: '/learn/pre-ride',
    scope: ['Riding posture', 'Protective equipment', 'Tyre, brake & chain checks', 'Instrument cluster', 'Pre-ride checklist'],
  },
  {
    number: 5,
    title: 'Starting Simulator',
    summary: 'Start a geared motorcycle with synchronised rider and internal-mechanism views.',
    status: 'COMPLETED',
    route: '/simulators/starting',
    scope: ['Rider controls', 'Starter motor & crankshaft', 'Four-stroke cycle', 'Instruction panel', 'Playback controls'],
  },
  {
    number: 6,
    title: 'Clutch & Throttle Simulator',
    summary: 'Find the biting point and balance clutch and throttle without stalling.',
    status: 'COMPLETED',
    route: '/simulators/clutch-throttle',
    scope: ['Biting point', 'Friction zone', 'Engagement', 'Stalling', 'Smooth acceleration'],
  },
  {
    number: 7,
    title: 'Gear Shifting Simulator',
    summary: 'An animated gearbox showing ratios, RPM, wheel speed and torque multiplication.',
    status: 'COMPLETED',
    route: '/simulators/gears',
    scope: ['Gear pattern', 'Upshifting', 'Downshifting', 'Gear ratios', 'Engine braking'],
  },
  {
    number: 8,
    title: 'Riding & Stopping',
    summary: 'From stationary to moving to a smooth, progressive stop.',
    status: 'COMPLETED',
    route: '/simulators/ride-and-stop',
    scope: ['Pulling away', 'Maintaining speed', 'Engine braking', 'Front, rear & combined braking'],
  },
  {
    number: 9,
    title: 'Turning & Handling',
    summary: 'Leaning, countersteering, body position and slow-speed control.',
    status: 'COMPLETED',
    route: '/learn/handling',
    scope: ['Leaning', 'Countersteering', 'U-turns', 'Roundabouts', 'Tyre grip', 'Weight transfer'],
  },
  {
    number: 10,
    title: 'Real-World Scenarios',
    summary: 'Fourteen decision-based riding situations with explained consequences.',
    status: 'COMPLETED',
    route: '/scenarios',
    scope: ['Traffic', 'Hills', 'Wet roads & gravel', 'Emergency braking', 'Overtaking', 'Night riding', 'Pillion'],
  },
  {
    number: 11,
    title: 'Advanced Mechanics',
    summary: 'Cutaway deep-dives into engines, transmissions, ABS, suspension and tyres.',
    status: 'COMPLETED',
    route: '/learn/mechanics',
    scope: ['Combustion', 'Compression ratio', 'Fuel injection', 'Cooling & lubrication', 'ABS & traction control'],
  },
  {
    number: 12,
    title: 'Progress & Assessment',
    summary: 'Saved progress, quiz scores, levels and a knowledge assessment.',
    status: 'COMPLETED',
    route: '/progress',
    scope: ['Completed lessons', 'Learning levels', 'Quiz scores', 'Practice history', 'Local persistence'],
  },
  {
    number: 13,
    title: 'Final QA',
    summary: 'A full review of routes, interactions, accessibility, performance and accuracy.',
    status: 'COMPLETED',
    scope: ['All routes & controls', 'Responsive design', 'Accessibility', 'Performance', 'Technical accuracy'],
  },
]

export function getPhase(number: number): Phase {
  const phase = phases.find((p) => p.number === number)
  if (!phase) throw new Error(`Unknown phase ${number}`)
  return phase
}

/** Whether the app area built by a phase is open to learners. */
export function isPhaseAvailable(number: number) {
  return getPhase(number).status === 'COMPLETED'
}
