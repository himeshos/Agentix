"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { AgentProvider } from "@/lib/massgen/types"

interface CliInterfaceProps {
  configuredProviders: AgentProvider[]
  onStartSession: () => void
  isRunning: boolean
}

interface CliMessage {
  type: "input" | "output" | "system"
  content: string
  timestamp: number
}

export function CliInterface({ configuredProviders, onStartSession, isRunning }: CliInterfaceProps) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<CliMessage[]>([
    {
      type: "system",
      content: "MassGen CLI v2.0 - Multi-Agent Collaboration System",
      timestamp: Date.now(),
    },
    {
      type: "system",
      content: `Available providers: ${configuredProviders.join(", ")}`,
      timestamp: Date.now(),
    },
    {
      type: "system",
      content: "Type 'help' for available commands",
      timestamp: Date.now(),
    },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const addMessage = (type: CliMessage["type"], content: string) => {
    setMessages((prev) => [...prev, { type, content, timestamp: Date.now() }])
  }

  const handleCommand = (command: string) => {
    addMessage("input", `> ${command}`)

    const cmd = command.toLowerCase().trim()

    if (cmd === "help") {
      addMessage(
        "output",
        `Available commands:
  help                 - Show this help message
  status              - Show system status
  providers           - List configured AI providers
  start <query>       - Start multi-agent collaboration
  clear               - Clear terminal
  config              - Show current configuration`,
      )
    } else if (cmd === "status") {
      addMessage(
        "output",
        `System Status:
  Providers: ${configuredProviders.length} configured
  Status: ${isRunning ? "Running" : "Ready"}
  CLI Mode: Active`,
      )
    } else if (cmd === "providers") {
      addMessage(
        "output",
        `Configured Providers:
${configuredProviders.map((p) => `  - ${p.toUpperCase()}`).join("\n")}`,
      )
    } else if (cmd.startsWith("start ")) {
      const query = command.substring(6).trim()
      if (query) {
        addMessage("output", `Starting multi-agent collaboration for: "${query}"`)
        addMessage("system", "Switching to GUI mode for collaboration visualization...")
        onStartSession()
      } else {
        addMessage("output", "Error: Please provide a query. Usage: start <your question>")
      }
    } else if (cmd === "clear") {
      setMessages([
        {
          type: "system",
          content: "MassGen CLI v2.0 - Multi-Agent Collaboration System",
          timestamp: Date.now(),
        },
      ])
    } else if (cmd === "config") {
      addMessage(
        "output",
        `Current Configuration:
  Max Rounds: 3
  Consensus Threshold: 0.7
  Timeout: 10 minutes
  Voting: Enabled
  Debate: Enabled`,
      )
    } else if (cmd === "") {
      // Empty command, do nothing
    } else {
      addMessage("output", `Unknown command: ${cmd}. Type 'help' for available commands.`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      handleCommand(input)
      setInput("")
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="font-mono">$</span>
          MassGen CLI Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="font-mono text-sm space-y-1">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${
                  message.type === "input"
                    ? "text-blue-400"
                    : message.type === "system"
                      ? "text-green-400"
                      : "text-foreground"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 flex items-center gap-2">
              <span className="font-mono text-green-400">massgen@cli:~$</span>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter command..."
                className="font-mono"
                disabled={isRunning}
              />
            </div>
            <Button type="submit" disabled={isRunning}>
              Execute
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
