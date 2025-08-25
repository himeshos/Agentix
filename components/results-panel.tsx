"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, ThumbsUp, ThumbsDown } from "lucide-react"
import type { MassGenOrchestrator } from "@/lib/massgen/orchestrator"
import type { SessionState } from "@/lib/massgen/types"

interface ResultsPanelProps {
  orchestrator: MassGenOrchestrator
  sessionId: string
}

export function ResultsPanel({ orchestrator, sessionId }: ResultsPanelProps) {
  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [selectedTab, setSelectedTab] = useState("final")

  useEffect(() => {
    const updateState = () => {
      const state = orchestrator.getSessionState(sessionId)
      setSessionState(state)
    }

    updateState()
    const interval = setInterval(updateState, 1000)
    return () => clearInterval(interval)
  }, [orchestrator, sessionId])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportResults = () => {
    if (!sessionState) return

    const results = {
      query: sessionState.query,
      finalAnswer: sessionState.finalAnswer,
      consensusScore: sessionState.consensusScore,
      agents: sessionState.agents.map((agent) => ({
        provider: agent.config.provider,
        proposedAnswer: agent.proposedAnswer,
        vote: agent.vote,
      })),
      duration: sessionState.endTime ? sessionState.endTime - sessionState.startTime : null,
    }

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `massgen-results-${sessionId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!sessionState) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-pulse">Loading results...</div>
        </CardContent>
      </Card>
    )
  }

  const duration = sessionState.endTime
    ? Math.round((sessionState.endTime - sessionState.startTime) / 1000)
    : Math.round((Date.now() - sessionState.startTime) / 1000)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Results</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Duration: {duration}s</Badge>
            {sessionState.consensusScore && (
              <Badge variant="outline">Consensus: {Math.round(sessionState.consensusScore * 100)}%</Badge>
            )}
            <Button variant="outline" size="sm" onClick={exportResults}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="final">Final Answer</TabsTrigger>
            <TabsTrigger value="individual">Individual Responses</TabsTrigger>
            <TabsTrigger value="voting">Voting Results</TabsTrigger>
            <TabsTrigger value="logs">Session Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="final" className="space-y-4">
            {sessionState.finalAnswer ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Consensus Answer</h3>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(sessionState.finalAnswer || "")}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{sessionState.finalAnswer}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Helpful
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Not Helpful
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {sessionState.phase === "completed"
                  ? "No consensus reached"
                  : "Agents are still working on the answer..."}
              </div>
            )}
          </TabsContent>

          <TabsContent value="individual" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {sessionState.agents.map((agent) => (
                  <div key={agent.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{agent.config.provider.toUpperCase()}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(agent.proposedAnswer || "")}
                        disabled={!agent.proposedAnswer}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    {agent.proposedAnswer ? (
                      <p className="text-sm whitespace-pre-wrap">{agent.proposedAnswer}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        {agent.status === "thinking" ? "Still thinking..." : "No response yet"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="voting" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {sessionState.agents.map((agent) => (
                  <div key={agent.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{agent.config.provider.toUpperCase()}</Badge>
                      {agent.vote && <Badge variant="secondary">Score: {Math.round(agent.vote.score * 100)}%</Badge>}
                    </div>
                    {agent.vote ? (
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Voted for:</strong>{" "}
                          {sessionState.agents
                            .find((a) => a.id === agent.vote?.targetAgentId)
                            ?.config.provider.toUpperCase() || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Reasoning:</strong> {agent.vote.reasoning}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No vote cast yet</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Session Logs</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{sessionState.logs.length} entries</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const logsText = sessionState.logs
                      .map(
                        (log) =>
                          `[${new Date(log.timestamp).toISOString()}] ${log.level.toUpperCase()} ${log.source}: ${log.message}`,
                      )
                      .join("\n")
                    copyToClipboard(logsText)
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Logs
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {sessionState.logs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No logs available</div>
                ) : (
                  sessionState.logs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg text-sm">
                      <Badge
                        variant={
                          log.level === "error" ? "destructive" : log.level === "warning" ? "secondary" : "outline"
                        }
                        className="text-xs shrink-0"
                      >
                        {log.level.toUpperCase()}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-xs">{log.source}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm break-words">{log.message}</p>
                        {log.data && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer">Show data</summary>
                            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
