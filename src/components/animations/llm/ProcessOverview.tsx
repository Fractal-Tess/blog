import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { ProcessStep } from './types'

const STEPS: ProcessStep[] = [
  {
    id: 1,
    title: 'Tokenization',
    description: 'Your text becomes pieces. Words and punctuation are split into tokens.',
    icon: '🔤',
  },
  {
    id: 2,
    title: 'Embeddings',
    description: 'Those pieces become meaningful vectors. Tokens get coordinates in semantic space.',
    icon: '🧠',
  },
  {
    id: 3,
    title: 'Transformer',
    description: 'Context gets processed through attention. The model focuses on relevant tokens.',
    icon: '🔄',
  },
  {
    id: 4,
    title: 'Probabilities',
    description: 'Every possible next token gets a score. The model produces a distribution.',
    icon: '📊',
  },
  {
    id: 5,
    title: 'Sampling',
    description: 'One token is selected, then it loops. The process repeats for each new token.',
    icon: '🎲',
  },
]

const cardVariants = {
  collapsed: {
    height: 80,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  expanded: {
    height: 'auto',
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
}

const arrowVariants = {
  rest: { x: 0 },
  hover: { x: 5 },
}

export default function ProcessOverview() {
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  return (
    <div className="my-8 rounded-lg border border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-background),95%,var(--theme-accent))] p-6">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">▶</span>
          The 5 Steps of LLM Text Generation
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2">
            {/* Step Card */}
            <motion.div
              className={`
                relative flex-1 cursor-pointer overflow-hidden rounded-lg border-2
                ${
                  activeStep === step.id
                    ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)] text-[var(--theme-background)]'
                    : 'border-[var(--theme-accent)]/30 bg-transparent text-[var(--theme-foreground)] hover:border-[var(--theme-accent)]'
                }
              `}
              variants={cardVariants}
              initial="collapsed"
              animate={activeStep === step.id ? 'expanded' : 'collapsed'}
              onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
              onHoverStart={() => setHoveredStep(step.id)}
              onHoverEnd={() => setHoveredStep(null)}
              whileHover={{ scale: hoveredStep === step.id ? 1.02 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className="p-4">
                {/* Card Header */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{step.icon}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono opacity-70">0{step.id}</span>
                    <h4 className="font-semibold">{step.title}</h4>
                  </div>
                  <motion.svg
                    className="ml-auto h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    variants={arrowVariants}
                    animate={activeStep === step.id ? 'hover' : 'rest'}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </div>

                {/* Expanded Description */}
                <AnimatePresence>
                  {activeStep === step.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 pl-10"
                    >
                      <p className="text-sm leading-relaxed opacity-90">{step.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Arrow between steps */}
            {index < STEPS.length - 1 && (
              <motion.div
                className="flex flex-col items-center justify-center px-1"
                animate={{ opacity: activeStep || hoveredStep ? 1 : 0.5 }}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                    animate={{ x: hoveredStep === step.id ? [0, 5, 0] : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-center text-[var(--theme-muted)] text-sm">
        <p>Click any step to learn more</p>
      </div>
    </div>
  )
}
