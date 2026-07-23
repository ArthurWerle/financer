import { BFF_BASE_URL } from "@/constants"
import api from "@/utils/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { KEY, type SpendingInsightResponse } from "./useSpendingInsight"

// Forces ai-internal to regenerate the spending insight (the BFF forwards the
// refresh flag to ai-internal's /insights?refresh=true), then primes and
// invalidates the cached insight so the header updates immediately.
export const useRebuildInsights = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      api
        .get<SpendingInsightResponse>(`${BFF_BASE_URL}/ai/insights`, {
          params: { refresh: "true" },
        })
        .then((res) => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData([KEY], data)
      queryClient.invalidateQueries({ queryKey: [KEY] })
    },
  })
}
