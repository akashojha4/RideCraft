import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/**
 * Lesson illustrations, loaded on demand. Reference one from lesson content with
 * `{ type: 'illustration', illustration: '<id>' }`.
 *
 * `framed` illustrations bring their own frame, controls and status line (they are built
 * on `DiagramFrame`); the others are placed inside the lesson's blueprint frame.
 */
interface IllustrationEntry {
  component: LazyExoticComponent<ComponentType>
  framed?: boolean
}

type Loader = () => Promise<{ default: ComponentType }>
const plain = (load: Loader): IllustrationEntry => ({ component: lazy(load) })
const framed = (load: Loader): IllustrationEntry => ({ component: lazy(load), framed: true })

export const illustrations = {
  // Phase 0
  'chain-drive': plain(() => import('./ChainDriveIllustration')),
  // Phase 2 anatomy diagrams, reused
  'engine-cycle': framed(() => import('@/components/anatomy/diagrams/EngineDiagram')),
  clutch: framed(() => import('@/components/anatomy/diagrams/ClutchDiagram')),
  gearbox: framed(() => import('@/components/anatomy/diagrams/GearboxDiagram')),
  throttle: framed(() => import('@/components/anatomy/diagrams/ThrottleDiagram')),
  'front-brake': framed(() => import('@/components/anatomy/diagrams/BrakeDiagram').then((m) => ({ default: m.FrontBrakeDiagram }))),
  // Phase 3
  'systems-tour': framed(() => import('./SystemsTour')),
  'motorcycle-types': framed(() => import('./MotorcycleTypes')),
  cockpit: framed(() => import('./CockpitControls')),
  'rpm-gauge': framed(() => import('./RpmGauge')),
  'torque-lever': framed(() => import('./TorqueLever')),
  'wheel-torque': framed(() => import('./WheelTorque')),
  'gear-speed-chart': framed(() => import('./GearSpeedChart')),
  'weight-transfer': framed(() => import('./WeightTransfer')),
  'power-flow': framed(() => import('./PowerFlow')),
  // Phase 4
  'posture-check': framed(() => import('./PostureCheck')),
  'protective-gear': framed(() => import('./ProtectiveGear')),
  helmet: framed(() => import('./HelmetAnatomy')),
  'mirror-blind-spots': framed(() => import('./MirrorBlindSpots')),
  'tyre-check': framed(() => import('./TyreCheck')),
  'brake-check': framed(() => import('./BrakeCheck')),
  'chain-slack': framed(() => import('./ChainSlack')),
  'fuel-tap': framed(() => import('./FuelTap')),
  'warning-lights': framed(() => import('./WarningLights')),
  'side-stand-switch': framed(() => import('./SideStandSwitch')),
  'pre-ride-checklist': framed(() => import('@/components/checklist/PreRideChecklist').then((m) => ({ default: m.PreRideChecklist }))),
  // Phase 9
  'cornering-line': framed(() => import('./CorneringLine')),
  'lean-angle': framed(() => import('./LeanAngle')),
  countersteer: framed(() => import('./Countersteer')),
  'body-position': framed(() => import('./BodyPosition')),
  'u-turn': framed(() => import('./UTurn')),
  'junction-turn': framed(() => import('./JunctionTurn')),
  roundabout: framed(() => import('./Roundabout')),
  'slow-balance': framed(() => import('./SlowBalance')),
  'friction-circle': framed(() => import('./FrictionCircle')),
  'corner-grip': framed(() => import('./CornerGrip')),
  // Phase 11
  'valve-timing': framed(() => import('./ValveTiming')),
  'combustion-pressure': framed(() => import('./CombustionPressure')),
  'compression-ratio': framed(() => import('./CompressionRatio')),
  'torque-power': framed(() => import('./TorquePower')),
  'clutch-capacity': framed(() => import('./ClutchCapacity')),
  'shift-drum': framed(() => import('./ShiftDrum')),
  'fuel-injection': framed(() => import('./FuelInjection')),
  carburettor: framed(() => import('./Carburettor')),
  cooling: framed(() => import('./Cooling')),
  lubrication: framed(() => import('./Lubrication')),
  'abs-cycle': framed(() => import('./AbsCycle')),
  'traction-control': framed(() => import('./TractionControl')),
  'suspension-tuning': framed(() => import('./SuspensionTuning')),
  suspension: framed(() => import('@/components/anatomy/diagrams/SuspensionDiagram')),
  'tyre-slip': framed(() => import('./TyreSlip')),
  'engine-braking': framed(() => import('./EngineBrakingChart')),
} satisfies Record<string, IllustrationEntry>

export type IllustrationId = keyof typeof illustrations
