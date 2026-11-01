import { AnatomyPreviewSection } from './home/AnatomyPreviewSection'
import { CategoriesSection } from './home/CategoriesSection'
import { CtaSection } from './home/CtaSection'
import { HeroSection } from './home/HeroSection'
import { LearningPathSection } from './home/LearningPathSection'
import { MethodSection } from './home/MethodSection'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function HomePage() {
  usePageTitle()
  return (
    <>
      <HeroSection />
      <MethodSection />
      <CategoriesSection />
      <AnatomyPreviewSection />
      <LearningPathSection />
      <CtaSection />
    </>
  )
}
