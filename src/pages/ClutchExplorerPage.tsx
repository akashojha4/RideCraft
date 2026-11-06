import { ClutchExplorer } from '@/components/simulators/clutchExplorer/ClutchExplorer'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function ClutchExplorerPage() {
  usePageTitle('Clutch explorer')
  return (
    <Container className="space-y-8 py-10 sm:py-14">
      <SectionHeading
        as="h1"
        eyebrow="Mechanism explorer"
        title="Inside the clutch"
        description="Pull the lever and follow cause to effect: the release mechanism lifts the pressure plate, the clamp load on the plates falls, less torque can pass — and the engine, gearbox, chain and rear wheel respond. Compare a cable clutch with a hydraulic one, and see when the engine is driving the wheel and when the motorcycle is simply rolling on."
      />
      <ClutchExplorer />
    </Container>
  )
}
