import { BFF_BASE_URL } from "@/src/constants"
import { RecurringTransaction } from "@/src/types/recurring-transaction"
import { Transaction } from "@/src/types/transaction"
import api from "@/src/utils/api"
import { useQuery } from "@tanstack/react-query"

export const KEY = '/all-transactions'

type TransactionResponseType = Transaction & RecurringTransaction

export const useTransactions = () => {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => api.get<TransactionResponseType[]>(`${BFF_BASE_URL}/all-transactions`).then((res) => res.data),
    refetchOnWindowFocus: false
  })
}