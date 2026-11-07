import { describe, expect, it } from 'vitest'
import { visibleModules } from '@/content/curriculum'
import { scenarios } from '@/content/scenarios'
import { catalog } from './catalog'

describe('home page counts', () => {
  it('match the lessons in each module', () => {
    expect(catalog.lessons).toEqual(Object.fromEntries(visibleModules.map((m) => [m.id, m.lessons.length])))
  })

  it('match the scenarios', () => {
    expect(catalog.scenarios).toBe(scenarios.length)
  })
})
