'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { addDays } from 'date-fns'

type FilterProps = {
  onFilterChange: (filters: FilterState) => void
}

export type FilterState = {
  dateRange: { from: Date; to: Date } | undefined
  category: string
  type: string
}

export function TransactionFilter({ onFilterChange }: FilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: addDays(new Date(), -30), to: new Date() },
    category: 'all',
    type: 'all'
  })

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <DatePickerWithRange
        selected={filters.dateRange}
        onSelect={(range) => handleFilterChange('dateRange', range)}
      />
      <Select onValueChange={(value) => handleFilterChange('category', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="food">Food</SelectItem>
          <SelectItem value="transport">Transport</SelectItem>
          <SelectItem value="utilities">Utilities</SelectItem>
          <SelectItem value="entertainment">Entertainment</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => handleFilterChange('type', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={() => onFilterChange({ dateRange: undefined, category: 'all', type: 'all' })}>
        Reset Filters
      </Button>
    </div>
  )
}

