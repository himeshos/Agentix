import type { Agent, AgentConfig, CollaborationMessage } from "./types"
import type { BaseAIProvider, AIMessage } from "./providers/base-provider"
import { ProviderFactory } from "./providers/provider-factory"

export class AIAgent implements Agent {
  id: string
  config: AgentConfig
  status: Agent["status"] = "idle"
  currentThought?: string
  proposedAnswer?: string
  vote?: Agent["vote"]
  collaborationHistory: CollaborationMessage[] = []

  private provider: BaseAIProvider

  constructor(config: AgentConfig) {
    this.id = config.id
    this.config = config
    this.provider = ProviderFactory.createProvider(config.provider, config.model, {
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      tools: config.tools,
    })
  }

  async processQuery(query: string, context?: CollaborationMessage[]): Promise<string> {
    this.status = "thinking"
    this.currentThought = `Analyzing query: ${query.substring(0, 100)}...`

    const messages: AIMessage[] = [
      {
        role: "system",
        content: this.getSystemPrompt(),
      },
      {
        role: "user",
        content: this.buildPromptWithContext(query, context),
      },
    ]

    try {
      const response = await this.provider.generateResponse(messages)
      this.proposedAnswer = response.content
      this.status = "collaborating"
      return response.content
    } catch (error) {
      this.status = "error"
      throw new Error(`Agent ${this.id} failed to process query: ${error}`)
    }
  }

  async *streamResponse(query: string, context?: CollaborationMessage[]): AsyncGenerator<string, void, unknown> {
    this.status = "thinking"
    this.currentThought = `Streaming analysis for: ${query.substring(0, 100)}...`

    const messages: AIMessage[] = [
      {
        role: "system",
        content: this.getSystemPrompt(),
      },
      {
        role: "user",
        content: this.buildPromptWithContext(query, context),
      },
    ]

    try {
      let fullResponse = ""
      for await (const chunk of this.provider.streamResponse(messages)) {
        fullResponse += chunk
        yield chunk
      }
      this.proposedAnswer = fullResponse
      this.status = "collaborating"
    } catch (error) {
      this.status = "error"
      throw new Error(`Agent ${this.id} failed to stream response: ${error}`)
    }
  }

  addCollaborationMessage(message: CollaborationMessage) {
    if (message.agentId !== this.id) {
      this.collaborationHistory.push(message)
    }
  }

  voteOnAnswer(targetAgentId: string, answer: string): Agent["vote"] {
    this.status = "voting"

    // Simple scoring based on answer quality (in real implementation, this would use AI)
    const score = Math.min(0.9, 0.5 + (answer.length / 1000) * 0.4)

    this.vote = {
      targetAgentId,
      score,
      reasoning: `As a ${this.config.provider} agent, I evaluate this answer based on comprehensiveness and accuracy.`,
      timestamp: Date.now(),
    }

    return this.vote
  }

  private getSystemPrompt(): string {
    const providerPersonalities = {
      openai:
        "You are a GPT-4o agent focused on structured reasoning and comprehensive analysis. You excel at breaking down complex problems and providing detailed, well-reasoned responses.",
      gemini:
        "You are a Gemini agent with multimodal capabilities and strong analytical skills. You approach problems with creativity and can handle diverse types of information.",
      xai: "You are a Grok agent with access to real-time information and a focus on current events. You provide up-to-date insights and can handle dynamic, evolving situations.",
      anthropic:
        "You are a Claude agent emphasizing safety, helpfulness, and ethical considerations. You provide balanced, thoughtful responses with careful attention to potential implications.",
    }

    return `${providerPersonalities[this.config.provider]}

You are participating in a multi-agent collaboration system called MassGen. Your role is to:
1. Analyze the given query thoroughly from your unique perspective
2. Provide your best answer based on your capabilities
3. Consider insights from other agents when available
4. Contribute to the collaborative problem-solving process

Be concise but comprehensive. Focus on your strengths as a ${this.config.provider} model.`
  }

  private buildPromptWithContext(query: string, context?: CollaborationMessage[]): string {
    let prompt = `Query: ${query}`

    if (context && context.length > 0) {
      prompt += "\n\nCollaboration Context:\n"
      context.forEach((msg, index) => {
        prompt += `${index + 1}. Agent ${msg.agentId} (${msg.type}): ${msg.content}\n`
      })
      prompt += "\nConsidering the above insights from other agents, provide your analysis:"
    }

    return prompt
  }

  getProvider(): BaseAIProvider {
    return this.provider
  }
}
