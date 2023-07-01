import Header from '@/components/header'
import RegisterList from '@/components/register-list'
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
      <Header />
      <div className='flex gap-4 mb-4'>
        <h2 className='font-bold italic text-3xl'>{period?.title}</h2>
        <button>start new</button>
      </div>
      <div className='flex justify-between'>
        <RegisterList title="Incomes" registers={period.incomes}/>
        <RegisterList title="Outcomes" registers={period.outcomes}/>
        <div className='flex flex-1 gap-4'>
          <p className='italic text-xl'>Insights</p>
        </div>
      </div>
    </main>
  )
}