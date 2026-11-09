/*
 * Scenario model. A scenario is a real-world riding situation with a few possible
 * decisions. Choosing one runs the physics (the same powertrain, braking and cornering
 * models as the simulators and lessons) and returns an outcome: what the rider did, how the
 * motorcycle responded (with computed numbers), why, the safety consequence — and the
 * frames that animate it.
 */

export type Verdict = 'safe' | 'risky' | 'crash'

export interface BikePose {
  /** Metres: x across the road (right positive), y along it. In side views, y is distance and z height. */
  x: number
  y: number
  z?: number
  /** Degrees clockwise from straight ahead (up the page). */
  heading: number
  /** Lean (top views) or pitch (side views), degrees. */
  lean: number
  /** Speed, m/s. */
  v: number
  braking?: boolean
  /** The motorcycle has fallen or slid out. */
  down?: boolean
  /** Suspension compression shown in side views, m. */
  squash?: number
  indicator?: 'left' | 'right' | null
  /** Carrying a passenger. */
  pillion?: boolean
}

/** Another road user. (x, y) is the front-centre, like the motorcycle's front wheel. */
export interface Actor {
  id: string
  kind: 'car' | 'truck' | 'dog' | 'tractor' | 'person'
  x: number
  y: number
  heading: number
  braking?: boolean
  indicator?: 'left' | 'right' | null
  /** Hidden in the dark until the headlight reaches it. */
  unlit?: boolean
}

export interface Frame {
  t: number
  bike: BikePose
  actors: Actor[]
  signal?: 'green' | 'amber' | 'red'
  /** Headlight reach at night, m. */
  beam?: number
  /** Short caption for this moment of the animation. */
  caption?: string
}

export interface Metric {
  label: string
  value: string
  tone?: 'ok' | 'caution' | 'danger' | 'ink'
}

export interface Outcome {
  verdict: Verdict
  /** What the rider does. */
  rider: string
  /** How the motorcycle responds, with numbers from the model. */
  motorcycle: string
  /** Why it turns out this way. */
  explanation: string
  /** What it means for safety. */
  consequence: string
  metrics: Metric[]
  frames: Frame[]
}

export interface Choice {
  id: string
  label: string
}

export type SceneFeature =
  | { type: 'stopLine'; y: number; x0: number; x1: number }
  | { type: 'signal'; y: number; x: number }
  | { type: 'crossRoad'; y: number; width: number }
  | { type: 'pothole'; x: number; y: number; r: number }
  | { type: 'patch'; kind: 'gravel' | 'oil'; points: { x: number; y: number }[] }
  | { type: 'sign'; x: number; y: number; text: string }

/** A top view: a road (straight or curved centre line) with lanes and features. */
export interface TopScene {
  view: 'top'
  /** Road centre line, m. */
  road: { x: number; y: number }[]
  /** Road edges as offsets from the centre line (left negative), and lane-divider offsets. */
  edges: [number, number]
  dividers: { offset: number; style: 'dashed' | 'solid' }[]
  features?: SceneFeature[]
  weather?: 'rain' | 'night' | null
  /** Headlight reach at night, m (taken from the frame's beam if it varies). */
  beam?: number
  /** Metres shown across the view. */
  span?: number
}

/** A side view: a road profile (height against distance). */
export interface SideScene {
  view: 'side'
  /** Road height at distance d, m. */
  profile: (d: number) => number
  from: number
  to: number
  /** Metres shown across the view. */
  span?: number
  /** Heights drawn this many times larger than lengths (1 = true scale). */
  exaggerate?: number
  labels?: { d: number; text: string }[]
}

export interface Scenario {
  id: string
  number: number
  title: string
  summary: string
  /** What the rider sees and has to decide. */
  situation: string
  question: string
  scene: TopScene | SideScene
  choices: Choice[]
  /** Frames shown before a choice is made (the situation developing). */
  intro: Frame[]
  run: (choiceId: string) => Outcome
  /** One-line lesson to remember. */
  takeaway: string
}
