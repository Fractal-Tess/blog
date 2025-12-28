import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Line, Text } from '@react-three/drei'
import { useState, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'

const STEPS = [
  {
    id: 0,
    equation: 'king',
    title: 'Start with "king"',
    description: 'We begin with the embedding vector for "king" - a point in high-dimensional space that encodes the meaning of royalty + masculinity.',
    highlightedVectors: ['king'],
    showArrows: [],
  },
  {
    id: 1,
    equation: 'king − man',
    title: 'Subtract "man"',
    description: 'Subtracting the "man" vector removes the masculine direction, leaving us at a gender-neutral royalty position.',
    highlightedVectors: ['king', 'man'],
    showArrows: ['king-to-neutral'],
  },
  {
    id: 2,
    equation: 'king − man + woman',
    title: 'Add "woman"',
    description: 'Adding the "woman" vector moves us in the feminine direction, from neutral royalty toward feminine royalty.',
    highlightedVectors: ['king', 'woman'],
    showArrows: ['king-to-neutral', 'neutral-to-result'],
  },
  {
    id: 3,
    equation: 'king − man + woman ≈ queen',
    title: 'Result: "queen"!',
    description: 'The resulting position lands near "queen" in the embedding space. The model learned that gender is a direction!',
    highlightedVectors: ['king', 'queen'],
    showArrows: ['king-to-neutral', 'neutral-to-result', 'result-glow'],
  },
]

// 3D positions for vectors
const POSITIONS = {
  origin: new THREE.Vector3(0, 0, 0),
  king: new THREE.Vector3(-1.5, 1, 0.5),
  man: new THREE.Vector3(-0.5, 0.3, -0.8),
  woman: new THREE.Vector3(0.5, 0.5, -0.6),
  queen: new THREE.Vector3(1.5, 1.2, 0.3),
  neutral: new THREE.Vector3(0, 0.8, 0), // king - man intermediate
  result: new THREE.Vector3(1.2, 1.1, 0.2), // where we land after adding woman
}

const COLORS = {
  king: '#3B82F6',
  queen: '#10B981',
  man: '#EF4444',
  woman: '#A855F7',
  neutral: '#6B7280',
  subtract: '#EF4444',
  add: '#3B82F6',
  result: '#10B981',
}

interface VectorPointProps {
  position: THREE.Vector3
  color: string
  label: string
  isHighlighted: boolean
  scale?: number
}

function VectorPoint({ position, color, label, isHighlighted, scale = 1 }: VectorPointProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current && isHighlighted) {
      meshRef.current.scale.setScalar(scale * (1 + Math.sin(state.clock.elapsedTime * 3) * 0.15))
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} scale={scale}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHighlighted ? 0.5 : 0.2}
        />
      </mesh>
      {/* Outer glow */}
      {isHighlighted && (
        <mesh scale={1.5}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} />
        </mesh>
      )}
      <Html center position={[0, 0.35, 0]} style={{ pointerEvents: 'none' }}>
        <div
          className={`
            whitespace-nowrap rounded px-2 py-0.5 text-xs font-bold
            ${isHighlighted
              ? 'bg-white text-gray-900 shadow-lg'
              : 'bg-black/70 text-white/80'
            }
          `}
        >
          {label}
        </div>
      </Html>
    </group>
  )
}

interface ArrowLineProps {
  start: THREE.Vector3
  end: THREE.Vector3
  color: string
  dashed?: boolean
  label?: string
}

function ArrowLine({ start, end, color, dashed = false, label }: ArrowLineProps) {
  const midpoint = useMemo(() => {
    return new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
  }, [start, end])

  return (
    <group>
      <Line
        points={[start, end]}
        color={color}
        lineWidth={3}
        dashed={dashed}
        dashScale={10}
        dashSize={0.15}
        gapSize={0.08}
      />
      {/* Arrow head */}
      <mesh position={end}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {label && (
        <Html center position={midpoint.toArray()} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-xs font-medium" style={{ color }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}

function Grid() {
  return (
    <group>
      <gridHelper args={[6, 12, '#4a4a5a', '#2a2a3a']} position={[0, -0.5, 0]} />
      <mesh position={[0, -0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial color="#1a1a2e" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

function Scene({ step }: { step: number }) {
  const currentStep = STEPS[step]

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, 3, -5]} intensity={0.3} color="#8B5CF6" />

      <Grid />

      {/* Always show king */}
      <VectorPoint
        position={POSITIONS.king}
        color={COLORS.king}
        label="king"
        isHighlighted={currentStep.highlightedVectors.includes('king')}
        scale={1.2}
      />

      {/* Show man reference point */}
      {step >= 1 && (
        <VectorPoint
          position={POSITIONS.man}
          color={COLORS.man}
          label="man"
          isHighlighted={currentStep.highlightedVectors.includes('man')}
        />
      )}

      {/* Show woman reference point */}
      {step >= 2 && (
        <VectorPoint
          position={POSITIONS.woman}
          color={COLORS.woman}
          label="woman"
          isHighlighted={currentStep.highlightedVectors.includes('woman')}
        />
      )}

      {/* Neutral point (king - man) */}
      {step >= 1 && (
        <VectorPoint
          position={POSITIONS.neutral}
          color={COLORS.neutral}
          label="(neutral)"
          isHighlighted={false}
          scale={0.8}
        />
      )}

      {/* Queen result */}
      {step >= 3 && (
        <VectorPoint
          position={POSITIONS.queen}
          color={COLORS.queen}
          label="queen"
          isHighlighted={currentStep.highlightedVectors.includes('queen')}
          scale={1.3}
        />
      )}

      {/* Arrow: king to neutral (subtract man) */}
      {currentStep.showArrows.includes('king-to-neutral') && (
        <ArrowLine
          start={POSITIONS.king}
          end={POSITIONS.neutral}
          color={COLORS.subtract}
          dashed
          label="− man"
        />
      )}

      {/* Arrow: neutral to result (add woman) */}
      {currentStep.showArrows.includes('neutral-to-result') && (
        <ArrowLine
          start={POSITIONS.neutral}
          end={step >= 3 ? POSITIONS.queen : POSITIONS.result}
          color={COLORS.add}
          label="+ woman"
        />
      )}

      {/* Result glow effect */}
      {currentStep.showArrows.includes('result-glow') && (
        <mesh position={POSITIONS.queen}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color={COLORS.result} transparent opacity={0.15} />
        </mesh>
      )}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={10}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  )
}

export default function EmbeddingMath() {
  const [step, setStep] = useState(0)

  const currentStep = STEPS[step]
  const canGoBack = step > 0
  const canGoForward = step < STEPS.length - 1

  const goNext = () => {
    if (canGoForward) setStep(step + 1)
  }

  const goPrevious = () => {
    if (canGoBack) setStep(step - 1)
  }

  return (
    <div className="my-8 rounded-lg border border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-background),95%,var(--theme-accent))] p-6">
      {/* Text Content - On Top */}
      <div className="mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Equation */}
            <div className="text-center mb-4">
              <span className="text-3xl md:text-4xl font-mono font-bold text-[var(--theme-accent)]">
                {currentStep.equation}
              </span>
            </div>

            {/* Title and Description */}
            <div className="text-center max-w-xl mx-auto">
              <h4 className="text-lg font-semibold mb-2 text-[var(--theme-foreground)]">
                {currentStep.title}
              </h4>
              <p className="text-sm text-[var(--theme-muted)]">
                {currentStep.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3D Visualization */}
      <div className="relative h-[350px] rounded-lg border border-[var(--theme-accent)]/30 overflow-hidden bg-gradient-to-b from-[#0a0a0f] to-[#1a1a2e] mb-4">
        <Canvas camera={{ position: [3, 2, 4], fov: 50 }}>
          <Scene step={step} />
        </Canvas>

        {/* Legend overlay */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.king }} />
            king
          </span>
          {step >= 1 && (
            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.man }} />
              man
            </span>
          )}
          {step >= 2 && (
            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.woman }} />
              woman
            </span>
          )}
          {step >= 3 && (
            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.queen }} />
              queen
            </span>
          )}
        </div>

        {/* Instructions overlay */}
        <div className="absolute top-3 right-3 text-xs text-white/50 bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
          Drag to rotate • Scroll to zoom
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        {/* Previous Button */}
        <button
          onClick={goPrevious}
          disabled={!canGoBack}
          className="flex items-center gap-2 rounded px-4 py-2 text-sm font-medium border-2 border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[var(--theme-background)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-background)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[var(--theme-background)] disabled:hover:text-[var(--theme-accent)]"
        >
          <span>←</span>
          Previous
        </button>

        {/* Step Indicators */}
        <div className="flex gap-2">
          {STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`
                h-2.5 w-2.5 rounded-full transition-all duration-300
                ${step === s.id
                  ? 'bg-[var(--theme-accent)] scale-125'
                  : step > s.id
                    ? 'bg-[var(--theme-accent)]/60'
                    : 'bg-[var(--theme-accent)]/20'
                }
              `}
              aria-label={`Go to step ${s.id + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={goNext}
          disabled={!canGoForward}
          className="flex items-center gap-2 rounded px-4 py-2 text-sm font-medium border-2 border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[var(--theme-background)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-background)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[var(--theme-background)] disabled:hover:text-[var(--theme-accent)]"
        >
          Next
          <span>→</span>
        </button>
      </div>

      {/* Footer Note */}
      <div className="mt-4 text-center text-sm text-[var(--theme-muted)]">
        The model learned these relationships from text patterns—nobody explicitly taught it that "king" relates to "queen".
      </div>
    </div>
  )
}
