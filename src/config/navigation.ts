export interface NavItem {
  label: string
  to: string
  /** Match nested routes as active (e.g. /learn/basics highlights "Learn"). */
  end?: boolean
}

export const primaryNav: NavItem[] = [
  { label: 'Anatomy', to: '/anatomy' },
  { label: 'Learn', to: '/learn' },
  { label: 'Simulators', to: '/simulators' },
  { label: 'Scenarios', to: '/scenarios' },
  { label: 'Progress', to: '/progress' },
]
