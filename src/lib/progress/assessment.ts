import { coreModules } from '@/content/curriculum'
import type { QuizQuestion } from '@/content/types'

/*
 * The knowledge assessment: questions drawn from every core module's lesson quizzes — five per
 * module, chosen afresh for each attempt (a seeded shuffle, so an attempt can be rebuilt
 * from its seed). Optional modules are left out. Pass mark 80 %.
 */

export const PER_MODULE = 5
export const PASS_MARK = 0.8

export interface AssessmentQuestion extends QuizQuestion {
  key: string
  moduleId: string
  moduleTitle: string
  lessonTitle: string
}

/** Small deterministic random generator (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildAssessment(seed: number): AssessmentQuestion[] {
  const random = rng(seed)
  const out: AssessmentQuestion[] = []
  for (const m of coreModules) {
    const pool: AssessmentQuestion[] = m.lessons.flatMap((l) => l.knowledgeCheck.map((q) => ({ ...q, key: `${m.id}/${l.id}/${q.id}`, moduleId: m.id, moduleTitle: m.title, lessonTitle: l.title })))
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    // Prefer one question per lesson.
    const seen = new Set<string>()
    const picked: AssessmentQuestion[] = []
    for (const q of pool) {
      if (picked.length === PER_MODULE) break
      if (!seen.has(q.lessonTitle)) {
        seen.add(q.lessonTitle)
        picked.push(q)
      }
    }
    out.push(...picked)
  }
  return out
}
