'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSpendingInsight } from '@/queries/insights/useSpendingInsight'

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
      className="flex items-start gap-2.5 rounded-[9px] border border-border bg-card px-3.5 py-[11px]"
    >
      <Sparkles
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <motion.p
        variants={sentence}
        initial="hidden"
        animate="visible"
        className="text-[12.5px] leading-[1.55] text-muted-foreground"
      >
        <span className="font-medium text-foreground">Monthly insight — </span>
        {insight.split(/\s+/).map((token, index) => (
          <motion.span key={index} variants={word} className="inline-block">
            {token}
            {' '}
          </motion.span>
        ))}
      </motion.p>
    </motion.div>
  )
}
