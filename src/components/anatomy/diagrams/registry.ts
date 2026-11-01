import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { PartId } from '@/components/motorcycle/parts'

/** Interactive "inside the component" diagrams, loaded on demand. */
export const anatomyDiagrams: Partial<Record<PartId, LazyExoticComponent<ComponentType>>> = {
  engine: lazy(() => import('./EngineDiagram')),
  clutch: lazy(() => import('./ClutchDiagram')),
  gearbox: lazy(() => import('./GearboxDiagram')),
  throttle: lazy(() => import('./ThrottleDiagram')),
  'front-brake': lazy(() => import('./BrakeDiagram').then((m) => ({ default: m.FrontBrakeDiagram }))),
  'rear-brake': lazy(() => import('./BrakeDiagram').then((m) => ({ default: m.RearBrakeDiagram }))),
  chain: lazy(() => import('./ChainDiagram')),
  wheels: lazy(() => import('./WheelsDiagram')),
  suspension: lazy(() => import('./SuspensionDiagram')),
  exhaust: lazy(() => import('./ExhaustDiagram')),
}
