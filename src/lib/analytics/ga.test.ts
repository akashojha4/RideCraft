import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  analyticsPath,
  GA_MEASUREMENT_ID,
  initAnalytics,
  resetAnalyticsForTests,
  shouldEnableAnalytics,
  trackEvent,
  trackPageView,
} from './ga'

afterEach(() => {
  resetAnalyticsForTests()
  vi.unstubAllGlobals()
})

describe('shouldEnableAnalytics', () => {
  it('stays off in development', () => {
    expect(shouldEnableAnalytics(false, 'ride-craft-two.vercel.app')).toBe(false)
  })

  it('stays off on loopback even in a production build', () => {
    expect(shouldEnableAnalytics(true, 'localhost')).toBe(false)
    expect(shouldEnableAnalytics(true, '127.0.0.1')).toBe(false)
    expect(shouldEnableAnalytics(true, '[::1]')).toBe(false)
  })

  it('runs on a production host', () => {
    expect(shouldEnableAnalytics(true, 'ride-craft-two.vercel.app')).toBe(true)
  })
})

describe('analyticsPath', () => {
  it('keeps search and never includes a hash', () => {
    expect(analyticsPath('/simulators/cockpit', '?practice=u-turn')).toBe('/simulators/cockpit?practice=u-turn')
    expect(analyticsPath('/learn')).toBe('/learn')
  })
})

describe('initAnalytics', () => {
  it('does not load gtag from unit tests (non-production)', () => {
    expect(initAnalytics()).toBe(false)
    expect(trackPageView('/learn')).toBe(false)
  })
})

function stubBrowser() {
  const script = { async: false, src: '' }
  const appendChild = vi.fn()
  vi.stubGlobal('window', {
    dataLayer: [] as unknown[],
    location: { hostname: 'example.com', origin: 'https://example.com' },
  })
  vi.stubGlobal('document', {
    title: 'Learn · RideCraft',
    querySelector: () => null,
    createElement: () => script,
    head: { appendChild },
  })
  return { script, appendChild }
}

describe('trackPageView', () => {
  it('configures GA without an automatic page_view, then sends one event per path', () => {
    const { script, appendChild } = stubBrowser()
    const on = { enabled: true as const }

    expect(trackPageView('/learn', '', on)).toBe(true)
    expect(trackPageView('/learn', '', on)).toBe(false)
    expect(trackPageView('/simulators', '', on)).toBe(true)

    expect(script.async).toBe(true)
    expect(script.src).toBe(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`)
    expect(appendChild).toHaveBeenCalledTimes(1)

    const events = (window.dataLayer as unknown as Array<IArguments>).filter((entry) => entry[0] === 'event')
    const configs = (window.dataLayer as unknown as Array<IArguments>).filter((entry) => entry[0] === 'config')
    expect(configs).toHaveLength(1)
    expect(configs[0][1]).toBe(GA_MEASUREMENT_ID)
    expect(configs[0][2]).toEqual({ send_page_view: false })
    expect(events).toHaveLength(2)
    expect(events[0][1]).toBe('page_view')
    expect(events[0][2]).toEqual({
      page_path: '/learn',
      page_location: 'https://example.com/learn',
      page_title: 'Learn · RideCraft',
    })
    expect(events[1][2]).toEqual(expect.objectContaining({ page_path: '/simulators' }))
  })
})

describe('trackPageView title', () => {
  it('uses the given title when the caller knows it before document.title changes', () => {
    stubBrowser()
    expect(trackPageView('/learn/basics', '', { enabled: true, title: 'Motorcycle Basics · RideCraft' })).toBe(true)
    const events = (window.dataLayer as unknown as Array<IArguments>).filter((entry) => entry[0] === 'event')
    expect(events.at(-1)?.[2]).toMatchObject({ page_path: '/learn/basics', page_title: 'Motorcycle Basics · RideCraft' })
  })
})

describe('trackEvent', () => {
  it('stays off outside production (unit tests, localhost)', () => {
    expect(trackEvent('lesson_started', { lesson_id: 'basics/x' })).toBe(false)
  })

  it('sends a custom event through the same gtag, once per key per page load', () => {
    const { appendChild } = stubBrowser()
    const on = { enabled: true as const }
    expect(trackEvent('lesson_started', { lesson_id: 'basics/x' }, { ...on, once: 'basics/x' })).toBe(true)
    expect(trackEvent('lesson_started', { lesson_id: 'basics/x' }, { ...on, once: 'basics/x' })).toBe(false)
    expect(trackEvent('lesson_completed', { lesson_id: 'basics/x' }, { ...on, once: 'basics/x' })).toBe(true)
    expect(trackPageView('/learn', '', on)).toBe(true)
    // One gtag script for page views and events alike.
    expect(appendChild).toHaveBeenCalledTimes(1)
    const events = (window.dataLayer as unknown as Array<IArguments>).filter((entry) => entry[0] === 'event').map((e) => e[1])
    expect(events).toEqual(['lesson_started', 'lesson_completed', 'page_view'])
  })
})
