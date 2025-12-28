import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, Line } from '@react-three/drei'
import { useState, useRef, useMemo } from 'react'
import * as THREE from 'three'
import type { EmbeddingPoint } from './types'

// 3D embedding space points
const EMBEDDING_POINTS: EmbeddingPoint[] = [
  // Royalty cluster
  { word: 'king', x: -2, y: 1.5, z: 0.5, cluster: 'royalty' },
  { word: 'queen', x: -1.5, y: 1.8, z: 0.3, cluster: 'royalty' },
  { word: 'prince', x: -2.2, y: 1.2, z: 0.7, cluster: 'royalty' },
  { word: 'princess', x: -1.8, y: 1.6, z: 0.4, cluster: 'royalty' },
  // Programming languages cluster
  { word: 'Python', x: 2, y: 0, z: 1, cluster: 'programming' },
  { word: 'JavaScript', x: 2.3, y: -0.2, z: 0.8, cluster: 'programming' },
  { word: 'TypeScript', x: 2.5, y: 0.1, z: 1.2, cluster: 'programming' },
  { word: 'Java', x: 2.1, y: 0.3, z: 0.6, cluster: 'programming' },
  // Animals cluster
  { word: 'cat', x: -1, y: -1.5, z: -1, cluster: 'animals' },
  { word: 'dog', x: -0.7, y: -1.7, z: -0.8, cluster: 'animals' },
  { word: 'bird', x: -1.2, y: -1.3, z: -1.2, cluster: 'animals' },
  // Reptiles cluster
  { word: 'python (snake)', x: 0.5, y: -2, z: 0.3, cluster: 'reptiles' },
  { word: 'cobra', x: 0.8, y: -2.2, z: 0.5, cluster: 'reptiles' },
  // Gender terms
  { word: 'man', x: 0, y: 1, z: -1, cluster: 'gender' },
  { word: 'woman', x: 0.3, y: 1.2, z: -0.8, cluster: 'gender' },
]

const CLUSTER_COLORS: Record<string, string> = {
  royalty: '#3B82F6',
  programming: '#10B981',
  animals: '#F59E0B',
  reptiles: '#EF4444',
  gender: '#8B5CF6',
}

interface EmbeddingPointMeshProps {
  point: EmbeddingPoint
  isHovered: boolean
  isRelated: boolean
  onHover: (word: string | null) => void
}

function EmbeddingPointMesh({ point, isHovered, isRelated, onHover }: EmbeddingPointMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const color = CLUSTER_COLORS[point.cluster]

  const scale = isHovered ? 1.5 : isRelated ? 1.2 : 1

  useFrame((state) => {
    if (meshRef.current && isHovered) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.15)
    }
  })

  return (
    <group position={[point.x, point.y, point.z]}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => onHover(point.word)}
        onPointerLeave={() => onHover(null)}
        scale={scale}
      >
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 0.5 : 0.2}
        />
      </mesh>
      <Html
        position={[0, 0.25, 0]}
        center
        style={{
          pointerEvents: 'none',
          transition: 'all 0.2s ease',
          transform: `scale(${isHovered ? 1.1 : 1})`,
        }}
      >
        <div
          className={`
            whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium
            ${isHovered
              ? 'bg-[var(--theme-accent)] text-[var(--theme-background)] shadow-lg'
              : 'bg-[var(--theme-background)]/90 text-[var(--theme-foreground)] border border-[var(--theme-accent)]/30'
            }
          `}
        >
          {point.word}
        </div>
      </Html>
    </group>
  )
}

interface VectorArithmeticProps {
  visible: boolean
}

function VectorArithmetic({ visible }: VectorArithmeticProps) {
  const [progress, setProgress] = useState(0)

  useFrame((_, delta) => {
    if (visible && progress < 3) {
      setProgress((prev) => Math.min(prev + delta * 0.5, 3))
    } else if (!visible && progress > 0) {
      setProgress(0)
    }
  })

  if (!visible) return null

  const kingPos = new THREE.Vector3(-2, 1.5, 0.5)
  const manPos = new THREE.Vector3(0, 1, -1)
  const womanPos = new THREE.Vector3(0.3, 1.2, -0.8)
  const queenPos = new THREE.Vector3(-1.5, 1.8, 0.3)

  return (
    <group>
      {/* King to Man (subtract) */}
      {progress > 0 && (
        <Line
          points={[kingPos, manPos]}
          color="#8B5CF6"
          lineWidth={2}
          dashed
          dashScale={10}
          dashSize={0.2}
          gapSize={0.1}
        />
      )}
      {/* Result arrow to Queen */}
      {progress > 1 && (
        <Line
          points={[womanPos, queenPos]}
          color="#3B82F6"
          lineWidth={3}
        />
      )}
      {/* Woman to result */}
      {progress > 2 && (
        <>
          <mesh position={queenPos.toArray()}>
            <sphereGeometry args={[0.15, 32, 32]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
          </mesh>
          <Html position={queenPos.toArray()} center>
            <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold animate-pulse">
              ≈ queen!
            </div>
          </Html>
        </>
      )}
    </group>
  )
}

function GridHelper() {
  return (
    <group>
      {/* Main grid plane */}
      <gridHelper
        args={[12, 24, '#6366f1', '#3f3f46']}
        position={[0, -2.5, 0]}
        rotation={[0, 0, 0]}
      />
      {/* Secondary subtle grid for depth */}
      <mesh position={[0, -2.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial color="#1a1a2e" transparent opacity={0.5} />
      </mesh>
      {/* Colored axes for orientation */}
      <group position={[0, -2.5, 0]}>
        {/* X axis - red */}
        <mesh position={[3, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 6, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        {/* Z axis - blue */}
        <mesh position={[0, 0.01, 3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 6, 8]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
        {/* Y axis - green (pointing up) */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 3, 8]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>
    </group>
  )
}

function Scene({ hoveredWord, setHoveredWord, showVector }: {
  hoveredWord: string | null
  setHoveredWord: (word: string | null) => void
  showVector: boolean
}) {
  const findRelatedWords = (word: string) => {
    const target = EMBEDDING_POINTS.find((p) => p.word === word)
    if (!target) return []

    return EMBEDDING_POINTS.filter((p) => {
      if (p.word === word) return false
      const distance = Math.sqrt(
        Math.pow(p.x - target.x, 2) +
        Math.pow(p.y - target.y, 2) +
        Math.pow(p.z - target.z, 2)
      )
      return distance < 1.5
    })
  }

  const relatedWords = hoveredWord ? findRelatedWords(hoveredWord) : []

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <GridHelper />

      {EMBEDDING_POINTS.map((point) => (
        <EmbeddingPointMesh
          key={point.word}
          point={point}
          isHovered={hoveredWord === point.word}
          isRelated={relatedWords.some((w) => w.word === point.word)}
          onHover={setHoveredWord}
        />
      ))}

      <VectorArithmetic visible={showVector} />

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  )
}

export default function EmbeddingSpaceVisualization() {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null)
  const [showVector, setShowVector] = useState(false)

  const findRelatedWords = (word: string) => {
    const target = EMBEDDING_POINTS.find((p) => p.word === word)
    if (!target) return []

    return EMBEDDING_POINTS.filter((p) => {
      if (p.word === word) return false
      const distance = Math.sqrt(
        Math.pow(p.x - target.x, 2) +
        Math.pow(p.y - target.y, 2) +
        Math.pow(p.z - target.z, 2)
      )
      return distance < 1.5
    })
  }

  const relatedWords = hoveredWord ? findRelatedWords(hoveredWord) : []

  return (
    <div className="my-8 rounded-lg border border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-background),95%,var(--theme-accent))] p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-lg font-semibold flex items-center gap-2">
          <span className="text-xl">🌐</span>
          3D Embedding Space Visualization
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setShowVector(!showVector)}
            className="rounded px-3 py-1 text-sm font-medium border-2 border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[var(--theme-background)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-background)] transition-colors"
          >
            {showVector ? 'Reset' : 'Show King - Man + Woman'}
          </button>
        </div>
      </div>

      <div className="text-sm text-[var(--theme-muted)] mb-4">
        <p>Drag to rotate • Scroll to zoom • Words with similar meanings are close together in 3D space.</p>
      </div>

      <div className="relative h-[450px] rounded-lg border border-[var(--theme-accent)]/30 overflow-hidden bg-gradient-to-b from-[#0a0a0f] to-[#1a1a2e]">
        <Canvas
          camera={{ position: [5, 3, 5], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <Scene
            hoveredWord={hoveredWord}
            setHoveredWord={setHoveredWord}
            showVector={showVector}
          />
        </Canvas>

        {/* Related words indicator */}
        {hoveredWord && relatedWords.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 rounded bg-[var(--theme-background)]/95 border border-[var(--theme-accent)] p-3 text-sm backdrop-blur-sm">
            <span className="font-semibold text-[var(--theme-accent)]">Related to "{hoveredWord}":</span>
            <span className="ml-2 text-[var(--theme-muted)]">{relatedWords.map((w) => w.word).join(', ')}</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {Object.entries(CLUSTER_COLORS).map(([name, color]) => (
          <span key={name} className="flex items-center gap-1 capitalize">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}
