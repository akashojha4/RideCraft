import { PreRideChecklist } from '@/components/checklist/PreRideChecklist'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { RelatedLessons } from '@/components/lesson/RelatedLessons'
import { relatedLessonsForPage } from '@/content/related'

/** Standalone pre-ride checklist, for use next to the motorcycle before a ride. */
export default function ChecklistPage() {
  return (
    <Container className="space-y-8 py-10 sm:py-14">
      <SectionHeading
        as="h1"
        eyebrow="Before every ride"
        title="Pre-ride checklist"
        description="Walk around the motorcycle and mark each item OK or Problem. It takes about five minutes — and catches the faults that cause breakdowns and crashes."
      />
      <PreRideChecklist headingLevel={2} />
      <RelatedLessons lessons={relatedLessonsForPage('/checklist')} />
    </Container>
  )
}
