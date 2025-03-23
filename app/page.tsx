"use client"

import { Statistics } from "@/components/statistics"
// import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useMonthOverview } from "@/queries/transactions/useMonthOverview"


export default function Home() {
  const { data: response, isLoading } = useMonthOverview()
  const { income, expense } = response || {}
  const totalBalance = (income?.currentMonth ?? 0) - (expense?.currentMonth ?? 0)
 
  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-8">
    <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Hello, Arthur</h1>
          <p className="text-muted-foreground">This is your finance report</p>
        </div>
        <div className="flex gap-12">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className="text-3xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                }).format(totalBalance)}
            </p>
          </div>
        </div>
    </div>
    <Statistics />
    {/* <RecentTransactions /> */}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-12 w-[250px]" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[125px]" />
        <Skeleton className="h-[125px]" />
        <Skeleton className="h-[125px]" />
        <Skeleton className="h-[125px]" />
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  )
}

// function RecentTransactions() {
//   const { data: response, isLoading } = useCurrentMonthTransactions()
  
//   return (
//     <Card className="p-6">
//       <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
//       {response?.transactions.map((transaction) => (
//         <div
//           key={transaction.id}
//           className="flex justify-between items-center py-2 border-b last:border-b-0"
//         >
//           <div>
//             <p className="font-medium">{transaction.description}</p>
//             <p className="text-sm text-muted-foreground">
//               {new Date(transaction.date).toLocaleDateString()}
//             </p>
//           </div>
//           <p
//             className={
//               transaction.amount > 0 ? "text-green-600" : "text-red-600"
//             }
//           >
//             {new Intl.NumberFormat("en-US", {
//               style: "currency",
//               currency: "USD",
//             }).format(transaction.amount)}
//           </p>
//         </div>
//       ))}
//     </Card>
//   )
// }
