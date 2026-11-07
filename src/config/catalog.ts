/**
 * Counts quoted on the home page. Kept here as plain numbers so the home page doesn't load the
 * whole curriculum; `catalog.test.ts` fails if they drift from the content.
 */
export const catalog = {
  lessons: { basics: 11, 'pre-ride': 12, 'first-ride': 6, 'riding-situations': 19, handling: 10, mechanics: 17 },
  simulators: 6,
  scenarios: 14,
} as const
