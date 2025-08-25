import type { LogEntry, AgentState } from "../types"

interface SessionData {
  sessionId: string
  query: string
  startTime: number
  endTime?: number
  agentCount: number
  logs: LogEntry[]
  collaborationMessages: Array<{
    timestamp: number
    source: string
    message: string
    type: "system" | "agent"
  }>
  events: Array<{
    timestamp: number
    type: string
    data: any
  }>
}

export class SessionLogger {
  private sessions: Map<string, SessionData> = new Map()
  private logBuffer: LogEntry[] = []

  startSession(sessionId: string, query: string, agentCount: number) {
    const sessionData: SessionData = {
      sessionId,
      query,
      startTime: Date.now(),
      agentCount,
      logs: [],
      collaborationMessages: [],
      events: [],
    }

    this.sessions.set(sessionId, sessionData)
    this.logEvent(sessionId, {
      timestamp: Date.now(),
      level: "info",
      source: "session-logger",
      message: `Session started: ${sessionId} with ${agentCount} agents`,
    })

    console.log(`[SessionLogger] Started session ${sessionId}`)
  }

  endSession(sessionId: string, finalAnswer: string) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.endTime = Date.now()
      this.logEvent(sessionId, {
        timestamp: Date.now(),
        level: "info",
        source: "session-logger",
        message: `Session completed: ${sessionId}`,
      })

      this.addEvent(sessionId, "session_completed", {
        finalAnswer,
        duration: session.endTime - session.startTime,
      })

      console.log(`[SessionLogger] Completed session ${sessionId}`)
    }
  }

  logEvent(sessionId: string, logEntry: LogEntry) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.logs.push(logEntry)
    }
    this.logBuffer.push(logEntry)

    // Keep buffer size manageable
    if (this.logBuffer.length > 1000) {
      this.logBuffer = this.logBuffer.slice(-500)
    }
  }

  logCollaboration(sessionId: string, source: string, message: string) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.collaborationMessages.push({
        timestamp: Date.now(),
        source,
        message,
        type: source === "system" ? "system" : "agent",
      })
    }

    this.logEvent(sessionId, {
      timestamp: Date.now(),
      level: "info",
      source: "collaboration",
      message: `${source}: ${message}`,
    })
  }

  logAgentState(sessionId: string, agentId: string, state: Partial<AgentState>) {
    this.addEvent(sessionId, "agent_state_change", {
      agentId,
      state,
    })

    this.logEvent(sessionId, {
      timestamp: Date.now(),
      level: "info",
      source: agentId,
      message: `State changed to: ${state.status}`,
    })
  }

  addEvent(sessionId: string, type: string, data: any) {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.events.push({
        timestamp: Date.now(),
        type,
        data,
      })
    }
  }

  getSessionLogs(sessionId: string): LogEntry[] {
    const session = this.sessions.get(sessionId)
    return session ? session.logs : []
  }

  getSessionData(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId)
  }

  getAllSessions(): SessionData[] {
    return Array.from(this.sessions.values())
  }

  exportSessionLogs(sessionId: string, format: "json" | "jsonl" | "txt" = "json"): string {
    const session = this.sessions.get(sessionId)
    if (!session) return ""

    switch (format) {
      case "json":
        return JSON.stringify(session, null, 2)

      case "jsonl":
        return session.logs.map((log) => JSON.stringify(log)).join("\n")

      case "txt":
        return session.logs
          .map(
            (log) =>
              `[${new Date(log.timestamp).toISOString()}] ${log.level.toUpperCase()} ${log.source}: ${log.message}`,
          )
          .join("\n")

      default:
        return JSON.stringify(session, null, 2)
    }
  }

  generateSessionReport(sessionId: string): string {
    const session = this.sessions.get(sessionId)
    if (!session) return "Session not found"

    const duration = session.endTime ? session.endTime - session.startTime : Date.now() - session.startTime
    const durationMinutes = Math.round((duration / 60000) * 100) / 100

    return `# MassGen Session Report

**Session ID:** ${sessionId}
**Query:** ${session.query}
**Start Time:** ${new Date(session.startTime).toISOString()}
**End Time:** ${session.endTime ? new Date(session.endTime).toISOString() : "In Progress"}
**Duration:** ${durationMinutes} minutes
**Agent Count:** ${session.agentCount}

## Collaboration Messages
${session.collaborationMessages
  .map((msg) => `- **${msg.source}** (${new Date(msg.timestamp).toLocaleTimeString()}): ${msg.message}`)
  .join("\n")}

## System Events
${session.events
  .map(
    (event) => `- **${event.type}** (${new Date(event.timestamp).toLocaleTimeString()}): ${JSON.stringify(event.data)}`,
  )
  .join("\n")}

## Log Summary
- Total log entries: ${session.logs.length}
- Info messages: ${session.logs.filter((l) => l.level === "info").length}
- Warning messages: ${session.logs.filter((l) => l.level === "warning").length}
- Error messages: ${session.logs.filter((l) => l.level === "error").length}
`
  }

  clearSession(sessionId: string) {
    this.sessions.delete(sessionId)
    console.log(`[SessionLogger] Cleared session ${sessionId}`)
  }

  clearAllSessions() {
    this.sessions.clear()
    this.logBuffer = []
    console.log(`[SessionLogger] Cleared all sessions`)
  }
}
