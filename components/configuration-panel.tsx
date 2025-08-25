"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ConfigurationPanelProps {
  disabled?: boolean
}

export function ConfigurationPanel({ disabled = false }: ConfigurationPanelProps) {
  const [maxDuration, setMaxDuration] = useState([300])
  const [consensusThreshold, setConsensusThreshold] = useState([0.7])
  const [maxIterations, setMaxIterations] = useState([5])
  const [enableTools, setEnableTools] = useState(false)
  const [temperature, setTemperature] = useState([0.7])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Max Duration */}
        <div className="space-y-2">
          <Label>Max Duration: {maxDuration[0]}s</Label>
          <Slider
            value={maxDuration}
            onValueChange={setMaxDuration}
            max={600}
            min={60}
            step={30}
            disabled={disabled}
            className="w-full"
          />
        </div>

        {/* Consensus Threshold */}
        <div className="space-y-2">
          <Label>Consensus Threshold: {Math.round(consensusThreshold[0] * 100)}%</Label>
          <Slider
            value={consensusThreshold}
            onValueChange={setConsensusThreshold}
            max={1}
            min={0.5}
            step={0.05}
            disabled={disabled}
            className="w-full"
          />
        </div>

        {/* Max Iterations */}
        <div className="space-y-2">
          <Label>Max Iterations: {maxIterations[0]}</Label>
          <Slider
            value={maxIterations}
            onValueChange={setMaxIterations}
            max={10}
            min={1}
            step={1}
            disabled={disabled}
            className="w-full"
          />
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <Label>Temperature: {temperature[0]}</Label>
          <Slider
            value={temperature}
            onValueChange={setTemperature}
            max={1}
            min={0}
            step={0.1}
            disabled={disabled}
            className="w-full"
          />
        </div>

        {/* Enable Tools */}
        <div className="flex items-center space-x-2">
          <Switch id="enable-tools" checked={enableTools} onCheckedChange={setEnableTools} disabled={disabled} />
          <Label htmlFor="enable-tools">Enable Agent Tools</Label>
        </div>

        {/* Collaboration Strategy */}
        <div className="space-y-2">
          <Label>Collaboration Strategy</Label>
          <Select disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Select strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="democratic">Democratic Voting</SelectItem>
              <SelectItem value="hierarchical">Hierarchical</SelectItem>
              <SelectItem value="consensus">Consensus Building</SelectItem>
              <SelectItem value="competitive">Competitive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
