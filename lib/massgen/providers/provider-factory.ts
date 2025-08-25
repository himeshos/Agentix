import type { AgentProvider } from "../types"
import type { BaseAIProvider, ProviderConfig } from "./base-provider"
import { OpenAIProvider } from "./openai-provider"
import { GeminiProvider } from "./gemini-provider"
import { XAIProvider } from "./xai-provider"
import { AnthropicProvider } from "./anthropic-provider"

export class ProviderFactory {
  private static apiKeys: Map<AgentProvider, string> = new Map()

  static setApiKey(provider: AgentProvider, apiKey: string) {
    this.apiKeys.set(provider, apiKey)
  }

  static getApiKey(provider: AgentProvider): string | undefined {
    return this.apiKeys.get(provider)
  }

  static createProvider(provider: AgentProvider, model: string, config?: Partial<ProviderConfig>): BaseAIProvider {
    const apiKey = this.getApiKey(provider) || this.getApiKeyFromEnv(provider)

    if (!apiKey) {
      throw new Error(
        `API key not found for ${provider}. Please set it using ProviderFactory.setApiKey() or environment variables.`,
      )
    }

    const providerConfig: ProviderConfig = {
      apiKey,
      model,
      temperature: config?.temperature || 0.7,
      maxTokens: config?.maxTokens || 2000,
      tools: config?.tools || [],
    }

    switch (provider) {
      case "openai":
        return new OpenAIProvider(providerConfig)
      case "gemini":
        return new GeminiProvider(providerConfig)
      case "xai":
        return new XAIProvider(providerConfig)
      case "anthropic":
        return new AnthropicProvider(providerConfig)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  private static getApiKeyFromEnv(provider: AgentProvider): string | undefined {
    const envMap = {
      openai: process.env.OPENAI_API_KEY,
      gemini: process.env.GEMINI_API_KEY,
      xai: process.env.XAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
    }
    return envMap[provider]
  }

  static getDefaultModel(provider: AgentProvider): string {
    const modelMap = {
      openai: "gpt-4o",
      gemini: "gemini-2.5-flash",
      xai: "grok-3-mini",
      anthropic: "claude-3-5-sonnet",
    }
    return modelMap[provider]
  }

  static getSupportedProviders(): AgentProvider[] {
    return ["openai", "gemini", "xai", "anthropic"]
  }

  static validateProvider(provider: string): provider is AgentProvider {
    return this.getSupportedProviders().includes(provider as AgentProvider)
  }
}
