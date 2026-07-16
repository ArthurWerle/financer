export const CHART_RAMP = [
  'var(--c1)',
  'var(--c2)',
  'var(--c3)',
  'var(--c4)',
  'var(--c5)',
  'var(--c6)',
  'var(--c7)',
  'var(--c8)',
] as const

export const chartColor = (index: number) => CHART_RAMP[index % CHART_RAMP.length]
