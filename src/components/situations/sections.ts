/** The seven sections of a Riding Situations lesson, in order. */
export const SECTIONS = [
  { id: 'situation', title: 'Understand the situation', short: 'Situation' },
  { id: 'controls', title: 'Control by control', short: 'Controls' },
  { id: 'timeline', title: 'Step-by-step timeline', short: 'Timeline' },
  { id: 'watch', title: 'Watch it done', short: 'Watch' },
  { id: 'mistakes', title: 'Common mistakes', short: 'Mistakes' },
  { id: 'check', title: 'Quick knowledge check', short: 'Check' },
  { id: 'practice', title: 'Now try it', short: 'Practise' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']
