import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'

export const mergeLocations = async (sourceId: number, targetId: number) => {
  return await api.post(`${BFF_BASE_URL}/locations/merge`, {
    source_id: sourceId,
    target_id: targetId,
  })
}
