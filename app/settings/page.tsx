'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { AlertCircle, Check, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRebuildInsights } from '@/queries/insights/useRebuildInsights'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isLight = mounted ? theme === 'light' : false
  const rebuild = useRebuildInsights()

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Settings" subtitle="Preferences and maintenance" />

      <Card className="rounded-[10px] border-border p-0 shadow-none">
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
          <div className="flex flex-col">
            <Label htmlFor="light-mode" className="text-sm font-medium">
              Light mode
            </Label>
            <span className="text-xs text-muted-foreground">
              Switch between light and dark themes.
            </span>
          </div>
          <Switch
            id="light-mode"
            checked={isLight}
            onCheckedChange={(checked) => setTheme(checked ? 'light' : 'dark')}
            aria-label="Toggle light mode"
          />
        </div>

        <div className="flex flex-col gap-2.5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Rebuild insights</span>
            <span className="text-xs text-muted-foreground">
              Regenerate the AI spending insight from your latest transactions.
            </span>
          </div>
          <div className="flex items-center gap-3">
            {rebuild.isSuccess ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green">
                <Check className="h-3.5 w-3.5" />
                Updated
              </span>
            ) : null}
            {rebuild.isError ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-red">
                <AlertCircle className="h-3.5 w-3.5" />
                Failed — try again
              </span>
            ) : null}
            <Button
              onClick={() => rebuild.mutate()}
              disabled={rebuild.isPending}
              variant="outline"
              className="h-8 gap-1.5 rounded-md px-3 text-xs"
            >
              <RefreshCw
                className={cn('h-3.5 w-3.5', rebuild.isPending && 'animate-spin')}
              />
              {rebuild.isPending ? 'Rebuilding…' : 'Rebuild insights'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
