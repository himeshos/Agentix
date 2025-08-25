import { BaseAIProvider, type AIMessage, type AIResponse, type ProviderConfig } from "./base-provider"

export class AnthropicProvider extends BaseAIProvider {
  constructor(config: ProviderConfig) {
    super("anthropic", config)
    this.validateApiKey()
  }

  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    const { system, messages: anthropicMessages } = this.convertMessages(messages)

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens || 2000,
        temperature: this.config.temperature || 0.7,
        system,
        messages: anthropicMessages,
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      content: data.content?.[0]?.text || "",
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      model: data.model,
    }
  }

  async *streamResponse(messages: AIMessage[]): AsyncGenerator<string, void, unknown> {
    const { system, messages: anthropicMessages } = this.convertMessages(messages)

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens || 2000,
        temperature: this.config.temperature || 0.7,
        system,
        messages: anthropicMessages,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error("No response body")

    const decoder = new TextDecoder()
    let buffer = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") return

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === "content_block_delta") {
                const content = parsed.delta?.text
                if (content) yield content
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  private convertMessages(messages: AIMessage[]): { system?: string; messages: any[] } {
    const systemMessage = messages.find((msg) => msg.role === "system")
    const nonSystemMessages = messages.filter((msg) => msg.role !== "system")

    return {
      system: systemMessage?.content,
      messages: nonSystemMessages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
    }
  }
}
