import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useCallback } from 'react'

const PROMPT = 'What is Python'
const RESPONSE = ['Python', 'is', 'a', 'high-level', 'programming', 'language']

const STEPS = [
  'tokenize',
  'embed',
  'transform',
  'probabilities',
  'sample',
] as const

export default function GenerationLoop() {
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState<(typeof STEPS)[number] | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  // Use refs for values that need to be accessed in async functions without
  // triggering re-renders or being captured in closures
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const speedRef = useRef(speed)
  const tokenCountRef = useRef(0)
  const generationIdRef = useRef(0)
  const isMountedRef = useRef(true)

  // Keep speedRef in sync with speed state
  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  // Update tokenCountRef when generatedTokens changes
  useEffect(() => {
    tokenCountRef.current = generatedTokens.length
  }, [generatedTokens])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Main generation function - uses useCallback to maintain a stable reference
  const runGenerationCycle = useCallback(() => {
    // Get the current generation ID - if it changes, this generation is stale
    const currentGenerationId = generationIdRef.current

    const stepDuration = 800 / speedRef.current
    let stepIndex = 0

    const runStep = async () => {
      // Check if we should stop (unmounted, generation cancelled, or paused)
      if (!isMountedRef.current || currentGenerationId !== generationIdRef.current) {
        return
      }

      // Get fresh token count from ref
      const currentCount = tokenCountRef.current

      // Check if we're done
      if (currentCount >= RESPONSE.length) {
        setIsPlaying(false)
        return
      }

      // Set current step
      if (stepIndex < STEPS.length) {
        setCurrentStep(STEPS[stepIndex])
        await new Promise((resolve) => setTimeout(resolve, stepDuration))
        stepIndex++

        // Continue to next step
        timeoutRef.current = setTimeout(runStep, 0)
        return
      }

      // All steps done - re-check token count before adding
      const latestCount = tokenCountRef.current
      if (latestCount >= RESPONSE.length) {
        setIsPlaying(false)
        return
      }

      // Add the token
      const newToken = RESPONSE[latestCount]
      if (newToken) {
        setGeneratedTokens((prev) => {
          const newTokens = [...prev, newToken]
          tokenCountRef.current = newTokens.length
          return newTokens
        })
      }

      setCurrentStep(null)

      // Wait before next cycle
      await new Promise((resolve) => setTimeout(resolve, stepDuration))

      // Check if we should continue with next token
      if (!isMountedRef.current || currentGenerationId !== generationIdRef.current) {
        return
      }

      const nextCount = tokenCountRef.current
      if (nextCount < RESPONSE.length) {
        // Reset and start next cycle
        stepIndex = 0
        timeoutRef.current = setTimeout(runStep, 200)
      } else {
        // Done!
        setIsPlaying(false)
      }
    }

    runStep()
  }, []) // Empty deps - function uses refs instead of state

  // Start/stop generation when isPlaying changes
  useEffect(() => {
    // Clean up any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Only start if playing and not finished
    if (!isPlaying || tokenCountRef.current >= RESPONSE.length) {
      if (tokenCountRef.current >= RESPONSE.length) {
        setIsPlaying(false)
      }
      return
    }

    // Increment generation ID to cancel any previous generation
    generationIdRef.current++

    // Start generation
    runGenerationCycle()

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isPlaying, runGenerationCycle])

  const reset = () => {
    // Cancel any ongoing generation
    generationIdRef.current++
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsPlaying(false)
    setGeneratedTokens([])
    setCurrentStep(null)
    tokenCountRef.current = 0
  }

  const getStepIcon = (step: (typeof STEPS)[number]) => {
    const icons = {
      tokenize: '🔤',
      embed: '🧠',
      transform: '🔄',
      probabilities: '📊',
      sample: '🎲',
    }
    return icons[step]
  }

  const getStepLabel = (step: (typeof STEPS)[number]) => {
    return step.charAt(0).toUpperCase() + step.slice(1)
  }

  return (
    <div className="my-8 rounded-lg border border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-background),95%,var(--theme-accent))] p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={generatedTokens.length >= RESPONSE.length}
          className="rounded px-4 py-2 font-semibold border-2 border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[var(--theme-background)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-background)] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          onClick={reset}
          className="rounded px-4 py-2 border-2 border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[var(--theme-background)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-background)] transition-colors"
        >
          Reset
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-[var(--theme-muted)]">Speed:</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-24 h-2 bg-[var(--theme-muted)]/20 rounded-lg appearance-none cursor-pointer accent-[var(--theme-accent)]"
          />
          <span className="text-sm font-mono w-8">{speed}x</span>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-[var(--theme-muted)] mb-1">
          <span>Token {generatedTokens.length + 1} of {RESPONSE.length + 1}</span>
          <span>{generatedTokens.length >= RESPONSE.length ? 'Complete!' : 'Generating...'}</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--theme-muted)]/20 overflow-hidden">
          <motion.div
            className="h-full bg-[var(--theme-accent)]"
            initial={{ width: 0 }}
            animate={{ width: `${(generatedTokens.length / RESPONSE.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Context display */}
      <div className="rounded-lg border-2 border-dashed border-[var(--theme-accent)]/30 bg-[color-mix(in_srgb,var(--theme-background),98%,var(--theme-accent))] p-6 min-h-[120px]">
        <div className="mb-2 text-xs text-[var(--theme-muted)]">Current context (what the model sees):</div>
        <div className="flex flex-wrap gap-2">
          {/* Original prompt tokens */}
          {PROMPT.split(' ').map((token, i) => (
            <span
              key={`prompt-${i}`}
              className="px-2 py-1 rounded bg-blue-600/20 text-blue-600 font-mono text-sm"
            >
              {token}
            </span>
          ))}

          {/* Generated tokens */}
          <AnimatePresence mode="popLayout">
            {generatedTokens.map((token, i) => (
              <motion.span
                key={`gen-${i}-${token}`}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="px-2 py-1 rounded bg-green-600/20 text-green-600 font-mono text-sm border-2 border-green-600"
              >
                {token}
              </motion.span>
            ))}
          </AnimatePresence>

          {/* Next token placeholder */}
          {isPlaying && generatedTokens.length < RESPONSE.length && (
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="px-2 py-1 rounded bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] font-mono text-sm"
            >
              ▊
            </motion.span>
          )}
        </div>
      </div>

      {/* Current step indicator */}
      <AnimatePresence>
        {currentStep && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 rounded-lg border border-[var(--theme-accent)] bg-[var(--theme-accent)]/5 p-3"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="text-2xl">{getStepIcon(currentStep)}</span>
              <span className="font-semibold text-[var(--theme-foreground)]">
                {getStepLabel(currentStep)}
              </span>
              <span className="text-[var(--theme-muted)]">
                {currentStep === 'tokenize' && '→ Splitting into tokens'}
                {currentStep === 'embed' && '→ Converting to vectors'}
                {currentStep === 'transform' && '→ Processing through attention'}
                {currentStep === 'probabilities' && '→ Calculating next token scores'}
                {currentStep === 'sample' && '→ Selecting token from distribution'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps visualization */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--theme-muted)]">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center">
            <motion.span
              animate={{
                opacity: currentStep === step ? 1 : 0.4,
                scale: currentStep === step ? 1.1 : 1,
              }}
              className={currentStep === step ? 'text-[var(--theme-accent)] font-semibold' : ''}
            >
              {step}
            </motion.span>
            {i < STEPS.length - 1 && <span className="mx-1">→</span>}
          </div>
        ))}
      </div>

      <div className="mt-4 text-center text-sm text-[var(--theme-muted)]">
        <p>Each new token requires running the entire pipeline. This is why generation slows down for longer outputs.</p>
      </div>
    </div>
  )
}
