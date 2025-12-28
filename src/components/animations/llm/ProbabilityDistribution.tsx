import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { Probability } from './types'

const PROBABILITIES: Probability[] = [
  { token: 'is', probability: 0.23, rank: 1 },
  { token: 'really', probability: 0.14, rank: 2 },
  { token: 'the', probability: 0.09, rank: 3 },
  { token: 'a', probability: 0.07, rank: 4 },
  { token: 'an', probability: 0.05, rank: 5 },
  { token: 'was', probability: 0.04, rank: 6 },
  { token: 'can', probability: 0.03, rank: 7 },
  { token: 'will', probability: 0.02, rank: 8 },
  { token: 'has', probability: 0.015, rank: 9 },
  { token: 'does', probability: 0.01, rank: 10 },
]

const CONTEXT = 'What ### Python'

export default function ProbabilityDistribution() {
  const [hoveredToken, setHoveredToken] = useState<string | null>(null)
  const [selectedToken, setSelectedToken] = useState<string | null>(null)

  const maxProb = Math.max(...PROBABILITIES.map((p) => p.probability))

  return (
    <div className="my-8 rounded-lg border border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-background),95%,var(--theme-accent))] p-6">
      <div className="text-sm text-[var(--theme-muted)] mb-4">
        <p>
          For the context <span className="font-mono bg-[var(--theme-accent)]/10 px-1 rounded">{CONTEXT}</span>,
          here's the probability distribution for the next token:
        </p>
      </div>

      <div className="space-y-2">
        {PROBABILITIES.map((item) => (
          <motion.div
            key={item.token}
            className={`
              relative flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer
              ${
                selectedToken === item.token
                  ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/10'
                  : 'border-[var(--theme-accent)]/30 bg-transparent hover:border-[var(--theme-accent)]'
              }
            `}
            onClick={() => setSelectedToken(selectedToken === item.token ? null : item.token)}
            onMouseEnter={() => setHoveredToken(item.token)}
            onMouseLeave={() => setHoveredToken(null)}
            whileHover={{ scale: 1.01 }}
            animate={{
              scale: selectedToken === item.token ? 1.02 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {/* Rank */}
            <div className="w-8 text-center font-mono text-sm text-[var(--theme-muted)]">
              #{item.rank}
            </div>

            {/* Token */}
            <div className="w-16 font-mono font-semibold text-[var(--theme-foreground)]">
              {item.token}
            </div>

            {/* Probability bar */}
            <div className="flex-1 h-8 rounded-full bg-[color-mix(in_srgb,var(--theme-background),90%,var(--theme-accent))] overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(item.probability / maxProb) * 100}%` }}
                transition={{ duration: 0.8, delay: item.rank * 0.05 }}
              />
            </div>

            {/* Percentage */}
            <div className="w-16 text-right font-mono text-sm text-[var(--theme-foreground)]">
              {(item.probability * 100).toFixed(1)}%
            </div>

            {/* Hover tooltip */}
            <AnimatePresence>
              {hoveredToken === item.token && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -top-8 right-4 rounded bg-[var(--theme-accent)] px-2 py-1 text-xs text-[var(--theme-background)]"
                >
                  1 in {Math.round(1 / item.probability)} chance
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Remaining tokens */}
      <motion.div
        className="mt-3 rounded-lg bg-[var(--theme-muted)]/10 p-3 text-center text-sm text-[var(--theme-muted)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        + 127,990 more tokens with smaller probabilities
      </motion.div>

      {/* Selected token explanation */}
      <AnimatePresence>
        {selectedToken && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 rounded-lg border border-[var(--theme-accent)] bg-[var(--theme-accent)]/5 p-4"
          >
            <p className="text-sm">
              <span className="font-semibold text-[var(--theme-accent)]">"{selectedToken}"</span> has a{' '}
              <span className="font-mono">
                {(PROBABILITIES.find((p) => p.token === selectedToken)?.probability || 0) * 100}%
              </span>{' '}
              probability of being selected. The model doesn't "decide"—it samples from this distribution.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
