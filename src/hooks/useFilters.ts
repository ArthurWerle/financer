import { useState, useCallback, useEffect } from 'react'
import { useFiltersStore } from '../stores/useFiltersStore'

interface UseFiltersReturn {
  filters: {
    category?: string
    currentMonth?: string
  }
  setUrl: (key: string, value: string | null) => void
  clearFilters: () => void
}

export const useFilters = (): UseFiltersReturn => {
  const { filters, setFilters } = useFiltersStore()

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    setFilters(Object.fromEntries(searchParams.entries()))
  }, [setFilters])

  const setUrl = useCallback((key: string, value: string | null) => {
    const newFilters = { ...filters }

    if (value === null) {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }

    setFilters(newFilters)
    
    const searchParams = new URLSearchParams(newFilters)
    const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams}` : ''}`
    window.history.pushState({}, '', newUrl)
  }, [filters, setFilters])

  const clearFilters = useCallback(() => {
    setFilters({})
    window.history.pushState({}, '', window.location.pathname)
  }, [setFilters])

  return { filters, setUrl, clearFilters }
};