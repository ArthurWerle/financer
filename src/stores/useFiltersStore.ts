import { create } from 'zustand'

type Filters = {
  category?: string
  currentMonth?: string
  query?: string
}

type FiltersState = {
  filters: Filters
  setFilters: (newFilters: Filters) => void
}

export const useFiltersStore = create<FiltersState>((set) => ({
  filters: {
    category: undefined,
    currentMonth: undefined
  },
  
  setFilters: (newFilters) => set({ filters: newFilters })
}))