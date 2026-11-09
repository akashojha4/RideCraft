import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AppLoading } from '@/components/layout/AppLoading'
import RouteErrorPage from '@/pages/RouteErrorPage'

/** Code-split a page module whose default export is the route component. */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default })

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    // Shown while the first (code-split) route loads on initial page load.
    HydrateFallback: AppLoading,
    children: [
      { index: true, lazy: page(() => import('@/pages/HomePage')) },
      { path: 'learn', lazy: page(() => import('@/pages/LearnPage')) },
      { path: 'challenges', lazy: page(() => import('@/pages/ChallengesPage')) },
      { path: 'learn/phase/:phaseId', lazy: page(() => import('@/pages/PhasePage')) },
      { path: 'learn/:moduleId', lazy: page(() => import('@/pages/ModulePage')) },
      { path: 'learn/:moduleId/:lessonId', lazy: page(() => import('@/pages/LessonPage')) },
      { path: 'simulators', lazy: page(() => import('@/pages/SimulatorsPage')) },
      { path: 'simulators/starting', lazy: page(() => import('@/pages/StartingSimulatorPage')) },
      { path: 'simulators/cockpit', lazy: page(() => import('@/pages/RiderCockpitPage')) },
      { path: 'simulators/clutch-explorer', lazy: page(() => import('@/pages/ClutchExplorerPage')) },
      { path: 'simulators/clutch-throttle', lazy: page(() => import('@/pages/ClutchThrottleSimulatorPage')) },
      { path: 'simulators/gears', lazy: page(() => import('@/pages/GearShiftingSimulatorPage')) },
      { path: 'simulators/ride-and-stop', lazy: page(() => import('@/pages/RideStopSimulatorPage')) },
      { path: 'anatomy', lazy: page(() => import('@/pages/AnatomyPage')) },
      { path: 'scenarios', lazy: page(() => import('@/pages/ScenariosPage')) },
      { path: 'scenarios/:scenarioId', lazy: page(() => import('@/pages/ScenarioPage')) },
      { path: 'progress', lazy: page(() => import('@/pages/ProgressPage')) },
      { path: 'progress/assessment', lazy: page(() => import('@/pages/AssessmentPage')) },
      { path: 'checklist', lazy: page(() => import('@/pages/ChecklistPage')) },
      { path: 'glossary', lazy: page(() => import('@/pages/GlossaryPage')) },
      // An internal design reference: only served while developing.
      ...(import.meta.env.DEV ? [{ path: 'design-system', lazy: page(() => import('@/pages/DesignSystemPage')) }] : []),
      { path: '*', lazy: page(() => import('@/pages/NotFoundPage')) },
    ],
  },
])
