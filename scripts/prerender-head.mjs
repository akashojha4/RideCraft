/*
 * After `vite build`: write one HTML file per public page, each with its own <title>, meta
 * description, canonical URL, Open Graph and robots tags, plus 404.html for unknown addresses.
 *
 * The app itself still renders in the browser; these files only give every address a real file
 * (so Vercel serves it with status 200, and anything else with a genuine 404) and the right head
 * for crawlers and link previews. Metadata comes from src/lib/seo, the same code the app uses.
 *
 * Output follows Vercel's cleanUrls convention: /learn/basics → dist/learn/basics.html.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' })
try {
  const { pageMeta, allPagePaths, NOT_FOUND } = await vite.ssrLoadModule('/src/lib/seo/meta.ts')
  const { headHtml } = await vite.ssrLoadModule('/src/lib/seo/head.ts')

  // The template's own <title> and description are replaced by the page's tags.
  const strip = (html) => html.replace(/<title>[\s\S]*?<\/title>\s*/, '').replace(/<meta\s+name="description"[\s\S]*?\/>\s*/, '')
  const base = strip(template)
  if (!base.includes('</head>')) throw new Error('index.html has no </head>')
  // Preload the two latin text faces every page paints with, so headings don't wait to repaint.
  const fonts = fs.readdirSync(path.join(dist, 'assets')).filter((f) => /^(inter|space-grotesk)-latin-wght-normal-.*\.woff2$/.test(f))
  const preloads = fonts.map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`).join('\n    ')

  // Each page's own code (its route chunk and what that imports), preloaded in parallel with the
  // app instead of discovered one after another. Paths name the page modules in src/app/router.tsx.
  const manifestFile = path.join(dist, '.vite', 'manifest.json')
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
  const already = new Set([...template.matchAll(/(?:src|href)="\/(assets\/[^"]+\.js)"/g)].map((m) => m[1]))
  const chunksFor = (entry) => {
    const out = new Set()
    const walk = (key) => {
      const c = manifest[key]
      if (!c || out.has(c.file)) return
      out.add(c.file)
      for (const k of c.imports ?? []) walk(k)
    }
    walk(entry)
    return [...out].filter((f) => !already.has(f))
  }
  const PAGE_MODULE = {
    '/': 'HomePage', '/learn': 'LearnPage', '/challenges': 'ChallengesPage', '/simulators': 'SimulatorsPage', '/simulators/starting': 'StartingSimulatorPage',
    '/simulators/cockpit': 'RiderCockpitPage', '/simulators/clutch-explorer': 'ClutchExplorerPage', '/simulators/clutch-throttle': 'ClutchThrottleSimulatorPage',
    '/simulators/gears': 'GearShiftingSimulatorPage', '/simulators/ride-and-stop': 'RideStopSimulatorPage', '/anatomy': 'AnatomyPage', '/scenarios': 'ScenariosPage',
    '/checklist': 'ChecklistPage', '/glossary': 'GlossaryPage', '/progress': 'ProgressPage', '/progress/assessment': 'AssessmentPage',
  }
  const pageModule = (p) => PAGE_MODULE[p] ?? (p.startsWith('/learn/phase/') ? 'PhasePage' : p.startsWith('/scenarios/') ? 'ScenarioPage' : p.split('/').length === 4 ? 'LessonPage' : 'ModulePage')
  const modulePreloads = (p) => chunksFor(`src/pages/${pageModule(p)}.tsx`).map((f) => `<link rel="modulepreload" crossorigin href="/${f}" />`).join('\n    ')
  const render = (meta, p) => base.replace('</head>', `    ${preloads}\n    ${p ? modulePreloads(p) : ''}\n    ${headHtml(meta)}\n  </head>`)

  const paths = allPagePaths()
  for (const p of paths) {
    const meta = pageMeta(p)
    if (meta.notFound) throw new Error(`No page for ${p}`)
    const file = p === '/' ? path.join(dist, 'index.html') : path.join(dist, `${p.slice(1)}.html`)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, render(meta, p))
  }
  fs.writeFileSync(path.join(dist, '404.html'), render(NOT_FOUND))
  // The manifest is a build-time aid only; don't publish it.
  fs.rmSync(path.join(dist, '.vite'), { recursive: true, force: true })
  console.log(`prerender-head: wrote ${paths.length} pages and 404.html`)
} finally {
  await vite.close()
}
