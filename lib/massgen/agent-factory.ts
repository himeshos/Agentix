import type { AgentConfig, Agent, AgentProvider } from "./types"

export class AgentFactory {
  static createAgent(config: AgentConfig): Agent {
    return {
      id: config.id,
      config,
      status: "idle",
      collaborationHistory: [],
    }
  }

  static getDefaultModelForProvider(provider: AgentProvider): string {
    const modelMap = {
      openai: "gpt-4o",
      gemini: "gemini-2.5-flash",
      xai: "grok-3-mini",
      anthropic: "claude-3-5-sonnet",
    }
    return modelMap[provider]
  }

  static createAgentConfigs(providers: AgentProvider[]): AgentConfig[] {
    return providers.map((provider, index) => ({
      id: `agent_${index + 1}`,
      provider,
      model: this.getDefaultModelForProvider(provider),
      temperature: 0.7,
      maxTokens: 2000,
      tools: this.getDefaultToolsForProvider(provider),
    }))
  }

  private static getDefaultToolsForProvider(provider: AgentProvider): string[] {
    const toolMap = {
      openai: ["web_search", "code_execution"],
      gemini: ["web_search", "code_execution", "multimodal_analysis"],
      xai: ["web_search", "real_time_data"],
      anthropic: ["web_search", "document_analysis"],
    }
    return toolMap[provider]
  }
}
