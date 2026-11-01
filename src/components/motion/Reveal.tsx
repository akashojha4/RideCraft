import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'
import { fadeUp, staggerContainer } from '@/lib/motion'

/** Animates its children into view once, when scrolled into the viewport. */
export function Reveal({
  children,
  variants = fadeUp,
  delay = 0,
  className,
}: {
  children: ReactNode
  variants?: Variants
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

/** Reveals `StaggerItem` children one after another. */
export function Stagger({
  children,
  stagger = 0.07,
  className,
  as = 'div',
}: {
  children: ReactNode
  stagger?: number
  className?: string
  as?: 'div' | 'ul' | 'ol'
}) {
  const Component = motion[as]
  return (
    <Component
      className={className}
      variants={staggerContainer(stagger)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </Component>
  )
}

export function StaggerItem({
  children,
  className,
  as = 'div',
  variants = fadeUp,
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'li'
  variants?: Variants
}) {
  const Component = motion[as]
  return (
    <Component className={className} variants={variants}>
      {children}
    </Component>
  )
}
