import type { SessionConfig, SessionState, AgentProvider, CollaborationConfig, LogEntry } from "./types"
import { SessionLogger } from "./logging/session-logger"

export class MassGenOrchestrator {
  private config: SessionConfig
  private currentSession: SessionState | null = null
  private sessionListeners: Map<string, (state: SessionState) => void> = new Map()
  private logger: SessionLogger
  private collaborationConfig: CollaborationConfig

  constructor(config: Partial<SessionConfig> & { config?: CollaborationConfig }) {
    this.collaborationConfig = config.config || {
      maxRounds: 3,
      consensusThreshold: 0.7,
      timeoutMinutes: 10,
      enableVoting: true,
      enableDebate: true,
      temperature: 0.7,
      maxTokens: 2000,
    }

    this.config = {
      models: config.models || [],
      maxDuration: this.collaborationConfig.timeoutMinutes * 60,
      consensusThreshold: this.collaborationConfig.consensusThreshold,
    }

    this.logger = new SessionLogger()
  }

  async startSession(query: string): Promise<string> {
    const sessionId = `session_${Date.now()}`

    this.currentSession = {
      id: sessionId,
      query,
      config: this.config,
      agents: [],
      phase: "initializing",
      startTime: Date.now(),
      logs: [],
      rounds: [],
      currentRound: 0,
      collaborationMessages: [],
      votingResults: [],
    }

    this.currentSession.agents = this.config.models.map((provider, index) => ({
      id: `agent_${index + 1}`,
      config: {
        id: `agent_${index + 1}`,
        provider,
        model: this.getModelForProvider(provider),
        temperature: this.collaborationConfig.temperature,
        maxTokens: this.collaborationConfig.maxTokens,
      },
      status: "initializing",
      collaborationHistory: [],
      proposedAnswer: "",
      confidence: 0,
      votes: [],
      debatePoints: [],
    }))

    this.logger.startSession(sessionId, query, this.currentSession.agents.length)
    this.log("info", "orchestrator", `Started advanced session with ${this.currentSession.agents.length} agents`)
    this.notifyStateChange()

    setTimeout(() => this.runAdvancedCollaboration(), 1000)

    return sessionId
  }

  private async runAdvancedCollaboration() {
    if (!this.currentSession) return

    try {
      // Phase 1: Initialization and Planning
      await this.runPhase("planning", 2000, () => {
        this.currentSession!.agents.forEach((agent) => {
          agent.status = "planning"
          agent.currentThought = `Planning approach for: "${this.currentSession!.query}"`
        })
        this.addCollaborationMessage("system", "Agents are analyzing the problem and planning their approaches...")
      })

      // Phase 2: Multi-round collaboration
      for (let round = 1; round <= this.collaborationConfig.maxRounds; round++) {
        this.currentSession.currentRound = round
        this.currentSession.phase = "collaborating"

        await this.runCollaborationRound(round)

        if (this.hasReachedConsensus()) {
          this.log("info", "orchestrator", `Consensus reached in round ${round}`)
          break
        }
      }

      // Phase 3: Final voting and consensus
      if (this.collaborationConfig.enableVoting) {
        await this.runVotingPhase()
      }

      // Phase 4: Generate final answer
      await this.runPhase("finalizing", 2000, () => {
        this.currentSession!.finalAnswer = this.generateAdvancedFinalAnswer()
        this.currentSession!.consensusScore = this.calculateConsensusScore()
        this.addCollaborationMessage("system", "Generating final collaborative answer...")
      })

      // Complete session
      this.currentSession.phase = "completed"
      this.currentSession.endTime = Date.now()
      this.currentSession.agents.forEach((agent) => (agent.status = "completed"))

      this.logger.endSession(this.currentSession.id, this.currentSession.finalAnswer || "")
      this.log("info", "orchestrator", "Advanced collaboration session completed")
      this.notifyStateChange()
    } catch (error) {
      this.handleSessionError(error)
    }
  }

  private async runCollaborationRound(round: number) {
    this.log("info", "orchestrator", `Starting collaboration round ${round}`)

    // Generate initial responses
    await this.runPhase("thinking", 3000, () => {
      this.currentSession!.agents.forEach((agent, index) => {
        agent.status = "thinking"
        agent.currentThought = `Round ${round}: Deep analysis of "${this.currentSession!.query}"`

        setTimeout(() => {
          agent.proposedAnswer = this.generateAdvancedAnswer(agent.config.provider, this.currentSession!.query, round)
          agent.confidence = Math.random() * 0.4 + 0.6 // 0.6-1.0
          this.addCollaborationMessage(
            agent.id,
            `Round ${round} Analysis: ${agent.proposedAnswer.substring(0, 100)}...`,
          )
        }, index * 500)
      })
    })

    // Debate phase if enabled
    if (this.collaborationConfig.enableDebate && round > 1) {
      await this.runDebatePhase(round)
    }

    // Record round results
    this.currentSession!.rounds.push({
      roundNumber: round,
      responses: this.currentSession!.agents.map((agent) => ({
        agentId: agent.id,
        response: agent.proposedAnswer,
        confidence: agent.confidence || 0,
      })),
      consensusScore: this.calculateConsensusScore(),
    })
  }

  private async runDebatePhase(round: number) {
    await this.runPhase("debating", 2500, () => {
      this.addCollaborationMessage("system", `Round ${round}: Agents are debating and refining their positions...`)

      this.currentSession!.agents.forEach((agent, index) => {
        agent.status = "debating"

        setTimeout(() => {
          const debatePoint = this.generateDebatePoint(agent.config.provider, round)
          agent.debatePoints = agent.debatePoints || []
          agent.debatePoints.push(debatePoint)
          this.addCollaborationMessage(agent.id, `Debate Point: ${debatePoint}`)
        }, index * 400)
      })
    })
  }

  private async runVotingPhase() {
    await this.runPhase("voting", 2000, () => {
      this.addCollaborationMessage("system", "Agents are voting on the best collaborative solution...")

      this.currentSession!.agents.forEach((agent, index) => {
        agent.status = "voting"

        setTimeout(() => {
          const vote = this.generateVote(agent, this.currentSession!.agents)
          agent.votes = agent.votes || []
          agent.votes.push(vote)
          this.addCollaborationMessage(agent.id, `Vote: ${vote.choice} (confidence: ${vote.confidence.toFixed(2)})`)
        }, index * 300)
      })
    })
  }

  private async runPhase(phase: string, duration: number, setup: () => void) {
    if (!this.currentSession) return

    this.currentSession.phase = phase as any
    setup()
    this.notifyStateChange()
    await new Promise((resolve) => setTimeout(resolve, duration))
  }

  private generateAdvancedAnswer(provider: AgentProvider, query: string, round: number): string {
    const baseResponses = {
      openai: `GPT-4o Round ${round} Analysis: Applying systematic reasoning to "${query.substring(0, 40)}..." with focus on logical structure and evidence-based conclusions.`,
      gemini: `Gemini Round ${round} Insight: Multi-modal analysis of "${query.substring(0, 40)}..." incorporating diverse perspectives and contextual understanding.`,
      xai: `Grok Round ${round} Perspective: Real-time contextual analysis of "${query.substring(0, 40)}..." with emphasis on practical applications and current relevance.`,
      anthropic: `Claude Round ${round} Analysis: Ethical and balanced examination of "${query.substring(0, 40)}..." considering multiple stakeholder perspectives and long-term implications.`,
    }

    const roundEnhancements = [
      " Initial comprehensive assessment.",
      " Refined analysis incorporating peer insights.",
      " Final synthesis with collaborative refinements.",
    ]

    return baseResponses[provider] + roundEnhancements[round - 1]
  }

  private generateDebatePoint(provider: AgentProvider, round: number): string {
    const debatePoints = {
      openai: `Structured counterargument focusing on logical consistency`,
      gemini: `Alternative perspective considering broader context`,
      xai: `Practical challenge to current assumptions`,
      anthropic: `Ethical consideration and balanced critique`,
    }
    return debatePoints[provider]
  }

  private generateVote(voter: any, allAgents: any[]): { choice: string; confidence: number; reasoning: string } {
    const otherAgents = allAgents.filter((a) => a.id !== voter.id)
    const choice = otherAgents[Math.floor(Math.random() * otherAgents.length)]

    return {
      choice: choice.id,
      confidence: Math.random() * 0.3 + 0.7,
      reasoning: `Best aligns with collaborative synthesis approach`,
    }
  }

  private hasReachedConsensus(): boolean {
    return this.calculateConsensusScore() >= this.collaborationConfig.consensusThreshold
  }

  private calculateConsensusScore(): number {
    if (!this.currentSession || this.currentSession.agents.length === 0) return 0

    const avgConfidence =
      this.currentSession.agents.reduce((sum, agent) => sum + (agent.confidence || 0), 0) /
      this.currentSession.agents.length

    return Math.min(avgConfidence + Math.random() * 0.2, 1.0)
  }

  private generateAdvancedFinalAnswer(): string {
    if (!this.currentSession) return ""

    const agentSummaries = this.currentSession.agents
      .map((agent) => `${agent.config.provider.toUpperCase()}: ${agent.proposedAnswer}`)
      .join("\n\n")

    return `🤖 Multi-Agent Collaborative Analysis

QUERY: ${this.currentSession.query}

COLLABORATIVE INSIGHTS:
${agentSummaries}

SYNTHESIS:
After ${this.currentSession.currentRound} rounds of collaboration, debate, and consensus-building, the agents have converged on a comprehensive solution that incorporates multiple AI perspectives.

CONSENSUS SCORE: ${this.currentSession.consensusScore?.toFixed(2)} / 1.00
COLLABORATION ROUNDS: ${this.currentSession.currentRound}
TOTAL AGENTS: ${this.currentSession.agents.length}`
  }

  private addCollaborationMessage(source: string, message: string) {
    if (!this.currentSession) return

    this.currentSession.collaborationMessages = this.currentSession.collaborationMessages || []
    this.currentSession.collaborationMessages.push({
      timestamp: Date.now(),
      source,
      message,
      type: source === "system" ? "system" : "agent",
    })

    this.logger.logCollaboration(this.currentSession.id, source, message)
  }

  private handleSessionError(error: any) {
    this.log("error", "orchestrator", `Session error: ${error.message}`)
    if (this.currentSession) {
      this.currentSession.phase = "error"
      this.currentSession.endTime = Date.now()
      this.notifyStateChange()
    }
  }

  stopSession() {
    if (this.currentSession) {
      this.currentSession.phase = "completed"
      this.currentSession.endTime = Date.now()
      this.notifyStateChange()
    }
  }

  getSessionState(): SessionState | null {
    return this.currentSession
  }

  onStateChange(sessionId: string, callback: (state: SessionState) => void) {
    this.sessionListeners.set(sessionId, callback)
  }

  private notifyStateChange() {
    if (this.currentSession) {
      this.sessionListeners.forEach((callback) => {
        callback(this.currentSession!)
      })
    }
  }

  private log(level: "info" | "warning" | "error", source: string, message: string) {
    if (this.currentSession) {
      const logEntry: LogEntry = {
        timestamp: Date.now(),
        level,
        source,
        message,
      }

      this.currentSession.logs.push(logEntry)
      this.logger.logEvent(this.currentSession.id, logEntry)
    }
  }

  private getModelForProvider(provider: AgentProvider): string {
    const modelMap = {
      openai: "gpt-4o",
      gemini: "gemini-2.5-flash",
      xai: "grok-3-mini",
      anthropic: "claude-3-5-sonnet",
    }
    return modelMap[provider]
  }
}
