import { getLesson, lessonForScenario, lessonPath } from './curriculum'
import { cockpitForDecision } from './scenarios/cockpitLink'

/*
 * The lessons behind each practice page (simulators, the anatomy explorer, the checklist and
 * the decision scenarios), so a learner — and a search engine — can follow a page to the
 * lesson that explains it.
 */

/** "module/lesson" references, per page. */
export const relatedLessonRefs: Readonly<Record<string, readonly string[]>> = {
  '/simulators/starting': ['basics/motorcycle-controls', 'pre-ride/neutral-gear', 'riding-situations/starting-and-moving-off'],
  '/simulators/clutch-throttle': ['basics/understanding-clutch', 'riding-situations/using-the-clutch', 'riding-situations/hill-start'],
  '/simulators/gears': ['basics/understanding-gears', 'riding-situations/changing-gear', 'mechanics/gear-ratios'],
  '/simulators/ride-and-stop': ['basics/understanding-brakes', 'riding-situations/stopping-without-stalling', 'riding-situations/using-the-brakes'],
  '/simulators/clutch-explorer': ['basics/understanding-clutch', 'riding-situations/using-the-clutch', 'mechanics/clutch-plates'],
  '/simulators/cockpit': ['riding-situations/starting-and-moving-off', 'first-ride/first-practice', 'handling/slow-speed'],
  '/anatomy': ['basics/what-is-a-motorcycle', 'basics/motorcycle-controls', 'basics/understanding-drivetrain'],
  '/checklist': ['pre-ride/pre-ride-checklist', 'pre-ride/tyre-inspection', 'pre-ride/brake-inspection'],
}

/** For decision scenarios without a Riding Situations lesson of their own: the closest lesson, by topic. */
const SCENARIO_TOPICS: readonly [RegExp, string][] = [
  [/night/, 'roadcraft/night-riding'],
  [/pillion/, 'roadcraft/pillion'],
  [/pedestrian/, 'roadcraft/other-people'],
  [/following|tailgater/, 'roadcraft/space-and-following'],
  [/signal/, 'riding-situations/traffic-signal'],
  [/overtake/, 'riding-situations/overtaking'],
  [/pothole/, 'riding-situations/pothole'],
  [/obstacle/, 'riding-situations/sudden-obstacle'],
  [/emergency/, 'riding-situations/emergency-braking'],
  [/wet/, 'riding-situations/wet-road'],
  [/hill/, 'riding-situations/hill-start'],
  [/traffic/, 'riding-situations/slow-traffic'],
]

export interface RelatedLesson {
  title: string
  topic: string
  path: string
}

function resolve(ref: string): RelatedLesson | undefined {
  const [moduleId, lessonId] = ref.split('/')
  const found = getLesson(moduleId, lessonId)
  return found && { title: found.lesson.title, topic: found.module.title, path: lessonPath(moduleId, lessonId) }
}

export function relatedLessonsForPage(path: string): RelatedLesson[] {
  return (relatedLessonRefs[path] ?? []).map(resolve).filter((x): x is RelatedLesson => !!x)
}

export function relatedLessonsForScenario(scenarioId: string): RelatedLesson[] {
  const out: RelatedLesson[] = []
  const cockpit = cockpitForDecision[scenarioId]
  const taught = cockpit ? lessonForScenario(cockpit) : undefined
  if (taught) out.push({ title: taught.lesson.title, topic: taught.module.title, path: taught.path })
  const topic = SCENARIO_TOPICS.find(([re]) => re.test(scenarioId))?.[1]
  const extra = topic && resolve(topic)
  if (extra && !out.some((l) => l.path === extra.path)) out.push(extra)
  return out
}
