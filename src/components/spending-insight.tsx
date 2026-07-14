'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Space_Grotesk } from 'next/font/google'
import { usePathname } from 'next/navigation'
import { useSpendingInsight } from '@/queries/insights/useSpendingInsight'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500'],
})

const sentence = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.035, delayChildren: 0.25 },
  },
}

const word = {
  hidden: { opacity: 0, y: 6, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

// AI analysis of the current month spendings, shown in the header section of
// every page. Renders nothing while loading or on failure — the insight is a
// nice-to-have and must never block or clutter the page.
export function SpendingInsight() {
  const pathname = usePathname()
  const isLogin = pathname === '/login'
  const { data } = useSpendingInsight({ enabled: !isLogin })
  const insight = data?.insight?.trim()

  if (isLogin || !insight) {
    return null
  }

  return (
    <motion.div
      data-testid="spending-insight"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`${spaceGrotesk.className} mb-6 flex items-start gap-2.5 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-sky-50 px-4 py-3 shadow-sm`}
    >
      <motion.span
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
        className="mt-0.5 shrink-0"
        aria-hidden="true"
      >
        <Sparkles className="h-4 w-4 text-violet-500" />
      </motion.span>
      <motion.p
        variants={sentence}
        initial="hidden"
        animate="visible"
        className="text-sm font-medium leading-relaxed text-gray-800"
      >
        {insight.split(/\s+/).map((token, index) => (
          <motion.span key={index} variants={word} className="inline-block">
            {token}
            {' '}
          </motion.span>
        ))}
      </motion.p>
    </motion.div>
  )
}
