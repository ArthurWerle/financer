import { periodAtom } from '@/atoms/period'
import Header from '@/components/header'
import RegisterList from '@/components/register-list'
import { Period } from '@/types'
import { atom, useAtom } from 'jotai'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useEffect } from 'react'
import { AiOutlineArrowRight } from 'react-icons/ai'

export const getServerSideProps: GetServerSideProps<{ rawPeriod: Period }> = async () => {
  const periodResponse = await fetch(process.env.NEXT_PUBLIC_REQUEST_URL + '/api/period')
  const period = await periodResponse.json() as Period

  return { props: { rawPeriod: period } }
}

export default function Page({ rawPeriod }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [period, setPeriod] = useAtom(periodAtom)

  const incomes = period?.register?.filter(register => register.type === 'income')
  const outcomes = period?.register?.filter(register => register.type === 'outcome')

  useEffect(() => setPeriod(rawPeriod), [rawPeriod.id])

  return ( 
    <main>
      <Header />
      <div className='flex gap-4 mb-4'>
        <h2 className='font-bold italic text-3xl'>{period?.title}</h2>
        <button className='flex gap-2 items-center hover:scale-95 transition-transform italic'>
          start new <AiOutlineArrowRight />
        </button>
      </div>
      <div className='flex justify-between'>
        <RegisterList title="Incomes" registers={incomes} type='income' />
        <RegisterList title="Outcomes" registers={outcomes} type='outcome' />
        <div className='flex flex-1 gap-4'>
          <p className='italic text-xl'>Insights</p>
        </div>
      </div>
    </main>
  )
}