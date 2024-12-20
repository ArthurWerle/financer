import { Statistics } from './components/Statistics'

export default function Home() {
  return (
    <div className="flex flex-col gap-6 mb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Good morning, Arthur</h1>
          <p className="text-muted-foreground">This is your finance report</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">My balance</p>
          <p className="text-3xl font-bold">$83,172.64</p>
          <p className="text-sm text-green-600">+6.7% compare to last month</p>
        </div>
      </div>
      <Statistics />
    </div>
  )
}

