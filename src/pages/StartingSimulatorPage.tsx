import { StartingSimulator } from '@/components/simulators/starting/StartingSimulator'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RelatedLessons } from '@/components/lesson/RelatedLessons'
import { relatedLessonsForPage } from '@/content/related'

export default function StartingSimulatorPage() {
  return (
    <Container className="space-y-8 py-10 sm:py-14">
      <SectionHeading
        as="h1"
        eyebrow="Simulator 1"
        title="Starting the motorcycle"
        description="From key off to riding away in first gear. Watch each step with the rider’s controls and the machinery inside moving together — or do it yourself."
      />
      <StartingSimulator />
      <RelatedLessons lessons={relatedLessonsForPage('/simulators/starting')} />
    </Container>
  )
}
