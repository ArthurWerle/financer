'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  ArrowLeftRight,
  Tag,
  MapPin,
  BarChart2,
  History,
  MessageSquare,
  Settings,
  ChevronsUpDown,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useMe } from '@/queries/auth/useMe'
import { logout } from '@/queries/auth/logout'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/history', label: 'History', icon: History },
  { href: '/chat', label: 'Assistant', icon: MessageSquare },
]

const getInitials = (name?: string) => {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

const BrandMark = () => (
  <div className="flex items-center gap-2.5 px-2 pb-4 pt-1">
    <div className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-foreground">
      <Image
        src="/favicon-32x32.png"
        alt="Financer"
        width={16}
        height={16}
        className="object-contain"
      />
    </div>
    <span className="text-sm font-semibold tracking-[-0.01em]">Financer</span>
  </div>
)

const NavLinks = ({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) => {
  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))

  return (
    <nav className="flex flex-col gap-0.5">
      {menuItems.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-md px-[9px] py-[7px] text-[13px] font-medium transition-colors ${
              active
                ? 'bg-panel2 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={15} strokeWidth={1.8} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

const SidebarFooter = ({ onNavigate }: { onNavigate?: () => void }) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: user } = useMe()

  const handleSettings = () => {
    onNavigate?.()
    router.push('/settings')
  }

  const handleLogout = async () => {
    onNavigate?.()
    try {
      await logout()
    } finally {
      queryClient.clear()
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <div className="mt-auto border-t border-border pt-2.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Open user menu"
            className="flex w-full items-center gap-2.5 rounded-md px-[9px] py-2 text-left transition-colors hover:bg-panel2"
          >
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-border bg-panel2 font-mono text-[10px] font-semibold">
              {getInitials(user?.name)}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-medium">
                {user?.name ?? 'Signed in'}
              </span>
              <span className="truncate font-mono text-[10.5px] text-faint">
                {user?.email}
              </span>
            </div>
            <ChevronsUpDown size={14} className="shrink-0 text-faint" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-[196px]">
          <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

const Sidebar = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  if (pathname === '/login') {
    return null
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-foreground">
            <Image
              src="/favicon-32x32.png"
              alt="Financer"
              width={16}
              height={16}
              className="object-contain"
            />
          </div>
          <span className="text-sm font-semibold tracking-[-0.01em]">
            Financer
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/55 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-[216px] flex-col border-r border-border bg-card p-2.5"
            >
              <BrandMark />
              <NavLinks pathname={pathname} onNavigate={() => setIsOpen(false)} />
              <SidebarFooter onNavigate={() => setIsOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="hidden w-[216px] shrink-0 flex-col border-r border-border bg-card p-2.5 md:flex">
        <BrandMark />
        <NavLinks pathname={pathname} />
        <SidebarFooter />
      </aside>
    </>
  )
}

export default Sidebar
