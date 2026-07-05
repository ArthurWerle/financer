'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Menu, X } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AddExpense } from './add-expense'
import { AddIncome } from './add-income'
import { useMe } from '@/queries/auth/useMe'
import { logout } from '@/queries/auth/logout'
import Image from 'next/image'

const getInitials = (name?: string) => {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: user } = useMe()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      queryClient.clear()
      router.push('/login')
      router.refresh()
    }
  }

  if (pathname === '/login') {
    return null
  }

  const menuItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/categories', label: 'Categories' },
    { href: '/locations', label: 'Locations' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/history', label: 'History' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between py-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Image
                src="/favicon-32x32.png"
                alt="Financer Logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-semibold">Financer</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-4">
              <AddIncome />
              <AddExpense />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="hidden sm:block rounded-full"
                  aria-label="User menu"
                >
                  <Avatar>
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name ?? 'Signed in'}</span>
                    <span className="text-xs font-normal text-gray-500">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              className="md:hidden p-1"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden border-t"
            >
              <nav className="flex flex-col py-4 px-6 bg-white">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`py-2 text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'text-primary'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex gap-2 mt-4 sm:hidden">
                  <AddIncome />
                  <AddExpense />
                </div>
                <button
                  className="flex items-center gap-2 py-2 mt-4 text-sm font-medium text-gray-600 hover:text-gray-900 sm:hidden"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Header
