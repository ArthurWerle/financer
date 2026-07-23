import { useState } from "react"
import { format, parseISO } from "date-fns"
import { DateRange } from "react-day-picker"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import MultiSelect from "@/components/multi-select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useFilters } from "@/hooks/useFilters"
import { useCategories } from "@/queries/categories/useCategories"
import { Category } from "@/types/category"

export function Filters() {
  const { setUrl, setMultipleUrl, filters } = useFilters()
  const { data: categories = [] } = useCategories()
  const [searchValue, setSearchValue] = useState(filters.query ?? '')
  const [open, setOpen] = useState(false)
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>(() =>
    filters.startDate
      ? {
          from: parseISO(filters.startDate),
          to: filters.endDate ? parseISO(filters.endDate) : undefined,
        }
      : undefined
  )

  const applySearch = () => {
    setUrl('query', searchValue.trim() || null)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setLocalDateRange(range)

    if (!range?.from) {
      setMultipleUrl({ startDate: null, endDate: null })
      return
    }

    if (range.to) {
      setMultipleUrl({
        startDate: format(range.from, 'yyyy-MM-dd'),
        endDate: format(range.to, 'yyyy-MM-dd'),
      })
    }
  }

  const activeType = filters.type ?? 'expense'

  const categoryName = new Map(
    categories.map((category: Category) => [String(category.id), category.name])
  )
  const selectedCategoryIds = filters.category ? filters.category.split(',') : []

  const removeCategory = (id: string) => {
    const remaining = selectedCategoryIds.filter((value) => value !== id)
    setUrl('category', remaining.length ? remaining.join(',') : null)
  }

  const clearDateRange = () => {
    setLocalDateRange(undefined)
    setMultipleUrl({ startDate: null, endDate: null })
  }

  const clearAll = () => {
    setLocalDateRange(undefined)
    setMultipleUrl({
      currentMonth: null,
      category: null,
      startDate: null,
      endDate: null,
      type: null,
    })
  }

  // Chips reflect the applied drawer filters so they stay visible without
  // opening the panel. Text search and the expense/income mode are excluded.
  const chips: { key: string; label: string; onRemove: () => void }[] = []
  if (filters.currentMonth === 'true') {
    chips.push({
      key: 'currentMonth',
      label: 'Current month',
      onRemove: () => setUrl('currentMonth', null),
    })
  }
  for (const id of selectedCategoryIds) {
    chips.push({
      key: `category-${id}`,
      label: categoryName.get(id) ?? `Category ${id}`,
      onRemove: () => removeCategory(id),
    })
  }
  if (filters.startDate) {
    const start = format(parseISO(filters.startDate), 'MMM d')
    const end =
      filters.endDate && filters.endDate !== filters.startDate
        ? format(parseISO(filters.endDate), 'MMM d')
        : null
    chips.push({
      key: 'dateRange',
      label: end ? `${start} – ${end}` : start,
      onRemove: clearDateRange,
    })
  }

  const activeCount = chips.length

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3.5">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="h-[30px] gap-1.5 rounded-[7px] px-3 text-[12.5px] font-medium"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
            {activeCount > 0 ? (
              <Badge
                variant="secondary"
                className="ml-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] font-semibold"
              >
                {activeCount}
              </Badge>
            ) : null}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <SheetHeader className="px-5 pt-5">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Refine the transactions list.</SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Type</Label>
              <div className="flex w-max overflow-hidden rounded-[7px] border border-border">
                <Button
                  onClick={() => setUrl('type', 'expense')}
                  variant="ghost"
                  className={`h-[30px] rounded-none px-3 text-[12.5px] ${activeType === 'expense' ? 'bg-panel2 font-semibold text-foreground' : 'text-muted-foreground'}`}
                >
                  Expense
                </Button>
                <Button
                  onClick={() => setUrl('type', 'income')}
                  variant="ghost"
                  className={`h-[30px] rounded-none border-l border-border px-3 text-[12.5px] ${activeType === 'income' ? 'bg-panel2 font-semibold text-foreground' : 'text-muted-foreground'}`}
                >
                  Income
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Period</Label>
              <Button
                onClick={() => {
                  if (filters.currentMonth === 'true') {
                    setUrl('currentMonth', null)
                    return
                  }

                  setUrl('currentMonth', 'true')
                }}
                variant="outline"
                className={`h-[30px] w-max rounded-[7px] px-3 text-[12.5px] font-medium ${filters?.currentMonth === 'true' ? 'bg-panel2 text-foreground' : 'text-muted-foreground'}`}
              >
                Current month
              </Button>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Categories</Label>
              <MultiSelect
                options={categories.map((category: Category) => ({ value: String(category.id), label: category.name }))}
                value={selectedCategoryIds}
                onChange={(selected) =>
                  setUrl('category', selected.length ? selected.join(',') : null)
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Date range</Label>
              <DatePickerWithRange selected={localDateRange} onSelect={handleDateRangeChange} />
            </div>
          </div>

          <SheetFooter className="px-5 pb-5">
            <Button
              variant="ghost"
              onClick={clearAll}
              className="h-[30px] rounded-[7px] px-3 text-[12.5px] text-muted-foreground"
            >
              Clear all
            </Button>
            <SheetClose asChild>
              <Button
                variant="outline"
                className="h-[30px] rounded-[7px] px-3 text-[12.5px] font-medium"
              >
                Done
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="h-[30px] gap-1 rounded-[7px] pl-2.5 pr-1 text-[12px] font-medium"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label} filter`}
            className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-black/10 hover:text-foreground dark:hover:bg-white/10"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      <div className="w-full sm:ml-auto sm:w-auto">
        <Input
          placeholder="Search transactions…"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onBlur={applySearch}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applySearch()
          }}
          className="h-[30px] w-full rounded-[7px] bg-background text-[12.5px] sm:w-64"
        />
      </div>
    </div>
  )
}
