import { BFF_BASE_URL } from "@/constants"
import api from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export const KEY = '/ai/insights'

export type SpendingInsightResponse = {
  success: boolean
  insight?: string
  periodKey?: string
  generatedAt?: string
  cached?: boolean
}

// The heavy lifting (and caching) lives server-side: ai-internal only runs
// the analysis agent when its cached insight was invalidated by a significant
// transaction, so this hook can poll cheaply and rarely.
export const useSpendingInsight = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [KEY],
    queryFn: () =>
      api
        .get<SpendingInsightResponse>(`${BFF_BASE_URL}/ai/insights`)
        .then((res) => res.data),
    enabled: options?.enabled ?? true,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
