import { AnatomyPreviewSection } from './home/AnatomyPreviewSection'
import { CategoriesSection } from './home/CategoriesSection'
import { CtaSection } from './home/CtaSection'
import { HeroSection } from './home/HeroSection'
import { LearningPathSection } from './home/LearningPathSection'
import { MethodSection } from './home/MethodSection'

export default function HomePage() {
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
