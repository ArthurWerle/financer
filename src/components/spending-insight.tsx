'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Markdown } from '@/components/markdown'
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
// every page. The insight is a short headline (first line) plus an optional
// detailed markdown body (the rest), which the user can expand on demand.
// Renders nothing while loading or on failure — the insight is a nice-to-have
// and must never block or clutter the page.
export function SpendingInsight() {
  const pathname = usePathname()
  const isLogin = pathname === '/login'
  const { data } = useSpendingInsight({ enabled: !isLogin })
  const [expanded, setExpanded] = useState(false)

  const raw = data?.insight?.trim()

  if (isLogin || !raw) {
    return null
  }

  const newlineIndex = raw.indexOf('\n')
  const headline = newlineIndex === -1 ? raw : raw.slice(0, newlineIndex).trim()
  const details = newlineIndex === -1 ? '' : raw.slice(newlineIndex + 1).trim()

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
      <div className="min-w-0 flex-1">
        <motion.p
          key={headline}
          variants={sentence}
          initial="hidden"
          animate="visible"
          className="text-[14.5px] leading-[1.55] text-muted-foreground"
        >
          <span className="font-medium text-foreground">Monthly insight — </span>
          {headline.split(/\s+/).map((token, index) => (
            <motion.span key={index} variants={word} className="inline-block">
              {token}&nbsp;
            </motion.span>
          ))}
        </motion.p>

        {details ? (
          <>
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  expanded && 'rotate-180'
                )}
                aria-hidden="true"
              />
              {expanded ? 'Hide details' : 'Show details'}
            </button>

            <AnimatePresence initial={false}>
              {expanded ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 border-t border-border pt-2 text-muted-foreground">
                    <Markdown>{details}</Markdown>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </>
        ) : null}
      </div>
    </motion.div>
  )
}
