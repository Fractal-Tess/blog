import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import type { AttentionWeight } from './types'

const ATTENTION_DATA: AttentionWeight[] = [
  { word: 'The', weight: 0.02, position: 0 },
  { word: 'cat', weight: 0.78, position: 1 },
  { word: 'sat', weight: 0.03, position: 2 },
  { word: 'on', weight: 0.01, position: 3 },
  { word: 'the', weight: 0.02, position: 4 },
  { word: 'mat', weight: 0.12, position: 5 },
  { word: 'because', weight: 0.01, position: 6 },
  { word: 'it', weight: 1.0, position: 7 }, // Focus word
  { word: 'was', weight: 0.01, position: 8 },
  { word: 'tired', weight: 0.45, position: 9 },
]

const TARGET_INDEX = 7 // "it"

function AttentionLine({
  fromX, fromY, toX, toY, weight, delay
}: {
  fromX: number; fromY: number; toX: number; toY: number; weight: number; delay: number
}) {
  const isHighWeight = weight > 0.5
  const midX = (fromX + toX) / 2
  const midY = Math.min(fromY, toY) - 30 - (weight * 40)

  const path = `M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`

  return (
    <motion.path
      d={path}
      stroke={isHighWeight ? '#3B82F6' : '#6B7280'}
      strokeWidth={isHighWeight ? 3 : 1.5}
      strokeOpacity={0.3 + weight * 0.7}
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      exit={{ pathLength: 0, opacity: 0 }}
      transition={{ duration: 0.5, delay }}
    />
  )
}

export default function AttentionExample() {
  const [showWeights, setShowWeights] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([])

  // Calculate word positions for drawing lines
  useEffect(() => {
    if (!containerRef.current) return

    const updatePositions = () => {
      const containerRect = containerRef.current?.getBoundingClientRect()
      if (!containerRect) return

      const newPositions = wordRefs.current.map((ref) => {
        if (!ref) return { x: 0, y: 0 }
        const rect = ref.getBoundingClientRect()
        return {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        }
      })
      setPositions(newPositions)
    }

    updatePositions()
    window.addEventListener('resize', updatePositions)
    return () => window.removeEventListener('resize', updatePositions)
  }, [showWeights])

  const targetPosition = positions[TARGET_INDEX]

  return (
    <div className="my-8 rounded-lg border border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-background),95%,var(--theme-accent))] p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-lg font-semibold">
          Attention in Action
        </span>
        <button
          onClick={() => setShowWeights(!showWeights)}
          className="rounded px-3 py-1 text-sm font-medium border-2 border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[var(--theme-background)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-background)] transition-colors"
        >
          {showWeights ? 'Hide' : 'Show'} Attention
        </button>
      </div>

      <div className="text-sm text-[var(--theme-muted)] mb-4">
        <p>What does "it" refer to? Watch how the model assigns attention to figure it out.</p>
      </div>

      <div
        ref={containerRef}
        className="relative rounded-lg border border-[var(--theme-accent)]/20 bg-gradient-to-b from-[#0a0a0f] to-[#1a1a2e] p-8 pb-48"
      >
        {/* SVG layer for attention lines */}
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: showWeights ? 1 : 0 }}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible' }}
        >
          {showWeights && positions.length > 0 && targetPosition && ATTENTION_DATA.map((item, i) => {
            if (i === TARGET_INDEX || !positions[i]) return null
            const weight = item.weight
            if (weight < 0.05) return null // Skip very low weights

            return (
              <AttentionLine
                key={item.position}
                fromX={targetPosition.x}
                fromY={targetPosition.y}
                toX={positions[i].x}
                toY={positions[i].y}
                weight={weight}
                delay={i * 0.05}
              />
            )
          })}
        </motion.svg>

        {/* Words */}
        <div className="relative flex flex-wrap items-center justify-center gap-x-3 gap-y-8 pt-16 pb-8">
          {ATTENTION_DATA.map((item, i) => {
            const isTarget = i === TARGET_INDEX
            const isHighAttention = item.weight > 0.5
            const barHeight = Math.max(4, item.weight * 50)

            return (
              <div key={item.position} className="relative" style={{ minHeight: isTarget ? '0' : `${barHeight + 30}px` }}>
                {/* Attention bar above word - always rendered but visibility controlled */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: showWeights ? barHeight : 0, opacity: showWeights ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-full w-1.5 rounded-full"
                  style={{
                    background: `linear-gradient(to top, var(--theme-accent), ${item.weight > 0.5 ? '#3B82F6' : '#6B7280'})`,
                  }}
                />

                {/* Weight label - positioned above the bar */}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showWeights && !isTarget && item.weight > 0.01 ? 1 : 0 }}
                  style={{
                    top: `-${barHeight + 20}px`,
                  }}
                  className={`
                    absolute left-1/2 -translate-x-1/2 text-xs font-mono whitespace-nowrap
                    ${isHighAttention ? 'text-blue-400 font-bold' : 'text-gray-500'}
                  `}
                >
                  {(item.weight * 100).toFixed(0)}%
                </motion.span>

                {/* Word */}
                <motion.span
                  ref={(el) => { wordRefs.current[i] = el }}
                  className={`
                    relative inline-block px-3 py-1.5 rounded-lg font-mono text-lg
                    ${isTarget
                      ? 'bg-[var(--theme-accent)] text-[var(--theme-background)] font-bold shadow-lg shadow-[var(--theme-accent)]/30'
                      : showWeights && isHighAttention
                        ? 'bg-blue-500/20 text-blue-300 font-semibold'
                        : 'text-white/70'
                    }
                  `}
                  animate={{
                    scale: showWeights && isHighAttention ? 1.1 : 1,
                    opacity: showWeights ? (isTarget ? 1 : 0.4 + item.weight * 0.6) : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {item.word}
                </motion.span>
              </div>
            )
          })}
        </div>

        {/* Explanation panel - reserved space at bottom */}
        <div className="absolute bottom-8 left-8 right-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showWeights ? 1 : 0 }}
            transition={{ delay: showWeights ? 0.3 : 0 }}
            className="p-4 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10"
          >
            <p className="text-white font-medium mb-1">
              "it" focuses heavily on "cat" (78%) — not "mat" (12%)
            </p>
            <p className="text-gray-400 text-sm">
              Why? Because <span className="text-[var(--theme-accent)] font-semibold">"was tired"</span> describes
              living things, not objects. The model learned this pattern from millions of examples where
              pronouns refer to animate subjects.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom insight */}
      <div className="mt-4 text-center text-sm text-[var(--theme-muted)]">
        <p>Attention doesn't just look at nearby words—it understands semantic relationships.</p>
      </div>
    </div>
  )
}
