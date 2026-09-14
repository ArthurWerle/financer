// The app pins every displayed date to this zone (see humanReadableDate), so a
// timestamp without an offset is interpreted here rather than in whatever zone
// the browser happens to be in.
const TIMEZONE = 'America/Sao_Paulo'

const FALLBACK_OFFSET = '-03:00'

// A naive datetime: a date and a time with no trailing Z and no ±HH:MM offset.
// The scanner (ai-internal) returns the wall-clock time printed on the receipt
// in exactly this shape, e.g. "2026-09-12T15:21:26".
const NAIVE_DATETIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/

// Brazil observed DST until 2019, so the offset is resolved per instant instead
// of hardcoded. Intl also makes the result independent of the machine's own
// timezone, which is the whole point of pinning.
const offsetFor = (naive: string) => {
  const probe = new Date(`${naive}Z`)
  if (isNaN(probe.getTime())) return FALLBACK_OFFSET
  const timeZoneName = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    timeZoneName: 'longOffset',
  })
    .formatToParts(probe)
    .find((part) => part.type === 'timeZoneName')?.value
  const offset = timeZoneName?.replace('GMT', '')
  return offset || FALLBACK_OFFSET
}

// Normalizes a datetime string to RFC3339, which is what the API requires.
// Values that already carry a zone designator are returned untouched, so this
// is idempotent and safe to apply to anything.
export const toRFC3339 = (value?: string | null): string | undefined => {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (!NAIVE_DATETIME.test(trimmed)) return trimmed

  const normalized = trimmed.replace(' ', 'T')
  const withSeconds =
    normalized.length === 16 ? `${normalized}:00` : normalized
  return `${withSeconds}${offsetFor(withSeconds)}`
}
