import { BaseAIProvider, type AIMessage, type AIResponse, type ProviderConfig } from "./base-provider"

export class GeminiProvider extends BaseAIProvider {
  constructor(config: ProviderConfig) {
    super("gemini", config)
    this.validateApiKey()
  }

  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    const prompt = this.convertMessagesToPrompt(messages)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: this.config.temperature || 0.7,
            maxOutputTokens: this.config.maxTokens || 2000,
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
      model: this.config.model,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
    }
  }

  async *streamResponse(messages: AIMessage[]): AsyncGenerator<string, void, unknown> {
    const prompt = this.convertMessagesToPrompt(messages)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:streamGenerateContent?key=${this.config.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: this.config.temperature || 0.7,
            maxOutputTokens: this.config.maxTokens || 2000,
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
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
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line)
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text
              if (content) yield content
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

  private convertMessagesToPrompt(messages: AIMessage[]): string {
    return messages
      .map((msg) => {
        if (msg.role === "system") return `System: ${msg.content}`
        if (msg.role === "user") return `Human: ${msg.content}`
        return `Assistant: ${msg.content}`
      })
      .join("\n\n")
  }
}
