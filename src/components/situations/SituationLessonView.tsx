import { ArrowLeft, ArrowRight, ChevronRight, Clock, Gauge, Headphones } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { KnowledgeCheck } from '@/components/lesson/KnowledgeCheck'
import { PagerLink } from '@/components/lesson/LessonView'
import { Container } from '@/components/ui/Container'
import { lessonPath, type LessonNeighbor, type LessonPlace } from '@/content/curriculum'
import { getCockpitScenario } from '@/content/scenarios/cockpit'
import { demoPlan, runScenario } from '@/content/scenarios/cockpit/run'
import type { LearningModule, Lesson } from '@/content/types'
import { cn } from '@/lib/cn'
import { progress, useProgress } from '@/lib/progress/store'
import { ControlTimeline } from './ControlTimeline'
import { ControlsSection, MistakesSection, SituationSection } from './SituationSections'
import { useNarration } from '@/hooks/useNarration'
import { NarrationBar } from './NarrationBar'
import { buildNarration } from './narration'
import { SECTIONS } from './sections'
import { WatchItDone } from './WatchItDone'

/*
 * A Riding Situations lesson: learn the situation → each control → the whole manoeuvre →
 * watch it done → mistakes → check → practise. One section is shown at a time (?section=n
 * in the address, so the back button and the cockpit's "Back to the lesson" return to it).
 * The timeline and the demonstration come from one run of the scenario's demonstration on the
 * shared model; the practice link opens the same scenario, by its id, in the cockpit.
 */


export function SituationLessonView({ module, lesson, previous, next, place }: { module: LearningModule; lesson: Lesson; index: number; previous?: LessonNeighbor; next?: LessonNeighbor; place: LessonPlace }) {
  const teaching = lesson.situation!
  const scenario = getCockpitScenario(teaching.scenario)!
  const run = useMemo(() => runScenario(scenario, demoPlan(scenario)), [scenario])
  const [params, setParams] = useSearchParams()
  // The narrated walkthrough (pilot lessons): built from this lesson, it shows the section it is talking about.
  const cues = useMemo(() => (teaching.narrated ? buildNarration(lesson, scenario) : []), [teaching, lesson, scenario])
  const narration = useNarration(cues)
  const narrating = narration.status !== 'idle' && narration.cue ? narration.cue : null
  const at = narrating ? SECTIONS.findIndex((s) => s.id === narrating.section) : Math.max(0, SECTIONS.findIndex((s) => s.id === params.get('section')))
  const section = SECTIONS[at]
  const live = narration.active ? narrating : null
  const record = useProgress().lessons[`${module.id}/${lesson.id}`]
  const path = lessonPath(module.id, lesson.id)
  const practice = `/simulators/cockpit?practice=${scenario.id}&from=${encodeURIComponent(`${path}?section=practice`)}`
  useEffect(() => progress.visitLesson(module.id, lesson.id), [module.id, lesson.id])
  // Keep the section the narration is talking about in view.
  const following = narration.active
  useEffect(() => {
    if (following) document.getElementById('section-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [at, following])
  const go = (k: number) => {
    // While narrated, moving to a section moves the narration there too.
    if (narration.active) {
      const first = cues.findIndex((c) => c.section === SECTIONS[k].id)
      if (first >= 0) narration.goTo(first)
    } else {
      if (narrating) narration.stop()
      setParams(k === 0 ? {} : { section: SECTIONS[k].id })
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  /** Stop the narration and stay on the section it had reached. */
  const stopNarration = () => {
    const id = narration.cue?.section
    narration.stop()
    if (id) setParams(id === 'situation' ? {} : { section: id })
  }

  return (
    <article className="pt-8 pb-12 sm:pt-12" data-situation-lesson={teaching.scenario}>
      <Container className="max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-subtle">
            <li>
              <Link to="/learn" className="hover:text-ink">
                Learn
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li>
              <Link to={place.href} className="hover:text-ink">
                {place.title}
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li aria-current="page" className="text-ink-muted">
              Lesson {place.step}
            </li>
          </ol>
        </nav>

        <header className="mb-6 space-y-2">
          <p className="tabular font-mono text-xs tracking-[0.18em] text-ignition-400 uppercase">
            {place.title} · lesson {place.step} of {place.of}
          </p>
          <h1 className="text-3xl font-semibold text-ink sm:text-4xl">{lesson.title}</h1>
          <p className="text-lg text-ink-muted">{lesson.summary}</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-subtle">
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> {lesson.durationMinutes} min
            </span>
            {teaching.narrated && narration.status === 'idle' && (
              <button type="button" onClick={narration.play} data-play-lesson className="flex min-h-11 items-center gap-2 rounded-xl bg-ignition-500 px-4 text-sm font-medium text-bg hover:bg-ignition-400">
                <Headphones className="size-4" aria-hidden /> Play the lesson — narrated
              </button>
            )}
            {record?.quiz && (
              <span className="font-mono text-xs" data-lesson-quiz>
                Quick check best {record.quiz.best}/{record.quiz.total}
              </span>
            )}
          </p>
        </header>

        {/* Section navigation */}
        <nav aria-label="Lesson sections" className="sticky top-16 z-10 -mx-4 mb-8 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-2">
          <ol className="flex gap-1 overflow-x-auto">
            {SECTIONS.map((s, k) => (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go(k)}
                  aria-current={k === at ? 'step' : undefined}
                  className={cn('flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm whitespace-nowrap', k === at ? 'bg-surface-raised text-ink' : 'text-ink-muted hover:text-ink')}
                >
                  <span className={cn('flex size-6 items-center justify-center rounded-full border font-mono text-xs', k === at ? 'border-ignition-400 text-ignition-300' : k < at ? 'border-ok-500/50 text-ok-400' : 'border-line')}>{k + 1}</span>
                  <span className={cn(k !== at && 'hidden md:inline')}>{s.short}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <section aria-labelledby="section-title" data-section={section.id}>
          <p className="font-mono text-xs text-ink-subtle">
            Section {at + 1} of {SECTIONS.length}
          </p>
          <h2 id="section-title" className="mb-5 text-2xl font-semibold text-ink">
            {section.title}
          </h2>

          {section.id === 'situation' && <SituationSection teaching={teaching} scenario={scenario} run={run} from={`${path}?section=situation`} />}
          {section.id === 'controls' && <ControlsSection teaching={teaching} scenario={scenario} run={run} focus={live?.control} focusDetail={live ? !!live.detail : undefined} />}
          {section.id === 'timeline' && (
            <>
              <p className="mb-4 text-ink-muted">Every control through the whole manoeuvre, stage by stage. Choose a stage to see what each control is doing and what the motorcycle does.</p>
              <ControlTimeline scenario={scenario} run={run} controls={['clutch', 'throttle', 'front', 'rear', 'gear', ...(teaching.controls.some((c) => c.control === 'steer') ? (['steer'] as const) : [])]} focusStage={live?.stage} />
            </>
          )}
          {section.id === 'watch' && (
            <>
              <p className="mb-4 text-ink-muted">The cockpit rides it for you. Press Play and watch the levers, the road, the instruments and the machine — then step through it at your own pace.</p>
              <WatchItDone scenario={scenario} run={run} narrated={live && live.section === 'watch' ? { step: live.demoStep ?? null, paused: narration.status === 'paused', onHeld: narration.release } : undefined} />
            </>
          )}
          {section.id === 'mistakes' && <MistakesSection teaching={teaching} scenario={scenario} focus={live?.mistake} />}
          {section.id === 'check' && <KnowledgeCheck key={`${module.id}/${lesson.id}`} questions={lesson.knowledgeCheck} onComplete={(r) => progress.recordQuiz(module.id, lesson.id, r.correct, r.total)} />}
          {section.id === 'practice' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-ignition-500/40 bg-surface p-6">
                <h3 className="flex items-center gap-2 text-xl font-semibold text-ink">
                  <Gauge className="size-5 text-ignition-400" aria-hidden /> Practise it in the cockpit
                </h3>
                <p className="mt-2 leading-relaxed text-ink-muted">
                  Now ride it yourself. The cockpit opens on this exact scenario — {scenario.title.toLowerCase()} — set up as in the lesson, with its steps to guide you and its mistakes explained if they happen. When you have finished, “Back to the lesson” brings you back here.
                </p>
                <Link to={practice} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-ignition-500 px-6 font-medium text-bg hover:bg-ignition-400" data-practice>
                  Practice in the Simulator <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
              {!record?.quiz && (
                <p className="text-sm text-ink-muted">
                  Haven’t done the quick check yet?{' '}
                  <button type="button" onClick={() => go(5)} className="text-ignition-400 hover:text-ignition-300">
                    Take it first
                  </button>
                  .
                </p>
              )}
            </div>
          )}
        </section>

        <div className="mt-10 flex flex-wrap justify-between gap-3">
          {at > 0 ? (
            <button type="button" onClick={() => go(at - 1)} className="flex min-h-11 items-center gap-2 rounded-xl border border-line px-4 text-sm text-ink-muted hover:text-ink">
              <ArrowLeft className="size-4" aria-hidden /> {SECTIONS[at - 1].title}
            </button>
          ) : (
            <span />
          )}
          {at < SECTIONS.length - 1 && (
            <button type="button" onClick={() => go(at + 1)} className="flex min-h-11 items-center gap-2 rounded-xl bg-surface-raised px-4 text-sm font-medium text-ink hover:bg-surface-overlay">
              Next: {SECTIONS[at + 1].title} <ArrowRight className="size-4" aria-hidden />
            </button>
          )}
        </div>

        {narrating && <NarrationBar narration={{ ...narration, stop: stopNarration }} />}

        {at === SECTIONS.length - 1 && (
          <nav aria-label="Lesson navigation" className="mt-12 grid gap-3 sm:grid-cols-2">
            <PagerLink target={previous} direction="previous" />
            <PagerLink target={next} direction="next" />
          </nav>
        )}
      </Container>
    </article>
  )
}
