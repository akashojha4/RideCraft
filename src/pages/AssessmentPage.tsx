import { ArrowLeft, ArrowRight, CircleCheck, CircleX, ClipboardCheck, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'
import { PASS_MARK, PER_MODULE, buildAssessment } from '@/lib/progress/assessment'
import { progress } from '@/lib/progress/store'
import { usePageTitle } from '@/hooks/usePageTitle'
import { coreModules } from '@/content/curriculum'

/** The modules the assessment draws from (core modules; optional depth is left out). */
const listed = coreModules

/** The knowledge assessment: answer every question, then see the score, the breakdown and a review. */
export default function AssessmentPage() {
  usePageTitle('Knowledge assessment')
  const [seed, setSeed] = useState<number | null>(null)
  const questions = useMemo(() => (seed === null ? [] : buildAssessment(seed)), [seed])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [finished, setFinished] = useState(false)
  const modules = [...new Set(questions.map((q) => q.moduleId))]

  const start = () => {
    setSeed(Date.now())
    setIndex(0)
    setAnswers({})
    setFinished(false)
  }
  const finish = () => {
    const byModule: Record<string, { correct: number; total: number }> = {}
    for (const q of questions) {
      byModule[q.moduleId] ??= { correct: 0, total: 0 }
      byModule[q.moduleId].total++
      if (answers[q.key] === q.correctOptionId) byModule[q.moduleId].correct++
    }
    const correct = questions.filter((q) => answers[q.key] === q.correctOptionId).length
    progress.recordAssessment({ correct, total: questions.length, byModule })
    setFinished(true)
    window.scrollTo({ top: 0 })
  }

  if (seed === null) {
    return (
      <Container className="max-w-3xl space-y-8 py-14 sm:py-20">
        <Link to="/progress" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Your progress
        </Link>
        <SectionHeading as="h1" eyebrow="Knowledge assessment" title="How much do you know?" description={`Up to ${PER_MODULE} questions from each of the ${listed.length} modules — ${listed.map((m) => m.title.toLowerCase()).join(', ')} — chosen afresh each time. Answer them all, then see your score, the areas to revise and an explanation for every question.`} />
        <ul className="grid gap-3 sm:grid-cols-3">
          <li className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-muted">
            <span className="block font-display text-2xl text-ink">{PER_MODULE * listed.length}</span> questions
          </li>
          <li className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-muted">
            <span className="block font-display text-2xl text-ink">{PASS_MARK * 100} %</span> to pass
          </li>
          <li className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-muted">
            <span className="block font-display text-2xl text-ink">≈ 10</span> minutes
          </li>
        </ul>
        <Button variant="primary" onClick={start} leadingIcon={<ClipboardCheck className="size-4" />}>
          Start the assessment
        </Button>
      </Container>
    )
  }

  if (finished) {
    const correct = questions.filter((q) => answers[q.key] === q.correctOptionId).length
    const share = correct / questions.length
    const pass = share >= PASS_MARK
    return (
      <Container className="max-w-3xl space-y-8 py-14 sm:py-20">
        <SectionHeading as="h1" eyebrow="Knowledge assessment" title={pass ? 'Passed' : 'Not yet'} description={`${correct} of ${questions.length} correct (${Math.round(share * 100)} %). The pass mark is ${PASS_MARK * 100} %.`} />
        <p className={cn('inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-semibold', pass ? 'border-ok-500/40 bg-ok-950/50 text-ok-400' : 'border-caution-500/40 bg-caution-950/40 text-caution-400')} data-result={pass ? 'pass' : 'fail'}>
          {pass ? <CircleCheck className="size-4" aria-hidden /> : <CircleX className="size-4" aria-hidden />} {correct} / {questions.length}
        </p>
        <section aria-labelledby="breakdown-heading" className="space-y-3">
          <h2 id="breakdown-heading" className="text-xl font-semibold text-ink">
            By module
          </h2>
          {modules.map((id) => {
            const qs = questions.filter((q) => q.moduleId === id)
            const c = qs.filter((q) => answers[q.key] === q.correctOptionId).length
            return (
              <div key={id} className="space-y-1" data-breakdown={id}>
                <div className="flex justify-between text-sm">
                  <Link to={`/learn/${id}`} className="text-ink hover:text-ignition-300">
                    {qs[0].moduleTitle}
                  </Link>
                  <span className="tabular font-mono text-ink-muted">
                    {c} / {qs.length}
                  </span>
                </div>
                <ProgressBar value={c} max={qs.length} tone={c / qs.length >= PASS_MARK ? 'ok' : 'ignition'} label={`${qs[0].moduleTitle}: ${c} of ${qs.length}`} />
              </div>
            )
          })}
        </section>
        <section aria-labelledby="review-heading" className="space-y-3">
          <h2 id="review-heading" className="text-xl font-semibold text-ink">
            Review
          </h2>
          <ol className="space-y-3">
            {questions.map((q, i) => {
              const right = answers[q.key] === q.correctOptionId
              return (
                <li key={q.key} className="rounded-2xl border border-line bg-surface p-4 text-sm" data-review={right ? 'right' : 'wrong'}>
                  <p className="flex items-start gap-2 font-medium text-ink">
                    {right ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-ok-400" aria-label="Correct" /> : <CircleX className="mt-0.5 size-4 shrink-0 text-danger-400" aria-label="Incorrect" />}
                    {i + 1}. {q.prompt}
                  </p>
                  {!right && <p className="mt-1 text-ink-muted">Your answer: {q.options.find((o) => o.id === answers[q.key])?.label}</p>}
                  <p className="mt-1 text-ink-muted">Correct: {q.options.find((o) => o.id === q.correctOptionId)?.label}</p>
                  <p className="mt-1 text-ink-subtle">
                    {q.explanation} <span className="text-ink-subtle">— {q.lessonTitle}</span>
                  </p>
                </li>
              )
            })}
          </ol>
        </section>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={start} leadingIcon={<RotateCcw className="size-4" />}>
            Try a new set
          </Button>
          <Link to="/progress" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line px-4 text-sm text-ink-muted hover:text-ink">
            Back to your progress <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Container>
    )
  }

  const q = questions[index]
  const chosen = answers[q.key]
  const last = index === questions.length - 1
  return (
    <Container className="max-w-3xl space-y-6 py-14 sm:py-20">
      <div className="flex items-center justify-between text-sm text-ink-muted">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span>{q.moduleTitle}</span>
      </div>
      <ProgressBar value={index + (chosen ? 1 : 0)} max={questions.length} label="Assessment progress" />
      <fieldset className="space-y-3 rounded-2xl border border-line bg-surface p-5 sm:p-7">
        <legend className="mb-2 text-lg font-medium text-ink">{q.prompt}</legend>
        {q.options.map((o) => (
          <label key={o.id} className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm', chosen === o.id ? 'border-ignition-500/60 bg-ignition-950 text-ink' : 'border-line text-ink-muted hover:border-line-strong')}>
            <input type="radio" name={q.key} value={o.id} checked={chosen === o.id} onChange={() => setAnswers((a) => ({ ...a, [q.key]: o.id }))} className="mt-0.5 accent-ignition-500" />
            {o.label}
          </label>
        ))}
      </fieldset>
      <div className="flex justify-between gap-3">
        <Button variant="secondary" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} leadingIcon={<ArrowLeft className="size-4" />}>
          Back
        </Button>
        {last ? (
          <Button variant="primary" onClick={finish} disabled={!chosen || Object.keys(answers).length < questions.length}>
            See my result
          </Button>
        ) : (
          <Button variant="primary" onClick={() => setIndex((i) => i + 1)} disabled={!chosen}>
            Next question
          </Button>
        )}
      </div>
    </Container>
  )
}
