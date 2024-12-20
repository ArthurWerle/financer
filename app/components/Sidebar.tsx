import Link from 'next/link'
import { Home, PlusCircle, BarChart2, Tag, Calendar } from 'lucide-react'

const Sidebar = () => {
  return (
    <div className="w-64 bg-[#121212] text-gray-300 p-5 space-y-6">
      <h1 className="text-2xl font-bold text-white mb-10">FinanceFlow</h1>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link href="/" className="flex items-center space-x-3 hover:text-white transition-colors">
              <Home size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/add-transaction" className="flex items-center space-x-3 hover:text-white transition-colors">
              <PlusCircle size={20} />
              <span>Add Transaction</span>
            </Link>
          </li>
          <li>
            <Link href="/monthly-balance" className="flex items-center space-x-3 hover:text-white transition-colors">
              <BarChart2 size={20} />
              <span>Monthly Balance</span>
            </Link>
          </li>
          <li>
            <Link href="/categories" className="flex items-center space-x-3 hover:text-white transition-colors">
              <Tag size={20} />
              <span>Categories</span>
            </Link>
          </li>
          <li>
            <Link href="/subscriptions" className="flex items-center space-x-3 hover:text-white transition-colors">
              <Calendar size={20} />
              <span>Subscriptions</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar

