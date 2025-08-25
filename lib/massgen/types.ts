export type AgentProvider = "openai" | "gemini" | "xai" | "anthropic"

export type AgentStatus = "idle" | "thinking" | "collaborating" | "voting" | "completed" | "error"

export interface AgentConfig {
  id: string
  provider: AgentProvider
  model: string
  temperature?: number
  maxTokens?: number
  tools?: string[]
}

export interface Agent {
  id: string
  config: AgentConfig
  status: AgentStatus
  currentThought?: string
  proposedAnswer?: string
  vote?: AgentVote
  collaborationHistory: CollaborationMessage[]
}

export interface CollaborationMessage {
  agentId: string
  timestamp: number
  type: "insight" | "question" | "refinement" | "vote"
  content: string
  metadata?: Record<string, any>
}

export interface AgentVote {
  targetAgentId: string
  score: number // 0-1
  reasoning: string
  timestamp: number
}

export interface SessionConfig {
  models: AgentProvider[]
  maxDuration: number // seconds
  consensusThreshold: number // 0-1
  maxIterations?: number
  enableTools?: boolean
}

export interface SessionState {
  id: string
  query: string
  config: SessionConfig
  agents: Agent[]
  phase: "initializing" | "thinking" | "collaborating" | "voting" | "converging" | "completed" | "error"
  startTime: number
  endTime?: number
  consensusScore?: number
  finalAnswer?: string
  logs: SessionLog[]
}

export interface SessionLog {
  timestamp: number
  level: "info" | "warning" | "error"
  source: string
  message: string
  data?: any
}

export interface OrchestratorConfig extends SessionConfig {
  // Additional orchestrator-specific config
}
