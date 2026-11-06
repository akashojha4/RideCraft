import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { cn } from '@/lib/cn'

/*
 * The grab area for one continuous control (a lever, the twist grip or the pedal), drawn
 * over its artwork. Drag towards the rider (down the screen) to pull, twist or press; drag
 * back to ease off. It is also a keyboard slider: arrows ±5 %, Page Up/Down ±25 %, Home/End.
 */

const STEP = 0.05
const PAGE = 0.25
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

export function LeverHit({
  d,
  label,
  value,
  valueText,
  travel,
  onChange,
  onRelease,
}: {
  /** Outline of the grab area, in the artwork's SVG units. */
  d: string
  label: string
  value: number
  valueText: string
  /** Drag distance for the full range, SVG units. */
  travel: number
  onChange: (v: number) => void
  /** The drag ended (the rider let go). */
  onRelease?: () => void
}) {
  const drag = useRef<{ id: number; y: number; v: number; scale: number } | null>(null)
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(false)

  const down = (e: PointerEvent<SVGPathElement>) => {
    const svg = e.currentTarget.ownerSVGElement
    if (!svg) return
    e.currentTarget.setPointerCapture(e.pointerId)
    // SVG units per screen pixel, so the drag follows the drawing at any size.
    const scale = svg.viewBox.baseVal.height / svg.getBoundingClientRect().height
    drag.current = { id: e.pointerId, y: e.clientY, v: value, scale }
    setActive(true)
  }
  const move = (e: PointerEvent<SVGPathElement>) => {
    const g = drag.current
    if (!g || g.id !== e.pointerId) return
    onChange(clamp01(g.v + ((e.clientY - g.y) * g.scale) / travel))
  }
  const up = (e: PointerEvent<SVGPathElement>) => {
    if (!drag.current || drag.current.id !== e.pointerId) return
    drag.current = null
    setActive(false)
    onRelease?.()
  }
  const key = (e: KeyboardEvent<SVGPathElement>) => {
    const next = { ArrowUp: value + STEP, ArrowRight: value + STEP, ArrowDown: value - STEP, ArrowLeft: value - STEP, PageUp: value + PAGE, PageDown: value - PAGE, Home: 0, End: 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    e.stopPropagation()
    onChange(clamp01(next))
  }

  return (
    <path
      d={d}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-valuetext={valueText}
      data-lever={label}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={key}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      strokeWidth={2}
      strokeDasharray={focused ? '5 4' : undefined}
      className={cn('cursor-grab touch-none fill-transparent outline-none', active && 'cursor-grabbing', focused ? 'stroke-ignition-400' : 'stroke-transparent hover:stroke-line-strong')}
    />
  )
}
