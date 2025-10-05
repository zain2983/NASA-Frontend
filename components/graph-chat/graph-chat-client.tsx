"use client"
import { useState } from "react"
import { GraphPanel } from "./graph-panel"
import { ChatPanel } from "./chat-panel"

export default function GraphChatClient() {
  const [graphResults, setGraphResults] = useState<any[]>([])
  const [graphStructure, setGraphStructure] = useState<any>(null)

  const handleGraphResults = (results: any[]) => {
    setGraphResults(results)
  }

  const handleGraphStructure = (structure: any) => {
    setGraphStructure(structure)
  }

  // 65/35 split on desktop, stacked on mobile
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[65%_35%] animate-in fade-in duration-300">
      <GraphPanel graphResults={graphResults} graphStructure={graphStructure} />
      <ChatPanel onGraphResults={handleGraphResults} onGraphStructure={handleGraphStructure} />
    </div>
  )
}
