import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import MultiSelect from "@/components/multi-select"
import { useFilters } from "@/hooks/useFilters"
import { useCategories } from "@/queries/categories/useCategories"
import { Category } from "@/types/category"

export function Filters() {
  const { setUrl, filters } = useFilters()
  const { data: categories = [] } = useCategories()

  return (
    <div className="flex gap-2 mb-10">
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
          options={categories.map((category: Category) => ({ value: String(category.ID), label: category.Name }))} 
          value={filters.category ? filters.category.split(',') : []} 
          onChange={(selected) => setUrl('category', selected.join(','))}
        />
      </div>
    </div>
  )
}