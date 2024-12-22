import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../utils/api"

export const useTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: () => api.get(`/api/bff/transactions`).then((res) => res.data),
  })
}

export const useAddTransaction = () => {
  const queryClient = useQueryClient()
  interface Transaction {
    id: string
    amount: number
    date: string
    description: string
  }

  interface NewTransaction {
    amount: number
    date: string
    description: string
  }

  return useMutation<Transaction, Error, NewTransaction>({
    mutationFn: (newTransaction: NewTransaction) =>
      api
        .post("/api/transactions", newTransaction)
        .then((res: { data: Transaction }) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
    },
  })
}
