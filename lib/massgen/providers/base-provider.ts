import type { AgentProvider } from "../types"

export interface AIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
  finishReason?: string
}

export interface ProviderConfig {
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
  tools?: string[]
}

export abstract class BaseAIProvider {
  protected config: ProviderConfig
  protected provider: AgentProvider

  constructor(provider: AgentProvider, config: ProviderConfig) {
    this.provider = provider
    this.config = config
  }

  abstract generateResponse(messages: AIMessage[]): Promise<AIResponse>
  abstract streamResponse(messages: AIMessage[]): AsyncGenerator<string, void, unknown>

  getProvider(): AgentProvider {
    return this.provider
  }

  getModel(): string {
    return this.config.model
  }

  protected validateApiKey(): void {
    if (!this.config.apiKey) {
      throw new Error(`API key is required for ${this.provider} provider`)
    }
  }
}
