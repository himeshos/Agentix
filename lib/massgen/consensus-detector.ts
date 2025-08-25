import type { Agent } from "./types"

export class ConsensusDetector {
  private threshold: number

  constructor(threshold = 0.7) {
    this.threshold = threshold
  }

  calculateConsensus(agents: Agent[]): number {
    const votes = agents.filter((agent) => agent.vote).map((agent) => agent.vote!)

    if (votes.length === 0) return 0

    // Calculate average vote score
    const averageScore = votes.reduce((sum, vote) => sum + vote.score, 0) / votes.length

    // Calculate vote distribution (how concentrated votes are)
    const voteTargets = new Map<string, number>()
    votes.forEach((vote) => {
      voteTargets.set(vote.targetAgentId, (voteTargets.get(vote.targetAgentId) || 0) + 1)
    })

    const maxVotes = Math.max(...Array.from(voteTargets.values()))
    const concentration = maxVotes / votes.length

    // Combine average score and concentration
    return averageScore * 0.7 + concentration * 0.3
  }

  hasReachedConsensus(agents: Agent[]): boolean {
    return this.calculateConsensus(agents) >= this.threshold
  }

  getConsensusLeader(agents: Agent[]): Agent | null {
    const votes = agents.filter((agent) => agent.vote).map((agent) => agent.vote!)

    if (votes.length === 0) return null

    const voteTargets = new Map<string, number>()
    votes.forEach((vote) => {
      voteTargets.set(vote.targetAgentId, (voteTargets.get(vote.targetAgentId) || 0) + 1)
    })

    const leaderId = Array.from(voteTargets.entries()).sort(([, a], [, b]) => b - a)[0]?.[0]

    return agents.find((agent) => agent.id === leaderId) || null
  }
}
