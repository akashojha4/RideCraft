import { Play } from 'lucide-react'
import type { Exercise, Topic } from '@/lib/simulation/exercises'

/** The ideas behind a simulator, each linked to the exercise that practises it. */
export function TopicCards<E extends Exercise>({ topics, exercises, onStart, onFreeRide }: { topics: Topic[]; exercises: E[]; onStart: (ex: E) => void; onFreeRide: () => void }) {
  return (
    <section aria-labelledby="topics-heading" className="space-y-4">
      <h2 id="topics-heading" className="text-2xl font-semibold text-ink">
        The ideas behind it
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {topics.map((topic) => {
          const ex = exercises.find((e) => e.id === topic.exercise)
          return (
            <li key={topic.title} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
              <h3 className="font-semibold text-ink">{topic.title}</h3>
              <p className="flex-1 text-sm leading-relaxed text-ink-muted">{topic.text}</p>
              <button type="button" onClick={ex ? () => onStart(ex) : onFreeRide} className="flex items-center gap-1.5 self-start text-sm text-ignition-400 hover:text-ignition-300">
                <Play className="size-3.5" aria-hidden /> {ex ? `Try: ${ex.title}` : 'Try it in free ride'}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
