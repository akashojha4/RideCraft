import { useParams } from 'react-router-dom'
import { LessonView } from '@/components/lesson/LessonView'
import { getLesson } from '@/content/curriculum'
import { usePageTitle } from '@/hooks/usePageTitle'
import NotFoundPage from './NotFoundPage'

export default function LessonPage() {
  const { moduleId, lessonId } = useParams()
  const found = getLesson(moduleId, lessonId)
  usePageTitle(found ? `${found.lesson.title} · ${found.module.title}` : 'Page not found')
  if (!found) return <NotFoundPage />
  return <LessonView key={`${found.module.id}/${found.lesson.id}`} {...found} />
}
