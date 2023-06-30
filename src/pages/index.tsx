import { Period } from '@/types'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

export const getServerSideProps: GetServerSideProps<{ period: Period }> = async () => {
  const periodResponse = await fetch(process.env.NEXT_PUBLIC_REQUEST_URL + '/api/period')
  const period = await periodResponse.json() as Period

  const incomesResponse = await fetch(`${process.env.NEXT_PUBLIC_REQUEST_URL}/api/period/${period.id}/income`)
  period.incomes = await incomesResponse.json()

  const outcomesResponse = await fetch(`${process.env.NEXT_PUBLIC_REQUEST_URL}/api/period/${period.id}/outcome`)
  period.outcomes = await outcomesResponse.json()

  return { props: { period } }
}

export default function Page({ period }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return ( 
    <main>
      <header className='my-6'>
        <h1 className='font-bold text-4xl'>Financer</h1>
      </header>
      <h2 className='font-bold italic text-3xl mb-2'>{period?.title}</h2>
      <div className='flex justify-between'>
        <div>
          <div className='flex gap-4'>
            <p className='italic text-xl'>Incomes</p>
            <button>add</button>
          </div>
          {period.incomes?.map((income) => (
            <div key={income.id}>{income.amount}</div>
          ))}
        </div>
        <div>
          <div className='flex gap-4'>
            <p className='italic text-xl'>Outcomes</p>
            <button>add</button>
          </div>
          {period.outcomes?.map((outcome) => (
            <div key={outcome.id}>{outcome.amount}</div>
          ))}
        </div>
        <div className='flex gap-4'>
          <p className='italic text-xl'>Insights</p>
        </div>
      </div>
    </main>
  )
}
