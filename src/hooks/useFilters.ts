import { useState, useCallback, useEffect } from 'react'
import { useFiltersStore } from '../stores/useFiltersStore'

interface UseFiltersReturn {
  filters: {
    category?: string
    currentMonth?: string
    startDate?: string
    endDate?: string
    query?: string
  }
  setUrl: (key: string, value: string | null) => void
  setMultipleUrl: (updates: Record<string, string | null>) => void
  clearFilters: () => void
}

export const useFilters = (): UseFiltersReturn => {
  const { filters, setFilters } = useFiltersStore() as { filters: Record<string, string | undefined>, setFilters: (filters: Record<string, string | undefined>) => void }

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
    
    const validFilters = Object.fromEntries(Object.entries(newFilters).filter(([_, v]) => v !== undefined)) as Record<string, string>
    const searchParams = new URLSearchParams(validFilters)
    const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams}` : ''}`
    window.history.pushState({}, '', newUrl)
  }, [filters, setFilters])

  const setMultipleUrl = useCallback((updates: Record<string, string | null>) => {
    const newFilters = { ...filters }

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        delete newFilters[key]
      } else {
        newFilters[key] = value
      }
    })

    setFilters(newFilters)

    const validFilters = Object.fromEntries(Object.entries(newFilters).filter(([_, v]) => v !== undefined)) as Record<string, string>
    const searchParams = new URLSearchParams(validFilters)
    const newUrl = `${window.location.pathname}${searchParams.toString() ? `?${searchParams}` : ''}`
    window.history.pushState({}, '', newUrl)
  }, [filters, setFilters])

  const clearFilters = useCallback(() => {
    setFilters({})
    window.history.pushState({}, '', window.location.pathname)
  }, [setFilters])

  return { filters, setUrl, setMultipleUrl, clearFilters }
};