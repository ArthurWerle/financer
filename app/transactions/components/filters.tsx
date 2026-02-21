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
    <div className="flex gap-2 mb-10 flex-wrap">
      <div className="flex rounded-lg border border-input overflow-hidden">
        <Button
          onClick={() => setUrl('type', 'expense')}
          variant="ghost"
          className={`rounded-none ${activeType === 'expense' ? 'bg-muted font-semibold' : ''}`}
        >
          Expense
        </Button>
        <Button
          onClick={() => setUrl('type', 'income')}
          variant="ghost"
          className={`rounded-none border-l ${activeType === 'income' ? 'bg-muted font-semibold' : ''}`}
        >
          Income
        </Button>
      </div>
      <div>
        <Button
          onClick={() => {
            if (filters.currentMonth === 'true') {
              setUrl('currentMonth', null)
              return
            }

            setUrl('currentMonth', 'true')
          }}
          variant="outline"
          className={`rounded-lg ${filters?.currentMonth === 'true' ? 'border-blue-400' : ''}`}
        >
          Current month
        </Button>
      </div>
      <div>
        <MultiSelect
          options={categories.map((category: Category) => ({ value: String(category.id), label: category.name }))}
          value={filters.category ? filters.category.split(',') : []}
          onChange={(selected) => setUrl('category', selected.join(','))}
        />
      </div>
      <div>
        <DatePickerWithRange selected={localDateRange} onSelect={handleDateRangeChange} />
      </div>
      <div>
        <Input
          placeholder="Search transactions..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onBlur={applySearch}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applySearch()
          }}
          className="w-64"
        />
      </div>
    </div>
  )
}