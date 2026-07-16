import { useState } from "react"
import { format, parseISO } from "date-fns"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MultiSelect from "@/components/multi-select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { useFilters } from "@/hooks/useFilters"
import { useCategories } from "@/queries/categories/useCategories"
import { Category } from "@/types/category"

export function Filters() {
  const { setUrl, setMultipleUrl, filters } = useFilters()
  const { data: categories = [] } = useCategories()
  const [searchValue, setSearchValue] = useState(filters.query ?? '')
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

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3.5">
      <div className="flex overflow-hidden rounded-[7px] border border-border">
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
      <Button
        onClick={() => {
          if (filters.currentMonth === 'true') {
            setUrl('currentMonth', null)
            return
          }

          setUrl('currentMonth', 'true')
        }}
        variant="outline"
        className={`h-[30px] rounded-[7px] px-3 text-[12.5px] font-medium ${filters?.currentMonth === 'true' ? 'bg-panel2 text-foreground' : 'text-muted-foreground'}`}
      >
        Current month
      </Button>
      <div className="w-full sm:w-auto">
        <MultiSelect
          options={categories.map((category: Category) => ({ value: String(category.id), label: category.name }))}
          value={filters.category ? filters.category.split(',') : []}
          onChange={(selected) =>
            setUrl('category', selected.length ? selected.join(',') : null)
          }
        />
      </div>
      <div className="w-full sm:w-auto">
        <DatePickerWithRange selected={localDateRange} onSelect={handleDateRangeChange} />
      </div>
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