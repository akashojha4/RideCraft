import { academyPhases, getAcademyPhase } from '@/content/academy'
import { getLesson, getModule, visibleModules } from '@/content/curriculum'
import { getScenario, scenarios } from '@/content/scenarios'
import { SITE_URL } from './sitemap'

/*
 * Search and sharing metadata for every page, from one place. The app sets it in the document
 * head on each navigation (SeoHead), and the production build writes it into each page's own
 * HTML file (scripts/prerender-head.mjs), so crawlers and link previews see it without running
 * the app.
 */

export const SITE_NAME = 'RideCraft'
export const OG_IMAGE = `${SITE_URL}/og-image.png`

export interface PageMeta {
  /** The full <title>. */
  title: string
  description: string
  /** Canonical path (no query string). */
  path: string
  /** Kept out of search results (personal pages, unknown addresses). */
  noindex?: boolean
  /** Unknown address: served with a 404 status in production. */
  notFound?: boolean
  ogType?: 'website' | 'article'
}

const brand = (t: string) => `${t} · ${SITE_NAME}`

/** Descriptions are cut on a word boundary at about 158 characters, the length search results show. */
export function clip(text: string, max = 158) {
  const plain = text.replace(/\s+/g, ' ').trim()
  if (plain.length <= max) return plain
  const cut = plain.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:—–-]+$/, '')}…`
}

const STATIC: Record<string, Omit<PageMeta, 'path'>> = {
  '/': {
    title: 'RideCraft — Free Motorcycle Riding Lessons Online for Beginners',
    description:
      'Learn bike riding for beginners with free motorcycle riding lessons online: how the clutch, gears and brakes work, simulators and real riding scenarios.',
  },
  '/learn': {
    title: brand('Learn Bike Riding for Beginners — Free Motorcycle Course'),
    description:
      'A free motorcycle course in eight phases, from the machine and your kit to first controls, turning, traffic and roadcraft. Open any lesson — no sign-up needed.',
  },
  '/challenges': {
    title: brand('Practical Motorcycle Riding Challenges for Beginners'),
    description:
      'Starts, stops, clutch control, a hill start, an emergency stop and a U-turn: rehearse each beginner challenge here, then repeat it with an instructor.',
  },
  '/simulators': {
    title: brand('Motorcycle Riding Simulators — Practise Every Control'),
    description:
      'Free motorcycle simulators in the order a new rider learns: start the engine, find the biting point, change gear, ride and stop, then the rider cockpit.',
  },
  '/simulators/starting': {
    title: brand('How to Start a Motorcycle — Starting Simulator'),
    description:
      'Neutral, ignition, kill switch and starter: start a geared motorcycle step by step and watch the starter motor turn the engine until it fires.',
  },
  '/simulators/cockpit': {
    title: brand('Rider Cockpit — Motorcycle Riding Simulator'),
    description:
      'Sit in the rider’s seat with every control where it is on a real motorcycle. Practise moving off, stopping, hills, traffic and hazards, step by step.',
  },
  '/simulators/clutch-explorer': {
    title: brand('Inside a Motorcycle Clutch — Clutch Explorer'),
    description:
      'Pull the clutch lever and watch the pushrod, springs and plates move: see how a motorcycle clutch connects and disconnects the engine and gearbox.',
  },
  '/simulators/clutch-throttle': {
    title: brand('How to Use a Motorcycle Clutch — Clutch and Throttle Simulator'),
    description:
      'How to use a motorcycle clutch: find the biting point, balance clutch and throttle, and pull away smoothly without stalling — on the flat and on a hill.',
  },
  '/simulators/gears': {
    title: brand('How to Change Gears on a Motorcycle — Gear Shifting Simulator'),
    description:
      'How to change gears on a motorcycle: clutch, throttle and gear lever in the right order, and how each gear changes engine speed, road speed and pulling power.',
  },
  '/simulators/ride-and-stop': {
    title: brand('Riding and Stopping Simulator — Throttle, Brakes and Clutch'),
    description:
      'Pull away, hold a steady speed and stop smoothly with the front and rear brakes, pulling the clutch in at the right moment so the engine doesn’t stall.',
  },
  '/anatomy': {
    title: brand('Motorcycle Anatomy — Every Part and How It Works'),
    description:
      'An interactive motorcycle anatomy explorer: the engine, clutch, gearbox, chain, brakes, suspension and controls — what each part does and what it connects to.',
  },
  '/scenarios': {
    title: brand('Interactive Motorcycle Riding Scenarios — Decide, Then See Why'),
    description:
      'Interactive motorcycle riding scenarios from real roads: signals, hills, wet roads, potholes and emergency braking. Choose what to do, then see why.',
  },
  '/checklist': {
    title: brand('Motorcycle Pre-Ride Checklist — Five-Minute Safety Check'),
    description:
      'Motorcycle safety for beginners starts before you ride: tyres, brakes, controls, lights, chain and fluids in a five-minute checklist for your phone.',
  },
  '/glossary': {
    title: brand('Motorcycle Glossary — Riding Terms Explained Simply'),
    description:
      'Clutch, friction zone, biting point, countersteering, engine braking and more: the words riders use, explained in plain language, each linked to its lesson.',
  },
  '/progress': {
    title: brand('Your Progress'),
    description: 'Your lessons, quiz scores, simulator exercises and scenarios, saved in this browser.',
    noindex: true,
  },
  '/progress/assessment': {
    title: brand('Knowledge Assessment'),
    description: 'Test what you know with questions from every module. A knowledge test, not a riding test.',
    noindex: true,
  },
  '/design-system': {
    title: brand('Design System'),
    description: 'Internal design reference.',
    noindex: true,
  },
}

/** Keyword-aware titles for lessons whose plain titles undersell what they answer. */
const LESSON_TITLES: Record<string, string> = {
  'basics/understanding-clutch': 'How a Motorcycle Clutch Works — Friction Zone and Biting Point',
  'basics/understanding-gears': 'Understanding Motorcycle Gears — Why Five Gears and Which to Use',
  'riding-situations/using-the-clutch': 'How to Use a Motorcycle Clutch — Control by Control',
  'riding-situations/changing-gear': 'How to Change Gears on a Motorcycle — Up and Down',
  'riding-situations/starting-and-moving-off': 'How to Move Off on a Motorcycle Without Stalling',
  'riding-situations/stopping-without-stalling': 'How to Stop a Motorcycle Without Stalling',
  'handling/slow-speed': 'Motorcycle Balance at Low Speed — Slow-Speed Handling',
  'handling/countersteering': 'Countersteering — How a Motorcycle Really Turns',
  'pre-ride/protective-equipment': 'Motorcycle Protective Gear — Safety for Beginners',
}

export const NOT_FOUND: PageMeta = {
  title: brand('Page Not Found'),
  description: 'This page doesn’t exist. Start from the RideCraft course, the simulators or the riding scenarios.',
  path: '/404',
  noindex: true,
  notFound: true,
}

export function pageMeta(pathname: string): PageMeta {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/'
  const fixed = STATIC[path]
  if (fixed) return { ...fixed, path }

  const [, a, b, c, d] = path.split('/')
  if (a === 'learn' && b === 'phase' && c && !d) {
    const phase = getAcademyPhase(c)
    if (!phase) return NOT_FOUND
    const n = academyPhases.indexOf(phase) + 1
    return { path, title: brand(`${phase.title} — Phase ${n} of ${academyPhases.length} · Learn to Ride`), description: clip(`${phase.goal} ${phase.practise}`) }
  }
  if (a === 'learn' && b && c && !d) {
    const found = getLesson(b, c)
    if (!found || found.module.hidden) return NOT_FOUND
    const title = LESSON_TITLES[`${b}/${c}`] ?? `${found.lesson.title} — ${found.module.title}`
    return { path, title: brand(title), description: clip(`${found.lesson.summary} A free ${found.module.title.toLowerCase()} lesson from RideCraft, with an interactive diagram and a quick check.`), ogType: 'article' }
  }
  if (a === 'learn' && b && !c) {
    const module = getModule(b)
    if (!module || module.hidden) return NOT_FOUND
    return { path, title: brand(`${module.title} — Free Motorcycle Lessons`), description: clip(`${module.description} ${module.lessons.length} free lessons, each with a knowledge check.`) }
  }
  if (a === 'scenarios' && b && !c) {
    const scenario = getScenario(b)
    if (!scenario) return NOT_FOUND
    return { path, title: brand(`${scenario.title} — Interactive Riding Scenario`), description: clip(`${scenario.summary} ${scenario.situation}`), ogType: 'article' }
  }
  return NOT_FOUND
}

/** Every page the build writes its own HTML for: the sitemap's pages plus the personal ones (noindex). */
export function allPagePaths() {
  return [
    ...Object.keys(STATIC).filter((p) => p !== '/design-system'),
    ...academyPhases.map((p) => `/learn/phase/${p.id}`),
    ...visibleModules.flatMap((m) => [`/learn/${m.id}`, ...m.lessons.map((l) => `/learn/${m.id}/${l.id}`)]),
    ...scenarios.map((s) => `/scenarios/${s.id}`),
  ]
}

export const canonicalUrl = (meta: PageMeta) => `${SITE_URL}${meta.path === '/' ? '/' : meta.path}`
