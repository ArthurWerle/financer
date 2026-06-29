'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover'
import { useLocations } from '@/queries/locations/useLocations'

type LocationComboboxProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

// Free-text input that suggests previously-used places. Picking a suggestion
// reuses the exact stored name, which prevents accidental duplicates from
// re-typing (e.g. "Mercado X" vs "mercdo x"). The backend additionally
// normalizes casing/whitespace when resolving the name to a location.
export function LocationCombobox({
  id,
  value,
  onChange,
  placeholder,
}: LocationComboboxProps) {
  const { data: locations } = useLocations()
  const [open, setOpen] = React.useState(false)

  const suggestions = React.useMemo(() => {
    if (!locations) return []
    const query = value.trim().toLowerCase()
    const filtered = query
      ? locations.filter((location) =>
          location.name.toLowerCase().includes(query)
        )
      : locations
    // Hide the suggestion when it already matches the typed value exactly.
    return filtered.filter(
      (location) => location.name.toLowerCase() !== query
    )
  }, [locations, value])

  const showPopover = open && suggestions.length > 0

  return (
    <Popover open={showPopover} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Input
          id={id}
          value={value}
          autoComplete="off"
          placeholder={placeholder ?? 'Where? (optional)'}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ul className="max-h-48 overflow-y-auto">
          {suggestions.map((location) => (
            <li key={location.id}>
              <button
                type="button"
                className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                // onMouseDown fires before the input's onBlur, so the value is
                // set before the popover closes.
                onMouseDown={(e) => {
                  e.preventDefault()
                  onChange(location.name)
                  setOpen(false)
                }}
              >
                {location.name}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
