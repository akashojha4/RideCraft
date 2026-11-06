import { ArrowLeft, ArrowRight, ChevronRight, Clock, Target } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '@/components/motion/Reveal'
import { Container } from '@/components/ui/Container'
import { lessonPath } from '@/content/curriculum'
import type { LearningModule, Lesson, LessonBlock as Block } from '@/content/types'
import { cn } from '@/lib/cn'
import { progress } from '@/lib/progress/store'
import { KnowledgeCheck } from './KnowledgeCheck'
import { LessonBlock } from './LessonBlock'

const QUIZ_ANCHOR = 'knowledge-check'

/** The heading a block contributes to the lesson outline, if any. */
function blockHeading(block: Block): string | undefined {
  if (block.type === 'example') return block.heading ?? 'Real-world example'
  return 'heading' in block ? block.heading : undefined
}

function slug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/** The standard lesson page: header, objectives, content blocks, outline, quiz and pager. */
export function LessonView({
  module,
  lesson,
  index,
  previous,
  next,
}: {
  module: LearningModule
  lesson: Lesson
  index: number
  previous?: Lesson
  next?: Lesson
}) {
  const outline = lesson.blocks
    .map((block, i) => {
      const heading = blockHeading(block)
      return heading ? { heading, id: `${slug(heading)}-${i}`, blockIndex: i } : null
    })
    .filter((x) => x !== null)
  const anchorFor = (i: number) => outline.find((o) => o.blockIndex === i)?.id
  useEffect(() => progress.visitLesson(module.id, lesson.id), [module.id, lesson.id])

  return (
    <article className="pt-8 pb-8 sm:pt-12">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-subtle">
            <li>
              <Link to="/learn" className="hover:text-ink">
                Learn
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li>
              <Link to={`/learn/${module.id}`} className="hover:text-ink">
                {module.title}
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li aria-current="page" className="text-ink-muted">
              Lesson {index + 1}
            </li>
          </ol>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="min-w-0 max-w-3xl">
            <Reveal className="mb-10 space-y-4">
              <p className="tabular font-mono text-xs tracking-[0.18em] text-ignition-400 uppercase">
                Lesson {index + 1} of {module.lessons.length}
              </p>
              <h1 className="text-3xl font-semibold text-ink sm:text-4xl">{lesson.title}</h1>
              <p className="text-lg text-ink-muted">{lesson.summary}</p>
              <p className="flex items-center gap-1.5 text-sm text-ink-subtle">
                <Clock className="size-4" aria-hidden /> {lesson.durationMinutes} min
              </p>
            </Reveal>

            <Reveal className="mb-12 rounded-2xl border border-line bg-surface p-5">
              <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-ink">
                <Target className="size-4 text-ignition-400" aria-hidden /> In this lesson you will
              </h2>
              <ul className="list-disc space-y-1.5 pl-5 text-ink-muted marker:text-ink-subtle">
                {lesson.objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </Reveal>

            <div className="space-y-10">
              {lesson.blocks.map((block, i) => (
                <Reveal key={i}>
                  <LessonBlock block={block} anchorId={anchorFor(i)} />
                </Reveal>
              ))}
            </div>

            <div className="mt-14">
              {/* Keyed by lesson so quiz state resets when moving between lessons. */}
              <KnowledgeCheck key={`${module.id}/${lesson.id}`} id={QUIZ_ANCHOR} questions={lesson.knowledgeCheck} onComplete={(r) => progress.recordQuiz(module.id, lesson.id, r.correct, r.total)} />
            </div>

            <nav aria-label="Lesson navigation" className="mt-12 grid gap-3 sm:grid-cols-2">
              <PagerLink module={module} lesson={previous} direction="previous" />
              <PagerLink module={module} lesson={next} direction="next" />
            </nav>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-3">
              <p className="font-mono text-xs tracking-[0.18em] text-ink-subtle uppercase">Outline</p>
              <ul className="space-y-1 border-l border-line text-sm">
                {outline.map((o) => (
                  <li key={o.id}>
                    <a href={`#${o.id}`} className="-ml-px block border-l border-transparent py-1 pl-3 text-ink-muted hover:border-ink-muted hover:text-ink">
                      {o.heading}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={`#${QUIZ_ANCHOR}`} className="-ml-px block border-l border-transparent py-1 pl-3 text-ignition-300 hover:border-ignition-400">
                    Knowledge check
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </article>
  )
}

export function PagerLink({
  module,
  lesson,
  direction,
}: {
  module: LearningModule
  lesson?: Lesson
  direction: 'previous' | 'next'
}) {
  const isNext = direction === 'next'
  const to = lesson ? lessonPath(module.id, lesson.id) : `/learn/${module.id}`
  const label = lesson ? lesson.title : isNext ? 'Back to module overview' : 'Module overview'

  return (
    <Link
      to={to}
      className={cn(
        'group flex flex-col gap-1 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-raised',
        isNext && 'sm:col-start-2 sm:items-end sm:text-right',
      )}
    >
      <span className="flex items-center gap-1.5 text-xs text-ink-subtle">
        {!isNext && <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />}
        {lesson ? (isNext ? 'Next lesson' : 'Previous lesson') : 'Module'}
        {isNext && <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />}
      </span>
      <span className="font-medium text-ink">{label}</span>
    </Link>
  )
}
