"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import type { MassGenOrchestrator } from "@/lib/massgen/orchestrator"
import type { SessionState, CollaborationMessage } from "@/lib/massgen/types"

interface AgentCollaborationViewProps {
  orchestrator: MassGenOrchestrator
  sessionId: string
}

export function AgentCollaborationView({ orchestrator, sessionId }: AgentCollaborationViewProps) {
  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [messages, setMessages] = useState<CollaborationMessage[]>([])

  useEffect(() => {
    const updateState = () => {
      const state = orchestrator.getSessionState(sessionId)
      setSessionState(state)

      if (state) {
        const allMessages = state.agents.flatMap((agent) => agent.collaborationHistory)
        setMessages(allMessages.sort((a, b) => a.timestamp - b.timestamp))
      }
    }

    // Initial update
    updateState()

    // Set up polling for updates
    const interval = setInterval(updateState, 1000)
    return () => clearInterval(interval)
  }, [orchestrator, sessionId])

  if (!sessionState) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <CardContent className="text-center">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p>Loading collaboration session...</p>
        </CardContent>
      </Card>
    )
  }

  const getPhaseProgress = () => {
    const phases = ["initializing", "thinking", "collaborating", "voting", "converging", "completed"]
    const currentIndex = phases.indexOf(sessionState.phase)
    return ((currentIndex + 1) / phases.length) * 100
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "thinking":
        return "bg-blue-500"
      case "collaborating":
        return "bg-green-500"
      case "voting":
        return "bg-purple-500"
      case "completed":
        return "bg-gray-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "insight":
        return "💡"
      case "question":
        return "❓"
      case "refinement":
        return "🔧"
      case "vote":
        return "🗳️"
      default:
        return "💬"
    }
  }

  return (
    <div className="space-y-4">
      {/* Session Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Collaboration Session</span>
            <Badge variant={sessionState.phase === "completed" ? "default" : "secondary"}>
              {sessionState.phase.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(getPhaseProgress())}%</span>
            </div>
            <Progress value={getPhaseProgress()} className="h-2" />
          </div>

          {sessionState.consensusScore && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Consensus Score</span>
                <span>{Math.round(sessionState.consensusScore * 100)}%</span>
              </div>
              <Progress value={sessionState.consensusScore * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agents Status */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessionState.agents.map((agent) => (
              <div key={agent.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                <div className="flex-1">
                  <div className="font-medium">{agent.config.provider.toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">{agent.status}</div>
                  {agent.currentThought && (
                    <div className="text-xs text-muted-foreground mt-1 truncate">{agent.currentThought}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Collaboration Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No collaboration messages yet...</div>
              ) : (
                messages.map((message, index) => {
                  const agent = sessionState.agents.find((a) => a.id === message.agentId)
                  return (
                    <div key={index} className="flex space-x-3 p-3 border rounded-lg">
                      <div className="text-lg">{getMessageIcon(message.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {agent?.config.provider.toUpperCase() || "Unknown"}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {message.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
