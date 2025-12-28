import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isInView) {
      let start = 0
      const end = value
      const duration = 1500
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        setDisplayValue(Math.round(start + (end - start) * easeOutQuart))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [isInView, value])

  return (
    <span ref={ref} className="font-mono font-bold">
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function TokenStats() {
  const [showConversion, setShowConversion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.5 })

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShowConversion(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [isInView])

  return (
    <div className="my-8 rounded-lg border border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-background),95%,var(--theme-accent))] p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">▶</span>
          Tokens vs Words
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex flex-col items-center justify-center py-8"
        style={{ minHeight: '280px' }}
      >
        {/* Initial value */}
        <motion.div
          className="text-center"
          animate={{ opacity: showConversion ? 0.5 : 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-sm text-[var(--theme-muted)] mb-2">API Context Limit</div>
          <div className="text-4xl text-[var(--theme-accent)]">
            <AnimatedCounter value={4096} /> tokens
          </div>
        </motion.div>

        {/* Animated arrow - reserved space */}
        <div className="h-20 flex items-center justify-center overflow-visible">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showConversion ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-[var(--theme-muted)] p-2"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ overflow: 'visible' }}>
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Converted value - reserved space */}
        <div className="h-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showConversion ? 1 : 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-center"
          >
            <div className="text-sm text-[var(--theme-muted)] mb-2">≈ Actual Word Count</div>
            <div className="text-4xl text-[var(--theme-accent)]">
              <AnimatedCounter value={3000} /> words
            </div>
          </motion.div>
        </div>
      </div>

      {/* Visual comparison bar */}
      <div className="mt-4">
        <div className="mb-2 text-sm text-[var(--theme-muted)]">Visual Comparison</div>
        <div className="flex h-8 overflow-hidden rounded-full border border-[var(--theme-accent)]/30">
          {/* Tokens bar */}
          <motion.div
            className="bg-blue-600 flex items-center justify-center text-white text-xs font-medium"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: isInView ? 0.5 : 0, duration: 1 }}
          >
            Tokens
          </motion.div>
        </div>
        <div className="mt-2 flex h-8 overflow-hidden rounded-full border border-[var(--theme-accent)]/30">
          {/* Words bar */}
          <motion.div
            className="bg-orange-500 flex items-center justify-center text-white text-xs font-medium"
            initial={{ width: 0 }}
            animate={{ width: '73%' }}
            transition={{ delay: isInView ? 1.5 : 0, duration: 1 }}
          >
            Words (≈73%)
          </motion.div>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-[var(--theme-muted)]">
        <p>
          Tokens are smaller than words. Common words like "the" are one token, but
          uncommon or long words are split into multiple pieces.
        </p>
      </div>
    </div>
  )
}
