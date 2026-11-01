import { ArrowRight, Gauge, ListChecks, ScanLine } from 'lucide-react'
import { AnimatePresence, motion, useInView, useReducedMotion, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { MotorcycleSideView, type MotorcycleMode } from '@/components/motorcycle/MotorcycleSideView'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/SectionHeading'
import { useSimulationClock } from '@/hooks/useSimulationClock'
import { cn } from '@/lib/cn'
import { fadeUp, staggerContainer, transition } from '@/lib/motion'

/** Ambient roll speed of the hero motorcycle: a quarter wheel turn per second. */
const WHEEL_DEG_PER_SEC = 90

const modes: { id: MotorcycleMode; label: string; legend: string }[] = [
  {
    id: 'plain',
    label: 'Exterior',
    legend: 'A single-cylinder, chain-driven geared motorcycle — the kind most riders learn on.',
  },
  {
    id: 'rider',
    label: 'Rider controls',
    legend: 'Orange marks what you operate: clutch lever, throttle, front brake lever, gear lever and rear brake pedal.',
  },
  {
    id: 'mechanical',
    label: 'Mechanical',
    legend: 'Cyan reveals what moves inside: piston, connecting rod, crankshaft, clutch and gearbox.',
  },
]

const features = [
  { icon: ScanLine, text: 'Rider and mechanical views, side by side' },
  { icon: Gauge, text: 'Simulations you can pause and slow down' },
  { icon: ListChecks, text: 'A knowledge check after every lesson' },
]

export function HeroSection() {
  const [mode, setMode] = useState<MotorcycleMode>('plain')
  const reduceMotion = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const inView = useInView(stageRef)
  const clock = useSimulationClock()
  const wheelAngle = useTransform(clock.time, (t) => -t * WHEEL_DEG_PER_SEC)
  const { play, pause } = clock

  // Roll only while visible, and never when the visitor prefers reduced motion.
  useEffect(() => {
    if (inView && !reduceMotion) play()
    else pause()
  }, [inView, reduceMotion, play, pause])

  const active = modes.find((m) => m.id === mode)!

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="bg-blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_70%_40%,black,transparent)]"
      />
      <div
        aria-hidden
        className="absolute -top-40 right-0 size-[640px] rounded-full bg-ignition-500/10 blur-[120px]"
      />
      <Container className="relative grid items-center gap-12 pt-10 pb-16 sm:pt-16 lg:grid-cols-[5fr_7fr] lg:gap-10 lg:pt-20 lg:pb-24">
        <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="visible" className="space-y-7">
          <motion.div variants={fadeUp}>
            <Eyebrow>Interactive motorcycle academy</Eyebrow>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-[2.6rem] leading-[1.05] font-semibold text-ink sm:text-6xl">
            Understand the machine.
            <span className="block text-ignition-500">Then learn to ride it.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="max-w-xl text-lg text-ink-muted">
            MotoLab teaches how a geared motorcycle works and how to ride one. Every control you touch is linked to what
            happens inside the engine, clutch, gearbox and drivetrain.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/learn" size="lg" trailingIcon={<ArrowRight className="size-4" />}>
              Start learning
            </ButtonLink>
            <ButtonLink to="/anatomy" size="lg" variant="secondary">
              Explore the anatomy
            </ButtonLink>
          </motion.div>
          <motion.ul variants={fadeUp} className="space-y-2.5 pt-2">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-ink-muted">
                <span className="flex size-7 items-center justify-center rounded-lg border border-line bg-surface">
                  <Icon className="size-3.5 text-ignition-400" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          ref={stageRef}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...transition.slow, delay: 0.15 }}
          className="relative rounded-3xl border border-line bg-surface-sunken/80 p-3 shadow-card backdrop-blur sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <p className="font-mono text-[11px] tracking-[0.16em] text-ink-subtle uppercase">Left side view</p>
            <div role="group" aria-label="Motorcycle view" className="flex rounded-xl border border-line bg-bg p-0.5">
              {modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    'relative h-8 rounded-[10px] px-2.5 text-xs font-medium transition-colors sm:px-3',
                    mode === m.id ? 'text-ink' : 'text-ink-subtle hover:text-ink',
                  )}
                >
                  {mode === m.id && (
                    <motion.span
                      layoutId="hero-mode"
                      className={cn(
                        'absolute inset-0 rounded-[10px] border',
                        m.id === 'rider' && 'border-ignition-500/40 bg-ignition-950',
                        m.id === 'mechanical' && 'border-coolant-500/40 bg-coolant-950',
                        m.id === 'plain' && 'border-line bg-surface-overlay',
                      )}
                      transition={transition.base}
                    />
                  )}
                  <span className="relative">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <MotorcycleSideView mode={mode} wheelAngle={wheelAngle} className="mt-2" />

          <div className="min-h-12 px-1" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={active.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={transition.base}
                className={cn(
                  'text-sm',
                  active.id === 'rider' && 'text-ignition-300',
                  active.id === 'mechanical' && 'text-coolant-300',
                  active.id === 'plain' && 'text-ink-muted',
                )}
              >
                {active.legend}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
