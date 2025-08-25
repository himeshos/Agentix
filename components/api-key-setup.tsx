"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Key, CheckCircle } from "lucide-react"
import { ProviderFactory } from "@/lib/massgen/providers/provider-factory"
import type { AgentProvider } from "@/lib/massgen/types"

interface ApiKeySetupProps {
  onKeysConfigured: (configuredProviders: AgentProvider[]) => void
}

export function ApiKeySetup({ onKeysConfigured }: ApiKeySetupProps) {
  const [apiKeys, setApiKeys] = useState<Record<AgentProvider, string>>({
    openai: "",
    gemini: "",
    xai: "",
    anthropic: "",
  })
  const [showKeys, setShowKeys] = useState<Record<AgentProvider, boolean>>({
    openai: false,
    gemini: false,
    xai: false,
    anthropic: false,
  })
  const [configuredProviders, setConfiguredProviders] = useState<Set<AgentProvider>>(new Set())

  const providerInfo = {
    openai: {
      name: "OpenAI",
      model: "GPT-4o",
      description: "Advanced reasoning and structured analysis",
      color: "bg-green-100 text-green-800",
    },
    gemini: {
      name: "Google Gemini",
      model: "Gemini 2.5 Flash",
      description: "Multimodal capabilities and creative analysis",
      color: "bg-blue-100 text-blue-800",
    },
    xai: {
      name: "xAI Grok",
      model: "Grok 3 Mini",
      description: "Real-time information and current events",
      color: "bg-purple-100 text-purple-800",
    },
    anthropic: {
      name: "Anthropic Claude",
      model: "Claude 3.5 Sonnet",
      description: "Safety-focused and ethical reasoning",
      color: "bg-orange-100 text-orange-800",
    },
  }

  const handleApiKeyChange = (provider: AgentProvider, value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }))
  }

  const handleConfigureProvider = (provider: AgentProvider) => {
    const apiKey = apiKeys[provider].trim()
    if (apiKey) {
      ProviderFactory.setApiKey(provider, apiKey)
      setConfiguredProviders((prev) => new Set([...prev, provider]))
    }
  }

  const handleStartCollaboration = () => {
    const configured = Array.from(configuredProviders)
    if (configured.length > 0) {
      onKeysConfigured(configured)
    }
  }

  const toggleShowKey = (provider: AgentProvider) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Key className="h-6 w-6" />
          AI Provider Setup
        </CardTitle>
        <CardDescription>
          Configure API keys for the AI providers you want to use in the multi-agent collaboration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(providerInfo) as AgentProvider[]).map((provider) => {
            const info = providerInfo[provider]
            const isConfigured = configuredProviders.has(provider)
            const hasApiKey = apiKeys[provider].trim().length > 0

            return (
              <Card key={provider} className={`relative ${isConfigured ? "ring-2 ring-green-500" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{info.name}</CardTitle>
                      <Badge variant="outline" className={info.color}>
                        {info.model}
                      </Badge>
                    </div>
                    {isConfigured && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                  <CardDescription className="text-sm">{info.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`${provider}-key`}>API Key</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={`${provider}-key`}
                          type={showKeys[provider] ? "text" : "password"}
                          placeholder={`Enter ${info.name} API key`}
                          value={apiKeys[provider]}
                          onChange={(e) => handleApiKeyChange(provider, e.target.value)}
                          disabled={isConfigured}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleShowKey(provider)}
                        >
                          {showKeys[provider] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleConfigureProvider(provider)}
                        disabled={!hasApiKey || isConfigured}
                        size="sm"
                      >
                        {isConfigured ? "Configured" : "Set"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            Configured providers: {configuredProviders.size} / {Object.keys(providerInfo).length}
          </div>
          <Button
            onClick={handleStartCollaboration}
            disabled={configuredProviders.size === 0}
            size="lg"
            className="w-full md:w-auto"
          >
            Start Multi-Agent Collaboration ({configuredProviders.size} agents)
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Note:</strong> API keys are stored locally in your browser session and are not sent to any external
            servers except the respective AI providers.
          </p>
          <div className="space-y-1">
            <p>Get API keys from:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>OpenAI: platform.openai.com</li>
              <li>Google Gemini: aistudio.google.com</li>
              <li>xAI Grok: console.x.ai</li>
              <li>Anthropic Claude: console.anthropic.com</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
