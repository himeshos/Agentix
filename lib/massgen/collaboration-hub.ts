import type { CollaborationMessage } from "./types"

export class CollaborationHub {
  private messages: CollaborationMessage[] = []
  private subscribers: Map<string, (message: CollaborationMessage) => void> = new Map()

  broadcastMessage(message: CollaborationMessage) {
    this.messages.push(message)
    this.subscribers.forEach((callback) => callback(message))
  }

  subscribe(agentId: string, callback: (message: CollaborationMessage) => void) {
    this.subscribers.set(agentId, callback)
  }

  unsubscribe(agentId: string) {
    this.subscribers.delete(agentId)
  }

  getMessages(): CollaborationMessage[] {
    return [...this.messages]
  }

  getMessagesForAgent(agentId: string): CollaborationMessage[] {
    return this.messages.filter((msg) => msg.agentId !== agentId) // Exclude own messages
  }

  clear() {
    this.messages = []
    this.subscribers.clear()
  }
}
