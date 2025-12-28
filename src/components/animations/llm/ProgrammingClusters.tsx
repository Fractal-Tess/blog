import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Sphere, Line } from '@react-three/drei'
import { useState, useRef, useMemo } from 'react'
import * as THREE from 'three'
import type { Cluster } from './types'

const CLUSTERS: (Cluster & { z: number })[] = [
  {
    name: 'Functions',
    color: '#3B82F6',
    terms: ['function', 'method', 'procedure', 'routine', 'callback', 'lambda'],
    x: -2.5,
    y: 1,
    z: 0,
  },
  {
    name: 'Variables',
    color: '#10B981',
    terms: ['variable', 'parameter', 'argument', 'constant', 'identifier', 'scope'],
    x: 2.5,
    y: 1,
    z: 0.5,
  },
  {
    name: 'Database',
    color: '#8B5CF6',
    terms: ['database', 'SQL', 'query', 'table', 'index', 'schema', 'JOIN'],
    x: 0,
    y: -1.5,
    z: 1,
  },
  {
    name: 'OOP',
    color: '#F59E0B',
    terms: ['class', 'object', 'inheritance', 'polymorphism', 'encapsulation'],
    x: -1,
    y: 0,
    z: -2,
  },
  {
    name: 'Web',
    color: '#EF4444',
    terms: ['HTTP', 'REST', 'API', 'endpoint', 'request', 'response'],
    x: 1.5,
    y: -0.5,
    z: -1.5,
  },
]

interface ClusterNodeProps {
  cluster: (typeof CLUSTERS)[0]
  index: number
  isExpanded: boolean
  onToggle: () => void
}

function ClusterNode({ cluster, index, isExpanded, onToggle }: ClusterNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  // Floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = cluster.y + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.1
    }
    if (meshRef.current && isExpanded) {
      meshRef.current.rotation.y += 0.01
    }
  })

  // Calculate term positions around the cluster
  const termPositions = useMemo(() => {
    return cluster.terms.map((_, i) => {
      const angle = (i / cluster.terms.length) * Math.PI * 2
      const radius = 1.2
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.6,
        z: Math.sin(angle) * 0.3,
      }
    })
  }, [cluster.terms])

  return (
    <group ref={groupRef} position={[cluster.x, cluster.y, cluster.z]}>
      {/* Main cluster sphere */}
      <mesh
        ref={meshRef}
        onClick={onToggle}
        scale={isExpanded ? 1.3 : 1}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={cluster.color}
          emissive={cluster.color}
          emissiveIntensity={isExpanded ? 0.4 : 0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.65, 32]} />
        <meshBasicMaterial
          color={cluster.color}
          transparent
          opacity={isExpanded ? 0.6 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Cluster label */}
      <Html center position={[0, 0, 0]} style={{ pointerEvents: 'none' }}>
        <div
          className="text-white font-bold text-sm whitespace-nowrap px-2 py-1 rounded"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            cursor: 'pointer',
          }}
        >
          {cluster.name}
        </div>
      </Html>

      {/* Expanded terms */}
      {isExpanded && cluster.terms.map((term, i) => (
        <group key={term} position={[termPositions[i].x, termPositions[i].y, termPositions[i].z]}>
          {/* Connection line to center */}
          <Line
            points={[[0, 0, 0], [-termPositions[i].x, -termPositions[i].y, -termPositions[i].z]]}
            color={cluster.color}
            lineWidth={1}
            opacity={0.5}
            transparent
          />
          {/* Term sphere */}
          <mesh>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color={cluster.color}
              emissive={cluster.color}
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Term label */}
          <Html center position={[0, 0.2, 0]} style={{ pointerEvents: 'none' }}>
            <div
              className="text-xs whitespace-nowrap px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: cluster.color,
                color: 'white',
                fontSize: '10px',
              }}
            >
              {term}
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}

function ConnectionLines() {
  const connections = useMemo(() => {
    const lines: { start: THREE.Vector3; end: THREE.Vector3; color1: string; color2: string }[] = []

    for (let i = 0; i < CLUSTERS.length; i++) {
      for (let j = i + 1; j < CLUSTERS.length; j++) {
        const c1 = CLUSTERS[i]
        const c2 = CLUSTERS[j]
        lines.push({
          start: new THREE.Vector3(c1.x, c1.y, c1.z),
          end: new THREE.Vector3(c2.x, c2.y, c2.z),
          color1: c1.color,
          color2: c2.color,
        })
      }
    }
    return lines
  }, [])

  return (
    <group>
      {connections.map((conn, i) => (
        <Line
          key={i}
          points={[conn.start, conn.end]}
          color="#666"
          lineWidth={1}
          dashed
          dashScale={10}
          dashSize={0.2}
          gapSize={0.1}
          opacity={0.3}
          transparent
        />
      ))}
    </group>
  )
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(100 * 3)
    for (let i = 0; i < 100; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return positions
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={100}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#6366f1" transparent opacity={0.4} />
    </points>
  )
}

function Scene({ expandedCluster, setExpandedCluster }: {
  expandedCluster: number | null
  setExpandedCluster: (index: number | null) => void
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8B5CF6" />

      <FloatingParticles />
      <ConnectionLines />

      {CLUSTERS.map((cluster, index) => (
        <ClusterNode
          key={cluster.name}
          cluster={cluster}
          index={index}
          isExpanded={expandedCluster === index}
          onToggle={() => setExpandedCluster(expandedCluster === index ? null : index)}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={4}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  )
}

export default function ProgrammingClusters() {
  const [expandedCluster, setExpandedCluster] = useState<number | null>(null)

  return (
    <div className="my-8 rounded-lg border border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-background),95%,var(--theme-accent))] p-6">
      <div className="text-sm text-[var(--theme-muted)] mb-4">
        <p>Related programming concepts cluster together in embedding space. Click clusters to expand • Drag to rotate • Scroll to zoom</p>
      </div>

      <div className="relative h-[400px] rounded-lg border border-[var(--theme-accent)]/30 overflow-hidden bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a]">
        <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
          <Scene expandedCluster={expandedCluster} setExpandedCluster={setExpandedCluster} />
        </Canvas>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 text-xs">
          {CLUSTERS.map((cluster) => (
            <span
              key={cluster.name}
              className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cluster.color }}
              />
              <span className="text-white/80">{cluster.name}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-[var(--theme-muted)]">
        <p>
          The model learns that "function" and "method" are related because they appear in similar contexts—not because anyone told it.
        </p>
      </div>
    </div>
  )
}
