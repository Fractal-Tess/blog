import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import type { Logit } from './types'

// Simulated logits for "What ### Python"
const BASE_LOGITS: Logit[] = [
  { token: 'is', logitValue: 2.5 },
  { token: 'really', logitValue: 1.8 },
  { token: 'the', logitValue: 1.2 },
  { token: 'a', logitValue: 0.9 },
  { token: 'an', logitValue: 0.5 },
  { token: 'was', logitValue: 0.3 },
  { token: 'can', logitValue: 0.1 },
  { token: 'will', logitValue: -0.2 },
  { token: 'has', logitValue: -0.5 },
  { token: 'does', logitValue: -0.8 },
]

// Softmax function
function softmax(logits: number[], temperature: number): number[] {
  const scaled = logits.map((l) => l / temperature)
  const max = Math.max(...scaled)
  const exps = scaled.map((e) => Math.exp(e - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / sum)
}

// Sample from distribution
function sample(tokens: string[], probs: number[]): string {
  const r = Math.random()
  let cumsum = 0
  for (let i = 0; i < probs.length; i++) {
    cumsum += probs[i]
    if (r < cumsum) return tokens[i]
  }
  return tokens[tokens.length - 1]
}

export default function SamplingVisualization() {
  const [temperature, setTemperature] = useState(0.7)
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [isSampling, setIsSampling] = useState(false)

  const probabilities = useMemo(() => {
    const logits = BASE_LOGITS.map((l) => l.logitValue)
    return softmax(logits, temperature)
  }, [temperature])

  const handleSample = () => {
    setIsSampling(true)
    const tokens = BASE_LOGITS.map((l) => l.token)
    const selected = sample(tokens, probabilities)
    setSelectedToken(selected)
    setTimeout(() => setIsSampling(false), 500)
  }

  const getTemperatureLabel = (temp: number) => {
    if (temp < 0.4) return { label: 'Low', desc: 'Predictable, consistent' }
    if (temp < 0.8) return { label: 'Medium', desc: 'Balanced exploration' }
    return { label: 'High', desc: 'Creative, varied' }
  }

  const tempInfo = getTemperatureLabel(temperature)

  return (
    <div className="my-8 rounded-lg border border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-background),95%,var(--theme-accent))] p-6">
      <div className="text-sm text-[var(--theme-muted)] mb-4">
        <p>Adjust temperature to see how it affects the probability distribution and sampling.</p>
      </div>

      {/* Temperature slider */}
      <div className="mb-6 rounded-lg bg-[var(--theme-background)] p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-semibold text-[var(--theme-foreground)]">Temperature: {temperature.toFixed(2)}</span>
          <span className={`px-2 py-1 rounded text-xs ${
            temperature < 0.4 ? 'bg-blue-600 text-white' :
            temperature < 0.8 ? 'bg-yellow-500 text-white' :
            'bg-red-500 text-white'
          }`}>
            {tempInfo.label}
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.5"
          step="0.05"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full h-2 bg-[var(--theme-muted)]/20 rounded-lg appearance-none cursor-pointer accent-[var(--theme-accent)]"
          aria-label="Temperature slider"
        />
        <div className="mt-2 flex justify-between text-xs text-[var(--theme-muted)]">
          <span>0.1 (Predictable)</span>
          <span>{tempInfo.desc}</span>
          <span>1.5 (Chaotic)</span>
        </div>
      </div>

      {/* Probability bars */}
      <div className="mb-4 space-y-1">
        <div className="flex items-center gap-2 text-xs text-[var(--theme-muted)] mb-2">
          <span className="w-12">Token</span>
          <span className="flex-1">Probability</span>
          <span className="w-16 text-right">%</span>
        </div>
        {BASE_LOGITS.map((item, index) => (
          <motion.div
            key={item.token}
            className="flex items-center gap-2"
            layout
          >
            <span className="w-12 font-mono text-sm text-[var(--theme-foreground)]">{item.token}</span>
            <div className="flex-1 h-5 rounded-full bg-[color-mix(in_srgb,var(--theme-background),90%,var(--theme-accent))] overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                layout
                animate={{ width: `${Math.max(probabilities[index] * 100, 2)}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
            <span className="w-16 text-right font-mono text-xs text-[var(--theme-foreground)]">
              {(probabilities[index] * 100).toFixed(1)}%
            </span>
          </motion.div>
        ))}
      </div>

      {/* Sample button and result */}
      <div className="flex items-center gap-4">
        <motion.button
          onClick={handleSample}
          disabled={isSampling}
          className="rounded px-6 py-2 font-semibold border-2 border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[var(--theme-background)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-background)] transition-colors disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSampling ? 'Sampling...' : 'Sample Token'}
        </motion.button>

        <AnimatePresence>
          {selectedToken && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="rounded-lg border-2 border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 px-4 py-2"
            >
              <span className="text-sm text-[var(--theme-muted)]">Selected: </span>
              <span className="font-mono text-lg font-bold text-[var(--theme-accent)]">"{selectedToken}"</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Temperature explanation */}
      <div className="mt-4 rounded-lg border border-[var(--theme-accent)]/30 p-3 text-sm text-[var(--theme-muted)]">
        <p>
          <span className="font-semibold text-[var(--theme-foreground)]">How temperature works:</span>{' '}
          Low temperature = sharp distribution (high-probability tokens dominate).{' '}
          High temperature = flat distribution (unlikely tokens get a real chance).
        </p>
      </div>
    </div>
  )
}
