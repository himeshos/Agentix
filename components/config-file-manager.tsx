"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import type { CollaborationConfig, AgentProvider } from "@/lib/massgen/types"

interface ConfigFileManagerProps {
  config: CollaborationConfig
  onConfigChange: (config: Partial<CollaborationConfig>) => void
  selectedModels: AgentProvider[]
  onModelsChange: (models: AgentProvider[]) => void
  configuredProviders: AgentProvider[]
}

export function ConfigFileManager({
  config,
  onConfigChange,
  selectedModels,
  onModelsChange,
  configuredProviders,
}: ConfigFileManagerProps) {
  const [configText, setConfigText] = useState("")
  const [presetName, setPresetName] = useState("")

  const generateConfigFile = () => {
    const configFile = {
      version: "2.0",
      collaboration: {
        maxRounds: config.maxRounds,
        consensusThreshold: config.consensusThreshold,
        timeoutMinutes: config.timeoutMinutes,
        enableVoting: config.enableVoting,
        enableDebate: config.enableDebate,
      },
      models: {
        selected: selectedModels,
        parameters: {
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        },
      },
      logging: {
        enabled: true,
        level: "info",
        exportFormat: "jsonl",
      },
    }

    return JSON.stringify(configFile, null, 2)
  }

  const loadConfigFromText = () => {
    try {
      const parsed = JSON.parse(configText)
      if (parsed.collaboration) {
        onConfigChange(parsed.collaboration)
      }
      if (parsed.models?.selected) {
        onModelsChange(parsed.models.selected)
      }
      if (parsed.models?.parameters) {
        onConfigChange({
          temperature: parsed.models.parameters.temperature,
          maxTokens: parsed.models.parameters.maxTokens,
        })
      }
    } catch (error) {
      console.error("Invalid JSON configuration:", error)
    }
  }

  const presetConfigs = {
    "Quick Analysis": {
      maxRounds: 1,
      consensusThreshold: 0.6,
      timeoutMinutes: 5,
      enableVoting: false,
      enableDebate: false,
      temperature: 0.5,
      maxTokens: 1000,
    },
    "Deep Collaboration": {
      maxRounds: 5,
      consensusThreshold: 0.8,
      timeoutMinutes: 15,
      enableVoting: true,
      enableDebate: true,
      temperature: 0.7,
      maxTokens: 3000,
    },
    "Balanced Research": {
      maxRounds: 3,
      consensusThreshold: 0.7,
      timeoutMinutes: 10,
      enableVoting: true,
      enableDebate: true,
      temperature: 0.6,
      maxTokens: 2000,
    },
  }

  const applyPreset = (preset: keyof typeof presetConfigs) => {
    onConfigChange(presetConfigs[preset])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration Management</CardTitle>
          <CardDescription>Manage collaboration settings, presets, and configuration files</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="files">Config Files</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Max Collaboration Rounds</Label>
                    <Slider
                      value={[config.maxRounds]}
                      onValueChange={([value]) => onConfigChange({ maxRounds: value })}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="text-sm text-muted-foreground mt-1">Current: {config.maxRounds} rounds</div>
                  </div>

                  <div>
                    <Label>Consensus Threshold</Label>
                    <Slider
                      value={[config.consensusThreshold]}
                      onValueChange={([value]) => onConfigChange({ consensusThreshold: value })}
                      max={1}
                      min={0.1}
                      step={0.1}
                      className="mt-2"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      Current: {config.consensusThreshold.toFixed(1)}
                    </div>
                  </div>

                  <div>
                    <Label>Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={config.timeoutMinutes}
                      onChange={(e) => onConfigChange({ timeoutMinutes: Number.parseInt(e.target.value) || 10 })}
                      min={1}
                      max={60}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Temperature</Label>
                    <Slider
                      value={[config.temperature]}
                      onValueChange={([value]) => onConfigChange({ temperature: value })}
                      max={2}
                      min={0}
                      step={0.1}
                      className="mt-2"
                    />
                    <div className="text-sm text-muted-foreground mt-1">Current: {config.temperature.toFixed(1)}</div>
                  </div>

                  <div>
                    <Label>Max Tokens</Label>
                    <Input
                      type="number"
                      value={config.maxTokens}
                      onChange={(e) => onConfigChange({ maxTokens: Number.parseInt(e.target.value) || 2000 })}
                      min={100}
                      max={8000}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Enable Voting</Label>
                      <Switch
                        checked={config.enableVoting}
                        onCheckedChange={(checked) => onConfigChange({ enableVoting: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Enable Debate</Label>
                      <Switch
                        checked={config.enableDebate}
                        onCheckedChange={(checked) => onConfigChange({ enableDebate: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Selected AI Models</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {configuredProviders.map((provider) => (
                    <Badge
                      key={provider}
                      variant={selectedModels.includes(provider) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        onModelsChange(
                          selectedModels.includes(provider)
                            ? selectedModels.filter((m) => m !== provider)
                            : [...selectedModels, provider],
                        )
                      }}
                    >
                      {provider.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(presetConfigs).map(([name, presetConfig]) => (
                  <Card
                    key={name}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => applyPreset(name as keyof typeof presetConfigs)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <div>Rounds: {presetConfig.maxRounds}</div>
                      <div>Consensus: {presetConfig.consensusThreshold}</div>
                      <div>Voting: {presetConfig.enableVoting ? "Yes" : "No"}</div>
                      <div>Debate: {presetConfig.enableDebate ? "Yes" : "No"}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label>Export Current Configuration</Label>
                  <Textarea value={generateConfigFile()} readOnly className="mt-2 font-mono text-xs" rows={15} />
                  <Button
                    onClick={() => {
                      const blob = new Blob([generateConfigFile()], { type: "application/json" })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = "massgen-config.json"
                      a.click()
                    }}
                    className="mt-2 w-full"
                  >
                    Download Config File
                  </Button>
                </div>

                <div>
                  <Label>Import Configuration</Label>
                  <Textarea
                    value={configText}
                    onChange={(e) => setConfigText(e.target.value)}
                    placeholder="Paste your configuration JSON here..."
                    className="mt-2 font-mono text-xs"
                    rows={15}
                  />
                  <Button onClick={loadConfigFromText} className="mt-2 w-full">
                    Load Configuration
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
