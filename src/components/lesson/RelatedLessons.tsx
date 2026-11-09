import { ArrowRight, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RelatedLesson } from '@/content/related'

/** The lessons that explain what a practice page lets you try. */
export function RelatedLessons({ lessons }: { lessons: readonly RelatedLesson[] }) {
  if (!lessons.length) return null
  return (
    <section aria-labelledby="related-lessons" className="space-y-3" data-related-lessons>
      <h2 id="related-lessons" className="text-lg font-semibold text-ink">
        Learn it in a lesson
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((l) => (
          <li key={l.path}>
            <Link to={l.path} className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm hover:border-line-strong hover:bg-surface-raised">
              <span className="flex items-center gap-2">
                <BookOpen className="size-4 shrink-0 text-ignition-400" aria-hidden />
                <span>
                  <span className="block text-ink">{l.title}</span>
                  <span className="block text-xs text-ink-subtle">{l.topic}</span>
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
