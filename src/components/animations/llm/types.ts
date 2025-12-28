// Shared TypeScript types for LLM animation components

export interface Token {
  id: number
  text: string
  type: 'word' | 'subword' | 'punctuation'
}

export interface EmbeddingPoint {
  word: string
  x: number
  y: number
  z: number
  cluster: string
}

export interface AttentionWeight {
  word: string
  weight: number
  position: number
}

export interface Probability {
  token: string
  probability: number
  rank: number
}

export interface ProcessStep {
  id: number
  title: string
  description: string
  icon: string
}

export interface Logit {
  token: string
  logitValue: number
}

export interface Cluster {
  name: string
  color: string
  terms: string[]
  x: number
  y: number
}
