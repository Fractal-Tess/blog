import { motion, useReducedMotion } from 'framer-motion'

interface TokenData {
  text: string
  id: number
}

// Token data for "I love programming. It's awesome."
const TOKEN_DATA: TokenData[] = [
  { text: 'I', id: 40 },
  { text: 'love', id: 1337 },
  { text: 'programming', id: 5421 },
  { text: '.', id: 13 },
  { text: 'It', id: 712 },
  { text: "'s", id: 89 },
  { text: 'awesome', id: 8432 },
  { text: '.', id: 13 },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const tokenVariants = {
  hidden: ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => ({
    opacity: 0,
    y: prefersReducedMotion ? 0 : 20,
    scale: prefersReducedMotion ? 1 : 0.8,
  }),
  visible: ({ index, prefersReducedMotion }: { index: number; prefersReducedMotion: boolean }) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: prefersReducedMotion ? 0 : index * 0.08,
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  }),
}

const underlineVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      delay: 1.5,
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

const idVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 2,
      duration: 0.3,
    },
  },
}

export default function TokenVisualization() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="my-8 rounded-lg border border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-background),95%,var(--theme-accent))] p-8">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">▶</span>
          Tokenization in Action
        </span>
      </div>

      <motion.div
        className="flex flex-wrap items-end justify-center gap-3 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {TOKEN_DATA.map((token, index) => (
          <motion.div
            key={`${token.text}-${index}`}
            custom={{ index, prefersReducedMotion }}
            variants={tokenVariants}
            className="relative inline-block"
          >
            <motion.span
              className={`
                relative inline-block px-3 py-2 rounded-lg text-lg font-mono
                ${/[.,!?]/.test(token.text) ? 'bg-gray-600 text-gray-100' : 'bg-blue-600 text-white'}
              `}
            >
              {token.text}

              {/* Animated underline */}
              <motion.div
                variants={underlineVariants}
                className="absolute bottom-0 left-0 h-0.5 w-full bg-yellow-400 origin-left"
              />

              {/* Token ID - always visible */}
              <motion.div
                variants={idVariants}
                className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-[var(--theme-muted)] font-mono"
              >
                #{token.id}
              </motion.div>
            </motion.span>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-4 text-center text-[var(--theme-muted)] text-sm">
        <p>8 tokens • Common words get single tokens • Punctuation has separate tokens</p>
      </div>
    </div>
  )
}
