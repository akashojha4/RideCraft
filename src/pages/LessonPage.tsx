import { useParams } from 'react-router-dom'
import { LessonView } from '@/components/lesson/LessonView'
import { SituationLessonView } from '@/components/situations/SituationLessonView'
import { getLesson } from '@/content/curriculum'
import NotFoundPage from './NotFoundPage'

export default function LessonPage() {
  const { moduleId, lessonId } = useParams()
  const found = getLesson(moduleId, lessonId)
  if (!found) return <NotFoundPage />
  // A Riding Situations lesson is taught in its own seven sections around a cockpit scenario.
  if (found.lesson.situation) return <SituationLessonView key={`${found.module.id}/${found.lesson.id}`} {...found} />
  return <LessonView key={`${found.module.id}/${found.lesson.id}`} {...found} />
}
