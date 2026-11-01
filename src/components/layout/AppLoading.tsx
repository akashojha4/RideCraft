import { LogoMark } from './Logo'

export function AppLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="Loading RideCraft">
      <LogoMark className="size-10 animate-spin-slow" />
    </div>
  )
}
