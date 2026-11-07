import { motion, useScroll, useSpring } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '@/components/motion/Reveal'
import { AvailabilityBadge } from '@/components/roadmap/AvailabilityBadge'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'

/** The learner's journey, in the order the skills build on each other. */
const stages: { title: string; body: string; to: string; phase: number; optional?: boolean }[] = [
  { title: 'Learn the fundamentals', body: 'What a motorcycle is, its controls, and how the engine, clutch, gears, throttle and brakes work.', to: '/learn/basics', phase: 3 },
  { title: 'Prepare to ride', body: 'Posture, protective gear and the checks that come before every ride.', to: '/learn/pre-ride', phase: 4 },
  { title: 'Your first ride', body: 'Getting on, walking the motorcycle, recovering from a stall, and the licence and gear rules before any public road.', to: '/learn/first-ride', phase: 4 },
  { title: 'Start the engine', body: 'Neutral, ignition and starter, with the crankshaft and four-stroke cycle in view.', to: '/simulators/starting', phase: 5 },
  { title: 'Master clutch & throttle', body: 'Find the biting point and pull away smoothly without stalling.', to: '/simulators/clutch-throttle', phase: 6 },
  { title: 'Change gear, ride and stop', body: 'Change up and down, hold a speed and brake progressively to a smooth stop.', to: '/simulators/gears', phase: 7 },
  { title: 'Ride real situations', body: 'Moving off, stopping, hills, traffic signals and U-turns: learn each one, watch it done, then ride it in the cockpit.', to: '/learn/riding-situations', phase: 13 },
  { title: 'Turn and handle', body: 'Lean, countersteer and control the motorcycle at walking pace.', to: '/learn/handling', phase: 9 },
  { title: 'Make safe decisions', body: 'Decide what to do in traffic, rain, on gravel, at night and in emergencies — and see what happens.', to: '/scenarios', phase: 10 },
  { title: 'Check what you know', body: 'Take the knowledge assessment, then take what you learned to a qualified instructor and a real motorcycle.', to: '/progress', phase: 12 },
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
          title={`${stages.filter((s) => !s.optional).length} stages, in the order skills build`}
          description="Each stage relies on the one before it. Understand what the machine is doing first, and the riding skills make sense."
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
