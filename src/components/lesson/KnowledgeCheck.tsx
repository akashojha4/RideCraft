import { CheckCircle2, RotateCcw, Trophy, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { QuizQuestion } from '@/content/types'
import { cn } from '@/lib/cn'
import { fadeUp } from '@/lib/motion'

export interface KnowledgeCheckResult {
  correct: number
  total: number
}

/**
 * One-question-at-a-time quiz: choose → check → read the explanation → continue.
 * `onComplete` fires once all questions are answered (used by progress tracking later).
 */
export function KnowledgeCheck({
  questions,
  onComplete,
  id,
}: {
  questions: QuizQuestion[]
  onComplete?: (result: KnowledgeCheckResult) => void
  id?: string
}) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = questions[index]
  const isCorrect = checked && selected === question?.correctOptionId
  const isLast = index === questions.length - 1

  function check() {
    if (!selected) return
    setChecked(true)
    if (selected === question.correctOptionId) setCorrectCount((c) => c + 1)
  }

  function next() {
    if (isLast) {
      setFinished(true)
      onComplete?.({ correct: correctCount, total: questions.length })
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setChecked(false)
  }

  function restart() {
    setIndex(0)
    setSelected(null)
    setChecked(false)
    setCorrectCount(0)
    setFinished(false)
  }

  return (
    <section
      id={id}
      aria-labelledby={id && `${id}-title`}
      className="scroll-mt-24 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-7"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id={id && `${id}-title`} className="text-xl font-semibold text-ink">
          Knowledge check
        </h2>
        {!finished && (
          <span className="tabular font-mono text-xs text-ink-subtle">
            {index + 1} / {questions.length}
          </span>
        )}
      </div>
      <ProgressBar
        value={finished ? questions.length : index + (checked ? 1 : 0)}
        max={questions.length}
        label="Knowledge check progress"
        className="mb-6"
      />

      <AnimatePresence mode="wait" initial={false}>
        {finished ? (
          <motion.div key="result" variants={fadeUp} initial="hidden" animate="visible" className="space-y-4 text-center">
            <Trophy
              className={cn('mx-auto size-10', correctCount === questions.length ? 'text-ok-400' : 'text-caution-400')}
              aria-hidden
            />
            <p className="font-display text-2xl font-semibold text-ink">
              {correctCount} of {questions.length} correct
            </p>
            <p className="text-ink-muted">
              {correctCount === questions.length
                ? 'Every answer correct — you have this concept.'
                : 'Review the explanations above, then try again.'}
            </p>
            <Button variant="secondary" onClick={restart} leadingIcon={<RotateCcw className="size-4" />}>
              Try again
            </Button>
          </motion.div>
        ) : (
          <motion.fieldset key={question.id} variants={fadeUp} initial="hidden" animate="visible" exit="hidden">
            <legend className="mb-4 text-base font-medium text-ink sm:text-lg">{question.prompt}</legend>
            <div className="space-y-2.5">
              {question.options.map((option) => {
                const chosen = selected === option.id
                const isAnswer = option.id === question.correctOptionId
                return (
                  <label
                    key={option.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                      'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ignition-400',
                      !checked && (chosen ? 'border-ignition-500 bg-ignition-950/60' : 'border-line hover:border-line-strong hover:bg-surface-raised'),
                      checked && isAnswer && 'border-ok-500/60 bg-ok-950/70',
                      checked && chosen && !isAnswer && 'border-danger-500/60 bg-danger-950/70',
                      checked && !chosen && !isAnswer && 'border-line opacity-60',
                      checked && 'cursor-default',
                    )}
                  >
                    <input
                      type="radio"
                      name={`q-${question.id}`}
                      value={option.id}
                      checked={chosen}
                      disabled={checked}
                      onChange={() => setSelected(option.id)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center rounded-full border',
                        chosen ? 'border-ignition-400' : 'border-line-strong',
                      )}
                    >
                      {chosen && <span className="size-2 rounded-full bg-ignition-400" />}
                    </span>
                    <span className="flex-1 text-ink">{option.label}</span>
                    {checked && isAnswer && <CheckCircle2 className="size-5 text-ok-400" aria-label="Correct answer" />}
                    {checked && chosen && !isAnswer && <XCircle className="size-5 text-danger-400" aria-label="Your answer" />}
                  </label>
                )
              })}
            </div>

            <div aria-live="polite">
              {checked && (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className={cn(
                    'mt-5 rounded-xl border p-4',
                    isCorrect ? 'border-ok-500/30 bg-ok-950/50' : 'border-danger-500/30 bg-danger-950/50',
                  )}
                >
                  <p className={cn('mb-1 font-semibold', isCorrect ? 'text-ok-400' : 'text-danger-400')}>
                    {isCorrect ? 'Correct' : 'Not quite'}
                  </p>
                  <p className="text-sm leading-relaxed text-ink-muted">{question.explanation}</p>
                </motion.div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              {checked ? (
                <Button className="h-11" onClick={next}>{isLast ? 'See result' : 'Next question'}</Button>
              ) : (
                <Button className="h-11" onClick={check} disabled={!selected}>
                  Check answer
                </Button>
              )}
            </div>
          </motion.fieldset>
        )}
      </AnimatePresence>
    </section>
  )
}
