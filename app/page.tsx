'use client'

import { Statistics } from '@/components/statistics'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'
import { useMonthOverview } from '@/queries/transactions/useMonthOverview'
import { useMe } from '@/queries/auth/useMe'

export default function Home() {
  const { isLoading } = useMonthOverview()
  const { data: user } = useMe()
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={`Hello, ${firstName}`}
        subtitle="This is your finance report"
      />
      <Statistics />
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
