import type { CockpitScenario } from '@/content/scenarios/cockpit/types'
import type { Lesson } from '@/content/types'
import { CONTROLS, type ControlId } from './controls'
import type { SectionId } from './sections'

/*
 * A Riding Situations lesson as a narration script: one cue per idea, built from the lesson's
 * own teaching and its scenario, so the narration says exactly what the page says. Each cue
 * names the section to show and what to point at (a control, a timeline stage, a mistake, or a
 * demonstration step to play while it is spoken).
 */

export interface NarrationCue {
  id: string
  section: SectionId
  /** What is shown as the caption. */
  text: string
  control?: ControlId
  stage?: number
  mistake?: number
  /** Open the control's “inside the motorcycle” panel. */
  detail?: boolean
  /** Play this step of the demonstration while speaking; the narration waits for it to finish. */
  demoStep?: number
}

/** Text as it should be spoken: units and symbols in words. */
export function speakable(text: string) {
  return text
    .replace(/v² \/ \(?g·R\)?/g, 'v squared over g times R')
    .replace(/(\d)\s*km\/h/g, '$1 kilometres per hour')
    .replace(/(\d)\s*%/g, '$1 percent')
    .replace(/\bRPM\b/g, 'R P M')
    .replace(/N·m/g, 'newton metres')
    .replace(/(\d)\s*m\/s²/g, '$1 metres per second squared')
    .replace(/(\d)\s*m\b/g, '$1 metres')
    .replace(/(\d)\s*s\b/g, '$1 seconds')
    .replace(/(\d)\s*g\b/g, '$1 g')
    .replace(/→/g, ' to ')
    .replace(/×/g, ' times ')
    .replace(/≥/g, ' at least ')
    .replace(/\be\.g\./g, 'for example')
    .replace(/\s+—\s+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildNarration(lesson: Lesson, scenario: CockpitScenario): NarrationCue[] {
  const t = lesson.situation!
  const cues: NarrationCue[] = []
  const add = (c: Omit<NarrationCue, 'id'>) => cues.push({ ...c, id: `${c.section}-${cues.length}` })

  add({ section: 'situation', text: `${lesson.title}. ${lesson.summary}` })
  add({ section: 'situation', text: `Where you are: ${t.situation.where} What is happening: ${t.situation.happening}` })
  add({ section: 'situation', text: `What you want to achieve: ${t.situation.goal} The main challenge: ${t.situation.challenge}` })
  add({ section: 'situation', text: `Before you act, understand this. ${t.situation.before.join(' ')}` })

  add({ section: 'controls', text: 'Now, control by control.', control: t.controls[0].control })
  for (const c of t.controls) {
    const label = CONTROLS[c.control].label
    add({ section: 'controls', control: c.control, text: `The ${label.toLowerCase()}. ${c.what} When: ${c.when} How: ${c.how} How much: ${c.howMuch}` })
    add({ section: 'controls', control: c.control, detail: true, text: `Why: ${c.why} Inside the motorcycle: ${c.mechanics} On the road: ${c.result}` })
  }

  add({ section: 'timeline', stage: 0, text: 'Here is the whole manoeuvre on one timeline, stage by stage.' })
  scenario.steps.forEach((st, k) => add({ section: 'timeline', stage: k, text: `Stage ${k + 1}: ${st.title}. ${st.instruction} ${st.explanation}` }))

  add({ section: 'watch', text: 'Now watch it done. The cockpit rides it for you, step by step.' })
  ;(scenario.demo ?? []).forEach((d, k) => add({ section: 'watch', demoStep: k, text: `Step ${k + 1}: ${scenario.steps[k].title}. ${d.watch}` }))

  add({ section: 'mistakes', mistake: 0, text: 'Now, the mistakes beginners commonly make.' })
  t.mistakes.forEach((m, k) => add({ section: 'mistakes', mistake: k, text: `${m.title}. ${m.does} It feels like this: ${m.feels} What happens: ${m.mechanics} To correct it: ${m.fix}` }))

  add({ section: 'check', text: `Now check your understanding with ${lesson.knowledgeCheck.length} quick questions. Take them at your own pace.` })
  add({ section: 'practice', text: `Finally, practise it yourself. Press “Practice in the Simulator” to open ${scenario.title.toLowerCase()} in the cockpit.` })
  return cues
}
