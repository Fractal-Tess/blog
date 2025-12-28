import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { Token } from './types'

// Simple tokenizer for demo purposes (not a real tokenizer)
function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  const words = text.split(/\s+/)

  words.forEach((word) => {
    // Split punctuation from words
    const parts = word.split(/([.,!?;:'"()])/)
    parts
      .filter((p) => p.length > 0)
      .forEach((part, i) => {
        tokens.push({
          id: Math.floor(Math.random() * 50000),
          text: part,
          type: /[.,!?;:'"()]/.test(part)
            ? 'punctuation'
            : part.length > 8 || part.includes('-')
              ? 'subword'
              : 'word',
        })
      })
  })

  return tokens
}

const tokenColors = {
  word: 'bg-blue-600 text-white',
  subword: 'bg-orange-500 text-white',
  punctuation: 'bg-gray-600 text-gray-100',
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const tokenVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8 },
}

export default function TokenizerInteractive() {
  const [input, setInput] = useState('I love programming. It is awesome!')

  const tokens = useMemo(() => tokenize(input), [input])

  return (
    <div className="my-8 rounded-lg border border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-background),95%,var(--theme-accent))] p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">▶</span>
          Interactive Tokenizer
        </span>
      </div>

      {/* Input field */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full rounded-lg border-2 border-[var(--theme-accent)] bg-[var(--theme-background)] px-4 py-3 text-[var(--theme-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]"
        placeholder="Type something to tokenize..."
        aria-label="Text input for tokenization"
      />

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--theme-muted)]">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-blue-600" /> Common words
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-orange-500" /> Subwords
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-gray-600" /> Punctuation
        </span>
      </div>

      {/* Token output */}
      <div className="mt-4 min-h-[120px] rounded-lg border-2 border-dashed border-[var(--theme-accent)]/30 bg-[color-mix(in_srgb,var(--theme-background),98%,var(--theme-accent))] p-4">
        <AnimatePresence mode="popLayout">
          {tokens.length > 0 ? (
            <motion.div
              key="tokens"
              className="flex flex-wrap gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {tokens.map((token, index) => (
                <motion.div
                  key={`${token.text}-${index}`}
                  variants={tokenVariants}
                  layout
                  className="relative"
                >
                  <motion.span
                    className={`
                      inline-block rounded px-3 py-1.5 font-mono text-sm
                      ${tokenColors[token.type]}
                    `}
                    whileHover={{ scale: 1.05, rotate: [-1, 1, -1] }}
                    transition={{ duration: 0.2 }}
                  >
                    {token.text}
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      className="ml-2 text-xs"
                    >
                      #{token.id}
                    </motion.span>
                  </motion.span>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[var(--theme-muted)]"
            >
              Type something above to see tokens
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="mt-3 flex items-center justify-between text-sm text-[var(--theme-muted)]">
        <span>Total tokens: {tokens.length}</span>
        <span>
          Words: {tokens.filter((t) => t.type === 'word').length} •
          Subwords: {tokens.filter((t) => t.type === 'subword').length} •
          Punctuation: {tokens.filter((t) => t.type === 'punctuation').length}
        </span>
      </div>
    </div>
  )
}
