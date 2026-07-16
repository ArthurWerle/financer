import { ReactNode } from 'react'

type StatTileProps = {
  label: string
  value: ReactNode
  icon: ReactNode
  footnote?: ReactNode
  valueClassName?: string
}

export const StatTile = ({
  label,
  value,
  icon,
  footnote,
  valueClassName,
}: StatTileProps) => (
  <div className="flex flex-col gap-2 rounded-[10px] border border-border bg-card p-4">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium uppercase tracking-[.06em] text-muted-foreground">
        {label}
      </span>
      {icon}
    </div>
    <span
      className={`whitespace-nowrap font-mono text-[18px] font-semibold tracking-[-0.02em] ${valueClassName ?? ''}`}
    >
      {value}
    </span>
    {footnote && (
      <span className="font-mono text-[11.5px] text-faint">{footnote}</span>
    )}
  </div>
)
