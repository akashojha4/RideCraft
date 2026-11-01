import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { createContext, useContext, useId, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { beltPath, pitchRadius, polar, sprocketPath } from '@/lib/geometry'
import { cn } from '@/lib/cn'
import { partOrder, parts, type PartId } from './parts'

/*
 * Side view of a single-cylinder geared commuter motorcycle, LEFT side, facing left.
 * See parts.ts for which components are near side and which are drawn as far side.
 *
 * Layout (viewBox units, ground at y = 440). Wheelbase 420 and wheel diameter 176 keep
 * real-world proportions (≈1300 mm wheelbase, ≈ 560 mm wheel).
 *
 * Kinematics, when `wheelAngle` is supplied:
 *   - both wheels turn by the same angle (same diameter);
 *   - the rear sprocket is bolted to the rear wheel, so turns with it;
 *   - the chain moves at the rear sprocket's pitch-line speed;
 *   - the front sprocket turns 45/15 = 3× as fast as the rear;
 *   - the ground moves past at the tyre's surface speed.
 */

const GROUND_Y = 440
const TYRE_R = 88
const FRONT_AXLE = { x: 180, y: 352 }
const REAR_AXLE = { x: 600, y: 352 }
const CRANK = { x: 395, y: 318 }
const MAINSHAFT = { x: 437, y: 314 }
const COUNTERSHAFT = { x: 465, y: 330 }
const SWINGARM_PIVOT = { x: 492, y: 318 }
/** Forward inclination of the cylinder, degrees. */
const CYLINDER_TILT = -20

const FRONT_TEETH = 15
const REAR_TEETH = 45
const REAR_SPROCKET_R = 40
const CHAIN_PITCH = (2 * Math.PI * REAR_SPROCKET_R) / REAR_TEETH
const FRONT_SPROCKET = { ...COUNTERSHAFT, r: pitchRadius(FRONT_TEETH, CHAIN_PITCH) }
const REAR_SPROCKET = { ...REAR_AXLE, r: REAR_SPROCKET_R }
const CHAIN = beltPath(FRONT_SPROCKET, REAR_SPROCKET)
const REAR_SPROCKET_PATH = sprocketPath(REAR_TEETH, REAR_SPROCKET_R, 1.8, 2.2)
const FRONT_SPROCKET_PATH = sprocketPath(FRONT_TEETH, FRONT_SPROCKET.r, 1.8, 2.2)

/** Static crank angle used for the x-ray piston/connecting-rod drawing. */
const CRANK_ANGLE = 40
const CRANK_THROW = 20
const ROD_LENGTH = 60

export type MotorcycleMode = 'plain' | 'rider' | 'mechanical'

interface Ctx {
  highlighted: readonly PartId[]
  selected: PartId | null
  uid: string
  onPartHover?: (id: PartId | null) => void
  onPartSelect?: (id: PartId) => void
  /** Pointer pressed on a part / released on a part (release on the pressed part selects it). */
  onPress?: (id: PartId) => void
  onRelease?: (id: PartId) => void
}
const PartContext = createContext<Ctx>({ highlighted: [], selected: null, uid: '' })

/**
 * Pointer handlers shared by part groups and their enlarged hit areas.
 *
 * Selection happens on pointer-up over the part the press started on, rather than on
 * `click`: on touch screens the hover re-render between press and release makes the
 * browser retarget the synthesised click to the <svg>. A scroll gesture ends in
 * pointercancel, so scrolling over the drawing does not select anything.
 */
function usePartHandlers(id: PartId | undefined) {
  const { onPartHover, onPartSelect, onPress, onRelease } = useContext(PartContext)
  if (!id || (!onPartHover && !onPartSelect)) return {}
  return {
    onPointerEnter: () => onPartHover?.(id),
    onPointerLeave: () => onPartHover?.(null),
    onPointerDown: () => onPress?.(id),
    onPointerUp: () => onRelease?.(id),
  }
}

/**
 * Groups the shapes that make up one component so it can be highlighted as a whole.
 * A component drawn in several places has several groups; exactly one is `primary` and
 * represents it to assistive technology as an option of the selectable drawing.
 */
function Part({ id, primary = false, children }: { id?: PartId; primary?: boolean; children: ReactNode }) {
  const { highlighted, selected, uid, onPartSelect } = useContext(PartContext)
  const handlers = usePartHandlers(id)
  const option = id && primary && onPartSelect
  return (
    <g
      data-part={id}
      className={cn('moto-part', id && highlighted.includes(id) && 'is-active', 'onPointerUp' in handlers && 'cursor-pointer')}
      {...handlers}
      {...(option && {
        id: `${uid}-${id}`,
        role: 'option',
        'aria-selected': selected === id,
        'aria-label': parts[id].name,
      })}
    >
      {children}
    </g>
  )
}

/** Invisible, enlarged pointer target for a small part (levers, pedals, pegs…). */
function HitArea({ id, d, width = 8 }: { id: PartId; d: string; width?: number }) {
  const handlers = usePartHandlers(id)
  return (
    <path
      d={d}
      data-hit={id}
      fill="none"
      stroke="transparent"
      strokeWidth={width}
      pointerEvents="stroke"
      className="moto-keep cursor-pointer"
      {...handlers}
    />
  )
}

const shell = 'fill-surface-raised stroke-line-strong'
const tube = 'stroke-line-strong'
const chrome = 'stroke-ink-subtle'
const control = 'moto-control stroke-ink-muted'

function Wheel({ x, y, angle }: { x: number; y: number; angle: MotionValue<number> }) {
  return (
    <motion.g style={{ x, y, rotate: angle }}>
      {/* Tyre */}
      <circle r={79} fill="none" strokeWidth={18} className="moto-keep stroke-surface-sunken" />
      <circle r={TYRE_R} fill="none" className="stroke-line-strong" />
      <circle r={84} fill="none" strokeWidth={2.5} strokeDasharray="3 9" className="stroke-line" />
      {/* Rim */}
      <circle r={70} fill="none" className="stroke-line-strong" />
      <circle r={66} fill="none" strokeWidth={3} className="stroke-ink-subtle" />
      {/* Five cast spokes */}
      {[0, 72, 144, 216, 288].map((a) => {
        const p = polar(0, 0, 64, a)
        const q = polar(0, 0, 16, a)
        return <line key={a} x1={q.x} y1={q.y} x2={p.x} y2={p.y} strokeWidth={5} className="stroke-line-strong" />
      })}
      <circle r={16} className="fill-surface-overlay stroke-line-strong" />
      <circle r={5} className="fill-bg stroke-ink-subtle" />
    </motion.g>
  )
}

function BrakeDisc({ r, angle, x, y }: { r: number; angle: MotionValue<number>; x: number; y: number }) {
  return (
    <motion.g style={{ x, y, rotate: angle }}>
      <circle r={r} fill="none" strokeWidth={2} className="stroke-ink-subtle" />
      <circle r={r - 8} fill="none" className="stroke-line-strong" />
      <circle r={r - 20} fill="none" className="stroke-line-strong" />
      {Array.from({ length: 10 }, (_, i) => {
        const p = polar(0, 0, r - 4, i * 36)
        return <circle key={i} cx={p.x} cy={p.y} r={1.8} className="fill-bg stroke-line-strong" />
      })}
    </motion.g>
  )
}

export function MotorcycleSideView({
  highlighted = null,
  selected = null,
  mode = 'plain',
  wheelAngle,
  frontWheelAngle,
  roadAngle,
  onPartHover,
  onPartSelect,
  navOrder = partOrder,
  showGround = true,
  className,
  title = 'Side view of a single-cylinder geared motorcycle',
}: {
  /** Part(s) drawn highlighted (e.g. hovered or selected, or a whole system). */
  highlighted?: PartId | readonly PartId[] | null
  /** Part reported as selected to assistive technology when `onPartSelect` is set. */
  selected?: PartId | null
  mode?: MotorcycleMode
  /** Wheel rotation in degrees, clockwise positive. Rolling forward (to the left) is negative. */
  wheelAngle?: MotionValue<number>
  /** Front wheel rotation when it differs from the rear (a locked wheel); defaults to `wheelAngle`. */
  frontWheelAngle?: MotionValue<number>
  /** Road travel as an equivalent wheel angle, for the moving ground; defaults to `wheelAngle`. */
  roadAngle?: MotionValue<number>
  onPartHover?: (id: PartId | null) => void
  /** Makes the drawing a selectable listbox: click a part, or focus it and use arrow keys. */
  onPartSelect?: (id: PartId) => void
  /** Arrow-key order of parts. */
  navOrder?: readonly PartId[]
  showGround?: boolean
  className?: string
  title?: string
}) {
  const uid = useId().replace(/:/g, '')
  const highlightedParts: readonly PartId[] = highlighted == null ? [] : typeof highlighted === 'string' ? [highlighted] : highlighted
  const pressed = useRef<PartId | null>(null)
  const onPress = (id: PartId) => {
    pressed.current = id
  }
  const onRelease = (id: PartId) => {
    if (pressed.current === id) onPartSelect?.(id)
    pressed.current = null
  }
  const interactive = Boolean(onPartHover || onPartSelect)

  function onKeyDown(e: KeyboardEvent<SVGSVGElement>) {
    if (!onPartSelect) return
    const i = selected ? navOrder.indexOf(selected) : -1
    const n = navOrder.length
    const next = {
      ArrowRight: (i + 1) % n,
      ArrowDown: (i + 1) % n,
      ArrowLeft: (i - 1 + n) % n,
      ArrowUp: (i - 1 + n) % n,
      Home: 0,
      End: n - 1,
    }[e.key]
    if (next === undefined) return
    e.preventDefault()
    onPartSelect(navOrder[next])
  }

  const still = useMotionValue(0)
  const wheel = wheelAngle ?? still
  const frontSprocket = useTransform(wheel, (d) => (d * REAR_TEETH) / FRONT_TEETH)
  const chainOffset = useTransform(wheel, (d) => -((d * Math.PI) / 180) * REAR_SPROCKET_R)
  const frontWheel = frontWheelAngle ?? wheel
  const groundOffset = useTransform(roadAngle ?? wheel, (d) => ((d * Math.PI) / 180) * TYRE_R)

  // Slider-crank geometry for the x-ray piston (local cylinder coordinates, up = −y).
  const theta = (CRANK_ANGLE * Math.PI) / 180
  const crankPin = { x: CRANK_THROW * Math.sin(theta), y: -CRANK_THROW * Math.cos(theta) }
  const pistonPinY = -(CRANK_THROW * Math.cos(theta) + Math.sqrt(ROD_LENGTH ** 2 - crankPin.x ** 2))

  const caliper = polar(FRONT_AXLE.x, FRONT_AXLE.y, 46, -62)
  const rearCaliper = polar(REAR_AXLE.x, REAR_AXLE.y, 42, 40)

  return (
    <PartContext.Provider value={{ highlighted: highlightedParts, selected, uid, onPartHover, onPartSelect, onPress, onRelease }}>
      <svg
        viewBox="60 60 690 394"
        aria-label={title}
        className={cn('moto w-full', `moto-mode-${mode}`, highlightedParts.length > 0 && 'moto-dim', className)}
        {...(onPartSelect
          ? {
              role: 'listbox',
              tabIndex: 0,
              'aria-activedescendant': selected ? `${uid}-${selected}` : undefined,
              onKeyDown,
              // Focus without the browser's scroll-into-view, which would cancel any
              // scrolling the host page starts in response to the selection.
              onMouseDown: (e: MouseEvent<SVGSVGElement>) => {
                e.preventDefault()
                e.currentTarget.focus({ preventScroll: true })
              },
            }
          : { role: 'img' })}
      >
        <g strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
          {showGround && (
            <motion.line
              x1={0}
              x2={800}
              y1={GROUND_Y}
              y2={GROUND_Y}
              strokeWidth={2}
              strokeDasharray="28 14"
              className="stroke-line-strong"
              style={{ strokeDashoffset: groundOffset }}
            />
          )}

          {/* ---------- Far side (right-hand) components, drawn first and dimmed ---------- */}
          <Part id="exhaust">
            <g className="moto-far">
              <path
                d="M520,382 L652,322 C668,315 684,320 689,332 C694,344 688,352 676,357 L544,402 C530,407 516,396 520,382 Z"
                className={shell}
              />
              <path d="M676,328 L690,322" strokeWidth={4} className={chrome} />
            </g>
          </Part>
          <Part id="rear-brake" primary>
            <g className="moto-far">
              <circle cx={REAR_AXLE.x} cy={REAR_AXLE.y} r={46} fill="none" strokeWidth={2} className="stroke-ink-subtle" />
              <rect
                x={rearCaliper.x - 9}
                y={rearCaliper.y - 13}
                width={18}
                height={26}
                rx={5}
                transform={`rotate(-50 ${rearCaliper.x} ${rearCaliper.y})`}
                className={shell}
              />
            </g>
          </Part>

          <Part id="wheels" primary>
            <Wheel x={REAR_AXLE.x} y={REAR_AXLE.y} angle={wheel} />
            <Wheel x={FRONT_AXLE.x} y={FRONT_AXLE.y} angle={frontWheel} />
          </Part>

          {/* Mudguards */}
          <Part id="bodywork">
            <path d="M508,319 A98,98 0 0 1 634,260" fill="none" strokeWidth={5} className={tube} />
            <path d="M86,318 A100,100 0 0 1 214,258" fill="none" strokeWidth={6} className="stroke-surface-overlay" />
            <path d="M86,318 A100,100 0 0 1 214,258" fill="none" className="stroke-line-strong" />
          </Part>

          <Part id="front-brake" primary>
            <BrakeDisc x={FRONT_AXLE.x} y={FRONT_AXLE.y} r={50} angle={frontWheel} />
            <rect
              x={caliper.x - 10}
              y={caliper.y - 15}
              width={20}
              height={30}
              rx={6}
              transform={`rotate(28 ${caliper.x} ${caliper.y})`}
              className={shell}
            />
          </Part>

          {/* Front forks */}
          <Part id="suspension" primary>
            <line x1={222} y1={262} x2={274} y2={150} strokeWidth={10} className={chrome} />
            <line x1={FRONT_AXLE.x} y1={FRONT_AXLE.y} x2={224} y2={258} strokeWidth={16} className={tube} />
            <circle cx={FRONT_AXLE.x} cy={FRONT_AXLE.y} r={7} className="fill-surface-overlay stroke-ink-subtle" />
          </Part>

          {/* Frame */}
          <Part id="frame" primary>
            <line x1={288} y1={160} x2={486} y2={196} strokeWidth={9} className={tube} />
            <line x1={278} y1={188} x2={342} y2={292} strokeWidth={9} className={tube} />
            <path d="M486,196 L496,250 L492,318" fill="none" strokeWidth={11} className={tube} />
            <line x1={486} y1={196} x2={660} y2={184} strokeWidth={6} className={tube} />
            {/* Steering head and triple clamps */}
            <line x1={276} y1={188} x2={290} y2={156} strokeWidth={13} className={tube} />
            <line x1={256} y1={186} x2={278} y2={188} strokeWidth={6} className={tube} />
            <line x1={270} y1={153} x2={292} y2={157} strokeWidth={6} className={tube} />
          </Part>

          {/* ---------- Engine ---------- */}
          <Part id="engine" primary>
            <path
              d="M345,305 C345,285 362,279 376,282 L420,267 C447,260 480,281 483,306 C486,336 470,360 440,365 L380,368 C356,368 345,346 345,305 Z"
              className={cn(shell, 'moto-shell')}
            />
            <g transform={`translate(${CRANK.x} ${CRANK.y}) rotate(${CYLINDER_TILT})`}>
              {/* Barrel with cooling fins */}
              <rect x={-24} y={-110} width={48} height={70} rx={3} className={cn(shell, 'moto-shell')} />
              {Array.from({ length: 7 }, (_, i) => (
                <line key={i} x1={-31} x2={31} y1={-104 + i * 9} y2={-104 + i * 9} strokeWidth={2.5} className="stroke-line-strong" />
              ))}
              {/* Cylinder head */}
              <rect x={-28} y={-134} width={56} height={26} rx={6} className={cn(shell, 'moto-shell')} />
              <line x1={-20} x2={20} y1={-124} y2={-124} strokeWidth={2.5} className="stroke-line-strong" />
              {/* Spark plug */}
              <line x1={0} y1={-134} x2={0} y2={-146} strokeWidth={4} className={chrome} />
              {/* X-ray: piston, connecting rod, crank */}
              <g className="moto-internal">
                <rect x={-20} y={pistonPinY - 16} width={40} height={26} rx={3} className="fill-coolant-950 stroke-coolant-400" />
                <line x1={0} y1={pistonPinY} x2={crankPin.x} y2={crankPin.y} strokeWidth={5} className="stroke-coolant-400" />
                <circle r={CRANK_THROW + 6} className="fill-coolant-950 stroke-coolant-400" />
                <circle cx={crankPin.x} cy={crankPin.y} r={4} className="fill-coolant-400" />
                <circle r={4} className="fill-coolant-400" />
              </g>
            </g>
            {/* Generator (stator) cover on the crankshaft's left end */}
            <circle cx={CRANK.x} cy={CRANK.y} r={27} className={cn(shell, 'moto-shell')} />
            <circle cx={CRANK.x} cy={CRANK.y} r={18} fill="none" className="stroke-line-strong" />
            {[0, 90, 180, 270].map((a) => {
              const p = polar(CRANK.x, CRANK.y, 23, a + 45)
              return <circle key={a} cx={p.x} cy={p.y} r={1.6} className="fill-ink-subtle" />
            })}
          </Part>

          {/* Clutch: on the right-hand end of the gearbox mainshaft (x-ray only) */}
          <Part id="clutch">
            <g className="moto-internal" fill="none">
              <circle cx={MAINSHAFT.x} cy={MAINSHAFT.y} r={28} strokeDasharray="4 3" strokeWidth={2} className="stroke-coolant-400" />
              <circle cx={MAINSHAFT.x} cy={MAINSHAFT.y} r={21} className="stroke-coolant-400" />
              <circle cx={MAINSHAFT.x} cy={MAINSHAFT.y} r={14} className="stroke-coolant-400" />
              {/* Primary drive gear on the crankshaft, meshing with the clutch basket */}
              <circle cx={CRANK.x} cy={CRANK.y} r={14} strokeDasharray="3 2" className="stroke-coolant-400" />
            </g>
          </Part>

          {/* Gearbox: mainshaft and countershaft gear pair (x-ray), plus the gear lever */}
          <Part id="gearbox">
            <g className="moto-internal" fill="none">
              <circle cx={MAINSHAFT.x} cy={MAINSHAFT.y} r={12} strokeWidth={2} className="stroke-coolant-300" />
              <circle cx={COUNTERSHAFT.x} cy={COUNTERSHAFT.y} r={20} strokeWidth={2} className="stroke-coolant-300" />
              <circle cx={MAINSHAFT.x} cy={MAINSHAFT.y} r={3} className="fill-coolant-300" />
              <circle cx={COUNTERSHAFT.x} cy={COUNTERSHAFT.y} r={3} className="fill-coolant-300" />
            </g>
          </Part>

          {/* Exhaust header: leaves the front of the head and runs under the engine */}
          <Part id="exhaust" primary>
            <path
              d="M328,214 C311,238 311,282 324,316 C336,350 352,376 392,380 L520,384"
              fill="none"
              strokeWidth={9}
              className="stroke-line-strong"
            />
            <path d="M328,214 C311,238 311,282 324,316 C336,350 352,376 392,380 L520,384" fill="none" strokeWidth={4} className="moto-keep stroke-surface-overlay" />
          </Part>

          {/* Rear suspension: swingarm and shock absorber */}
          <Part id="suspension">
            <path
              d="M489.9,324.7 L494.1,311.3 L602.1,345.3 L597.9,358.7 Z"
              strokeWidth={4}
              className="fill-surface-overlay stroke-line-strong"
            />
            <circle cx={SWINGARM_PIVOT.x} cy={SWINGARM_PIVOT.y} r={5} className="fill-surface-overlay stroke-ink-subtle" />
            <g transform="translate(590 205) rotate(5)">
              <rect x={-6} y={0} width={12} height={34} rx={4} className={shell} />
              <path
                d={`M-9,38 ${Array.from({ length: 9 }, (_, i) => `L${i % 2 ? -9 : 9},${46 + i * 9}`).join(' ')}`}
                fill="none"
                strokeWidth={2.5}
                className="stroke-ink-subtle"
              />
              <line x1={0} y1={34} x2={0} y2={130} strokeWidth={4} className={chrome} />
              <circle cx={0} cy={134} r={5} className="fill-surface-overlay stroke-ink-subtle" />
            </g>
          </Part>

          {/* ---------- Final drive (near side) ---------- */}
          <Part id="chain" primary>
            <motion.g style={{ x: FRONT_SPROCKET.x, y: FRONT_SPROCKET.y, rotate: frontSprocket }}>
              <path d={FRONT_SPROCKET_PATH} className="fill-surface-overlay stroke-ink-subtle" />
            </motion.g>
            <motion.g style={{ x: REAR_SPROCKET.x, y: REAR_SPROCKET.y, rotate: wheel }}>
              <path d={REAR_SPROCKET_PATH} className="fill-surface-overlay stroke-ink-subtle" />
              {[0, 72, 144, 216, 288].map((a) => {
                const p = polar(0, 0, 26, a + 36)
                return <circle key={a} cx={p.x} cy={p.y} r={6} className="fill-bg stroke-line-strong" />
              })}
              <circle r={12} className="fill-surface-raised stroke-line-strong" />
            </motion.g>
            <motion.path
              d={CHAIN}
              fill="none"
              strokeWidth={4}
              strokeDasharray={`${CHAIN_PITCH * 0.55} ${CHAIN_PITCH * 0.45}`}
              className="stroke-ink-muted"
              style={{ strokeDashoffset: chainOffset }}
            />
            {/* Front sprocket cover */}
            <path
              d="M448,312 C468,304 489,316 488,336 C487,350 471,355 456,351 C443,347 439,321 448,312 Z"
              className={shell}
            />
            <circle cx={REAR_AXLE.x} cy={REAR_AXLE.y} r={6} className="fill-surface-overlay stroke-ink-subtle" />
          </Part>

          {/* ---------- Bodywork ---------- */}
          <Part id="bodywork" primary>
            {/* Side panel */}
            <path d="M470,194 L596,191 C592,210 584,224 566,232 L492,236 C480,236 474,226 470,194 Z" className={shell} />
            {/* Seat */}
            <path
              d="M446,170 C470,156 520,156 560,160 C600,163 640,166 666,170 L668,184 C600,190 520,192 452,190 Z"
              className="fill-surface-overlay stroke-line-strong"
            />
            {/* Tail section and number plate */}
            <path d="M600,188 L668,172 C695,173 716,177 724,183 L704,201 C670,205 630,205 600,201 Z" className={shell} />
            <line x1={704} y1={201} x2={716} y2={244} strokeWidth={3} className={tube} />
            <rect x={704} y={240} width={32} height={20} rx={2} className={shell} />
          </Part>
          <Part id="lights">
            <rect x={712} y={180} width={12} height={8} rx={2} className="fill-danger-500 stroke-danger-400" />
          </Part>
          <Part id="fuel-tank" primary>
            {/* Fuel tank with knee-grip trim */}
            <path
              d="M292,172 C296,138 326,118 372,116 C414,115 446,132 458,172 C420,181 330,183 292,172 Z"
              className="fill-surface-overlay stroke-line-strong"
            />
            <path d="M312,150 C344,134 402,131 446,152" fill="none" strokeWidth={4} className="stroke-ink-subtle" />
            <path d="M318,160 C350,148 400,146 440,162" fill="none" className="stroke-line-strong" />
          </Part>

          {/* ---------- Cockpit ---------- */}
          {/* Far-side (right) grip: throttle, and the front brake lever */}
          <Part id="throttle" primary>
            <g className={cn('moto-far', control)}>
              <line x1={323} y1={122} x2={349} y2={118} strokeWidth={9} />
              <line x1={326} y1={118} x2={326} y2={126} strokeWidth={2} className="stroke-ink-subtle" />
            </g>
          </Part>
          <Part id="front-brake">
            <path d="M321,124 C307,131 295,135 283,136" fill="none" strokeWidth={4} className={cn('moto-far', control)} />
          </Part>
          <Part id="lights" primary>
            {/* Headlight */}
            <circle cx={238} cy={178} r={21} className={shell} />
            <path d="M226,163 A19,19 0 0 0 226,193" fill="none" strokeWidth={4} className="stroke-caution-400" />
          </Part>
          <Part id="instruments" primary>
            <rect x={258} y={124} width={34} height={20} rx={5} transform="rotate(-24 275 134)" className={shell} />
            <circle cx={273} cy={134} r={5} fill="none" className="stroke-ink-subtle" />
          </Part>
          <Part id="handlebar" primary>
            {/* Handlebar and mirror */}
            <path d="M284,152 L296,138 L320,127" fill="none" strokeWidth={5} className={chrome} />
            <line x1={306} y1={132} x2={298} y2={94} strokeWidth={2.5} className={chrome} />
            <ellipse cx={294} cy={86} rx={15} ry={8} transform="rotate(-12 294 86)" className={shell} />
          </Part>
          <Part id="handlebar">
            <line x1={316} y1={127} x2={342} y2={123} strokeWidth={9} className="stroke-surface-overlay" />
          </Part>
          <Part id="clutch" primary>
            <path d="M314,129 C300,136 288,140 276,141" fill="none" strokeWidth={4} className={control} />
            <circle cx={314} cy={129} r={3} className="fill-surface-overlay stroke-ink-subtle" />
          </Part>

          {/* ---------- Feet ---------- */}
          <Part id="rear-brake">
            <path d="M512,356 L478,366 L470,364" fill="none" strokeWidth={4} className={cn('moto-far', control)} />
          </Part>
          <Part id="footpegs" primary>
            {/* Footpeg and its bracket */}
            <line x1={500} y1={330} x2={505} y2={358} strokeWidth={5} className={tube} />
            <line x1={494} y1={360} x2={522} y2={362} strokeWidth={8} className="stroke-surface-overlay" />
          </Part>
          <Part id="side-stand" primary>
            {/* Side stand, folded up */}
            <line x1={474} y1={372} x2={534} y2={384} strokeWidth={5} className={tube} />
          </Part>
          <Part id="gearbox" primary>
            <path d="M452,324 L470,352" fill="none" strokeWidth={4} className={control} />
            <line x1={464} y1={352} x2={478} y2={352} strokeWidth={6} className={control} />
            <circle cx={452} cy={324} r={4} className="fill-surface-overlay stroke-ink-subtle" />
          </Part>

          {/* Enlarged pointer targets for small parts, on top of everything */}
          {interactive && (
            <g>
              <HitArea id="handlebar" d="M284,152 L296,138 L318,128 L342,125" width={9} />
              <HitArea id="handlebar" d="M306,132 L298,94 M286,86 L302,86" width={12} />
              <HitArea id="instruments" d="M262,138 L288,128" width={16} />
              <HitArea id="throttle" d="M326,120 L355,116" width={7} />
              <HitArea id="front-brake" d="M321,124 C307,131 295,135 283,136" width={6} />
              <HitArea id="clutch" d="M314,130 C300,137 288,141 274,142" width={6} />
              <HitArea id="gearbox" d="M452,324 L470,352 L480,352" width={10} />
              <HitArea id="rear-brake" d="M514,356 L478,367 L468,364" width={9} />
              <HitArea id="footpegs" d="M492,360 L524,362" width={11} />
              <HitArea id="side-stand" d="M474,373 L536,385" width={10} />
              <HitArea id="lights" d="M712,184 L726,184" width={14} />
            </g>
          )}

          {/* Rider-view markers: where the hands and feet operate the controls */}
          <g className="moto-marker" aria-hidden>
            {[
              { x: 306, y: 131 },
              { x: 474, y: 358 },
            ].map((m) => (
              <g key={m.x}>
                <circle cx={m.x} cy={m.y} r={18} fill="none" className="moto-keep animate-pulse-soft stroke-ignition-500/60" />
                <circle cx={m.x} cy={m.y} r={26} fill="none" strokeDasharray="2 4" className="moto-keep stroke-ignition-500/40" />
              </g>
            ))}
          </g>
        </g>
      </svg>
    </PartContext.Provider>
  )
}
