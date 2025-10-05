"use client"
import { GraphPanel } from "./graph-panel"
import { ChatPanel } from "./chat-panel"

export default function GraphChatClient() {
  // 65/35 split on desktop, stacked on mobile
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[65%_35%] animate-in fade-in duration-300">
      <GraphPanel />
      <ChatPanel />
    </div>
  )
}
