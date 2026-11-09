import { motion, useScroll, useSpring } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '@/components/motion/Reveal'
import { AvailabilityBadge } from '@/components/roadmap/AvailabilityBadge'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { academyPhases, phasePath } from '@/content/academy'
import { cn } from '@/lib/cn'

/** The learner's journey: the eight academy phases, then practice and a knowledge check. */
const stages: { title: string; body: string; to: string; phase: number; optional?: boolean }[] = [
  ...academyPhases.map((p) => ({ title: p.title, body: p.goal, to: phasePath(p.id), phase: 3 })),
  { title: 'Decide on the road', body: 'Play the same situations as decisions, then watch a careful rider in the cockpit.', to: '/scenarios', phase: 10 },
  { title: 'Practical challenges', body: 'Yard exercises to rehearse here, and the ones that still need a real motorcycle.', to: '/challenges', phase: 10 },
  { title: 'Check what you know', body: 'A knowledge test only. Real competence still needs an instructor and a motorcycle.', to: '/progress', phase: 12 },
  { title: 'Go deeper into the machine', body: 'Optional: combustion, fuel systems, cooling, ABS, traction control, suspension and tyres.', to: '/learn/mechanics', phase: 11, optional: true },
]

export function LearningPathSection() {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Your learning path"
          title="Eight phases, then practice"
          description="The same order as Learn: machine, kit, first contact, yard, stops, traffic, roadcraft. Then decisions, challenges, and a knowledge check."
          align="center"
          className="mx-auto"
        />

        <ol ref={ref} className="relative mx-auto mt-14 max-w-4xl">
          {/* Track and scroll-linked fill */}
          <div aria-hidden className="absolute top-2 bottom-2 left-5 w-px bg-line md:left-1/2" />
          <motion.div
            aria-hidden
            className="absolute top-2 bottom-2 left-5 w-px origin-top bg-ignition-500 md:left-1/2"
            style={{ scaleY: progress }}
          />

          {stages.map((stage, i) => {
            const right = i % 2 === 1
            return (
              <li key={stage.title} className="relative pb-8 pl-14 last:pb-0 md:grid md:grid-cols-2 md:gap-12 md:pl-0">
                <span
                  aria-hidden
                  className="tabular absolute top-0 left-0 flex size-10 items-center justify-center rounded-full border border-line-strong bg-bg font-mono text-sm text-ink md:left-1/2 md:-translate-x-1/2"
                >
                  {stage.optional ? '+' : String(i + 1).padStart(2, '0')}
                </span>
                <Reveal className={cn(right ? 'md:col-start-2' : 'md:col-start-1 md:text-right')}>
                  <Link
                    to={stage.to}
                    className="group block rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong hover:bg-surface-raised"
                  >
                    <div className={cn('mb-2 flex items-center gap-3', !right && 'md:flex-row-reverse')}>
                      <h3 className="font-display text-lg font-semibold text-ink group-hover:text-ignition-300">{stage.title}</h3>
                      <AvailabilityBadge phase={stage.phase} />
                    </div>
                    <p className="text-sm leading-relaxed text-ink-muted">{stage.body}</p>
                  </Link>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </Container>
    </section>
  )
}
