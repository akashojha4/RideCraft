import { ArrowRight, Play, RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { Callout } from '@/components/ui/Callout'
import { Badge } from '@/components/ui/Badge'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionHeading } from '@/components/ui/SectionHeading'
import ChainDriveIllustration from '@/content/illustrations/ChainDriveIllustration'
import { lessonPath } from '@/content/curriculum'
import { fadeUp, scaleIn, spring, staggerContainer } from '@/lib/motion'

const palettes: { name: string; role: string; swatches: { token: string; className: string }[] }[] = [
  {
    name: 'Surfaces',
    role: 'Asphalt-dark layers, from sunken stages to raised overlays.',
    swatches: [
      { token: 'surface-sunken', className: 'bg-surface-sunken' },
      { token: 'bg', className: 'bg-bg' },
      { token: 'surface', className: 'bg-surface' },
      { token: 'surface-raised', className: 'bg-surface-raised' },
      { token: 'surface-overlay', className: 'bg-surface-overlay' },
      { token: 'line-strong', className: 'bg-line-strong' },
    ],
  },
  {
    name: 'Ignition',
    role: 'Rider-facing controls and primary actions — what the rider does.',
    swatches: [
      { token: 'ignition-300', className: 'bg-ignition-300' },
      { token: 'ignition-400', className: 'bg-ignition-400' },
      { token: 'ignition-500', className: 'bg-ignition-500' },
      { token: 'ignition-600', className: 'bg-ignition-600' },
      { token: 'ignition-700', className: 'bg-ignition-700' },
      { token: 'ignition-950', className: 'bg-ignition-950' },
    ],
  },
  {
    name: 'Coolant',
    role: 'Internal mechanical views — what the machine does inside.',
    swatches: [
      { token: 'coolant-300', className: 'bg-coolant-300' },
      { token: 'coolant-400', className: 'bg-coolant-400' },
      { token: 'coolant-500', className: 'bg-coolant-500' },
      { token: 'coolant-600', className: 'bg-coolant-600' },
      { token: 'coolant-950', className: 'bg-coolant-950' },
    ],
  },
  {
    name: 'Feedback',
    role: 'Correct answers, cautions and safety-critical warnings.',
    swatches: [
      { token: 'ok-500', className: 'bg-ok-500' },
      { token: 'caution-500', className: 'bg-caution-500' },
      { token: 'danger-500', className: 'bg-danger-500' },
    ],
  },
]

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-6 border-t border-line pt-10">
      <div>
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1 text-ink-muted">{description}</p>}
      </div>
      {children}
    </section>
  )
}

export default function DesignSystemPage() {
  const [replayKey, setReplayKey] = useState(0)
  const [progress, setProgress] = useState(40)

  return (
    <Container className="space-y-14 py-14 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Phase 0 · Foundation"
        title="Design system"
        description="The tokens, components and motion rules every RideCraft page and simulator is built from."
      />

      <Section title="Colour" description="Colour carries meaning: orange is the rider, cyan is the machine.">
        <div className="grid gap-6 lg:grid-cols-2">
          {palettes.map((p) => (
            <Card key={p.name} className="space-y-4 p-5">
              <div>
                <h3 className="font-display font-semibold text-ink">{p.name}</h3>
                <p className="text-sm text-ink-muted">{p.role}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {p.swatches.map((s) => (
                  <div key={s.token} className="space-y-1.5">
                    <div className={`h-12 rounded-lg border border-line ${s.className}`} />
                    <p className="truncate font-mono text-[10px] text-ink-subtle">{s.token}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Typography" description="Space Grotesk for headings, Inter for reading, JetBrains Mono for readouts and gauges.">
        <Card className="space-y-5 p-6">
          <p className="font-display text-5xl font-semibold tracking-tight text-ink">Display · Space Grotesk</p>
          <p className="font-display text-2xl font-semibold text-ink">Heading — How the clutch connects the engine</p>
          <p className="max-w-2xl text-lg leading-relaxed text-ink-muted">
            Body — Inter. When you pull the clutch lever, the pressure plate lifts away from the clutch pack and the
            friction plates stop driving the steel plates, so the engine can spin without turning the gearbox input.
          </p>
          <p className="tabular font-mono text-3xl text-coolant-300">4,250 RPM · 3rd · 42 km/h</p>
        </Card>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="coolant">Coolant</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg" trailingIcon={<ArrowRight className="size-4" />}>
            Large
          </Button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="ignition">Rider action</Badge>
          <Badge tone="coolant">Mechanical</Badge>
          <Badge tone="ok">Completed</Badge>
          <Badge tone="caution">Caution</Badge>
          <Badge tone="danger">Danger</Badge>
        </div>
      </Section>

      <Section title="Callouts" description="Used inside lessons and simulator instruction panels.">
        <div className="grid gap-3 md:grid-cols-2">
          <Callout tone="info">The starter motor turns the crankshaft through a one-way clutch until the engine fires.</Callout>
          <Callout tone="tip">Cover the clutch lever with two fingers in slow traffic so you can react quickly.</Callout>
          <Callout tone="safety">Always check the motorcycle is in neutral before pressing the starter.</Callout>
          <Callout tone="mistake">Releasing the clutch lever too quickly in first gear stalls the engine.</Callout>
        </div>
      </Section>

      <Section title="Progress">
        <Card className="space-y-4 p-6">
          <ProgressBar value={progress} label="Example progress" />
          <ProgressBar value={progress} tone="coolant" label="Example progress, coolant" />
          <ProgressBar value={progress} tone="ok" label="Example progress, ok" />
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setProgress((v) => Math.max(0, v - 20))}>
              −20
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setProgress((v) => Math.min(100, v + 20))}>
              +20
            </Button>
          </div>
        </Card>
      </Section>

      <Section
        title="Motion"
        description="UI motion uses shared durations, easings and variants. It is disabled automatically when the visitor prefers reduced motion."
      >
        <Card className="space-y-5 p-6">
          <motion.div
            key={replayKey}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            variants={staggerContainer(0.09)}
            initial="hidden"
            animate="visible"
          >
            {['fadeUp', 'scaleIn', 'fadeUp', 'scaleIn'].map((name, i) => (
              <motion.div
                key={i}
                variants={name === 'fadeUp' ? fadeUp : scaleIn}
                className="flex h-20 items-center justify-center rounded-xl border border-line bg-surface-raised font-mono text-xs text-ink-muted"
              >
                {name}
              </motion.div>
            ))}
          </motion.div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="secondary" onClick={() => setReplayKey((k) => k + 1)} leadingIcon={<RotateCcw className="size-4" />}>
              Replay stagger
            </Button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              transition={spring.snappy}
              className="inline-flex h-8 items-center gap-2 rounded-xl bg-ignition-500 px-3 text-sm font-medium text-bg"
            >
              <Play className="size-4" /> Snappy spring (tap)
            </motion.button>
          </div>
        </Card>
      </Section>

      <Section
        title="Mechanical motion · simulation clock"
        description="Mechanical animations run on a shared clock with play, pause, slow motion and reset. Every view of one simulation reads the same clock, so they stay synchronised."
      >
        <Card className="bg-blueprint p-4 sm:p-6">
          <ChainDriveIllustration />
        </Card>
      </Section>

      <Section
        title="Lesson structure"
        description="Lessons are data: concept, illustration, real-world example, key points, steps, terms, callouts and a knowledge check, rendered by one template."
      >
        <ButtonLink to={lessonPath('basics', 'what-is-a-motorcycle')} trailingIcon={<ArrowRight className="size-4" />}>
          Open a lesson
        </ButtonLink>
      </Section>
    </Container>
  )
}
