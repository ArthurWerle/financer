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
  const { setUrl, filters } = useFilters()
  const { data: categories = [] } = useCategories()
  const [searchValue, setSearchValue] = useState(filters.query ?? '')

  const applySearch = () => {
    setUrl('query', searchValue.trim() || null)
  }

  const dateRange: DateRange | undefined = filters.startDate
    ? {
        from: parseISO(filters.startDate),
        to: filters.endDate ? parseISO(filters.endDate) : undefined,
      }
    : undefined

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (!range?.from) {
      setUrl('startDate', null)
      setUrl('endDate', null)
      return
    }
    setUrl('startDate', format(range.from, 'yyyy-MM-dd'))
    setUrl('endDate', range.to ? format(range.to, 'yyyy-MM-dd') : null)
  }

  return (
    <div className="flex gap-2 mb-10 flex-wrap">
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
        <DatePickerWithRange selected={dateRange} onSelect={handleDateRangeChange} />
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