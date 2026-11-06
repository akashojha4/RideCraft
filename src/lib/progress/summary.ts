import { exercises as clutchExercises } from '@/content/simulators/clutchThrottle'
import { exercises as gearExercises } from '@/content/simulators/gears'
import { exercises as rideExercises } from '@/content/simulators/rideStop'
import { scenarios } from '@/content/scenarios'
import { cockpitScenarios } from '@/content/scenarios/cockpit'
import { visibleModules } from '@/content/curriculum'
import type { Progress } from './store'

/*
 * Turns the raw progress record into the numbers the learner sees: completion per module,
 * quiz scores, practice done, and a level. Points: 10 per lesson completed, 2 per quiz
 * question answered correctly (best attempt), 15 per simulator exercise passed, 15 per
 * scenario solved, plus the best knowledge-assessment score (up to 100). The level comes
 * from the share of all available points.
 */

export const SIMULATORS = [
  { id: 'clutch-throttle', title: 'Clutch & throttle', path: '/simulators/clutch-throttle', exercises: clutchExercises },
  { id: 'gears', title: 'Gear shifting', path: '/simulators/gears', exercises: gearExercises },
  { id: 'ride-and-stop', title: 'Riding & stopping', path: '/simulators/ride-and-stop', exercises: rideExercises },
  // Guided cockpit scenarios and drills, recorded with source 'cockpit'.
  { id: 'cockpit', title: 'Rider cockpit', path: '/simulators/cockpit', exercises: cockpitScenarios },
] as const

export const LEVELS = [
  { name: 'Newcomer', from: 0, text: 'Just getting started. Begin with Motorcycle Basics.' },
  { name: 'Learner', from: 0.1, text: 'You know the machine’s parts and controls.' },
  { name: 'Novice rider', from: 0.3, text: 'You understand the controls and have practised the basics.' },
  { name: 'Road-ready', from: 0.55, text: 'You can explain riding technique and have made safe decisions in real scenarios.' },
  { name: 'Skilled rider', from: 0.8, text: 'Strong knowledge across riding, handling and mechanics.' },
  { name: 'Expert', from: 0.95, text: 'You have completed almost everything RideCraft has to teach.' },
] as const

export function summarize(p: Progress) {
  const modules = visibleModules
    .filter((m) => m.lessons.length > 0)
    .map((m) => {
      const lessons = m.lessons.map((l) => ({ lesson: l, record: p.lessons[`${m.id}/${l.id}`] }))
      const completed = lessons.filter((x) => x.record?.completedAt).length
      const questions = m.lessons.reduce((n, l) => n + l.knowledgeCheck.length, 0)
      const correct = lessons.reduce((n, x) => n + (x.record?.quiz?.best ?? 0), 0)
      const answered = lessons.reduce((n, x) => n + (x.record?.quiz ? x.record.quiz.total : 0), 0)
      return { module: m, lessons, completed, total: m.lessons.length, questions, correct, answered }
    })
  const lessonsTotal = modules.reduce((n, m) => n + m.total, 0)
  const lessonsCompleted = modules.reduce((n, m) => n + m.completed, 0)
  const questions = modules.reduce((n, m) => n + m.questions, 0)
  const bestCorrect = modules.reduce((n, m) => n + m.correct, 0)
  const answered = modules.reduce((n, m) => n + m.answered, 0)
  const exercisesTotal = SIMULATORS.reduce((n, s) => n + s.exercises.length, 0)
  const exercisesPassed = SIMULATORS.reduce((n, s) => n + s.exercises.filter((e) => p.exercisesPassed[`${s.id}/${e.id}`]).length, 0)
  const scenariosSolved = scenarios.filter((s) => p.scenariosSolved[s.id]).length
  const assessmentBest = p.assessments.reduce((b, a) => Math.max(b, a.correct / a.total), 0)
  const points = lessonsCompleted * 10 + bestCorrect * 2 + exercisesPassed * 15 + scenariosSolved * 15 + Math.round(assessmentBest * 100)
  const max = lessonsTotal * 10 + questions * 2 + exercisesTotal * 15 + scenarios.length * 15 + 100
  const share = points / max
  const levelIndex = LEVELS.reduce((idx, l, i) => (share >= l.from ? i : idx), 0)
  const next = LEVELS[levelIndex + 1]
  return {
    modules,
    lessonsTotal,
    lessonsCompleted,
    questions,
    bestCorrect,
    quizAverage: answered ? bestCorrect / answered : null,
    exercisesTotal,
    exercisesPassed,
    scenariosTotal: scenarios.length,
    scenariosSolved,
    assessmentBest: p.assessments.length ? assessmentBest : null,
    points,
    max,
    share,
    level: LEVELS[levelIndex],
    levelIndex,
    next,
    toNext: next ? Math.max(0, Math.ceil(next.from * max - points)) : 0,
  }
}

export type ProgressSummary = ReturnType<typeof summarize>
