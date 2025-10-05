"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { config } from "@/lib/config"
import { Badge } from "@/components/ui/badge"

type Msg = { 
  role: "user" | "assistant"; 
  content: string;
  graphResults?: any[];
  entities?: string[];
  graphStructure?: any;
}

// Function to format AI response with proper styling
const formatAIResponse = (content: string) => {
  // Split content by sections
  const sections = content.split(/\*\*(\d+\.\s+[^*]+)\*\*/g);
  
  if (sections.length === 1) {
    // No structured sections, return as is with basic formatting
    return (
      <div className="prose prose-sm max-w-none text-foreground">
        {content.split('\n').map((line, idx) => (
          <p key={idx} className="mb-2 leading-relaxed">
            {line.trim()}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => {
        if (idx === 0 && section.trim()) {
          // Introduction text
          return (
            <div key={idx} className="prose prose-sm max-w-none text-foreground">
              {section.split('\n').map((line, lineIdx) => (
                <p key={lineIdx} className="mb-2 leading-relaxed">
                  {line.trim()}
                </p>
              ))}
            </div>
          );
        }
        
        if (idx % 2 === 1) {
          // Section headers
          const header = section.trim();
          const sectionContent = sections[idx + 1]?.trim() || '';
          
          return (
            <div key={idx} className="space-y-2">
              <h4 className="font-semibold text-primary text-sm flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold">
                  {header.match(/^(\d+)\./)?.[1] || '•'}
                </span>
                {header}
              </h4>
              
              {sectionContent && (
                <div className="ml-8 space-y-2">
                  {sectionContent.split('\n').filter(line => line.trim()).map((line, lineIdx) => {
                    // Check if it's a bullet point
                    if (line.trim().startsWith('*')) {
                      return (
                        <div key={lineIdx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-sm leading-relaxed">
                            {line.trim().substring(1).trim()}
                          </span>
                        </div>
                      );
                    }
                    
                    // Regular paragraph
                    return (
                      <p key={lineIdx} className="text-sm leading-relaxed text-muted-foreground">
                        {line.trim()}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
};

interface ChatPanelProps {
  onGraphResults?: (results: any[]) => void;
  onGraphStructure?: (structure: any) => void;
}

export function ChatPanel({ onGraphResults, onGraphStructure }: ChatPanelProps) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = input.trim()
    if (!q) return
    setMessages((m) => [...m, { role: "user", content: q }])
    setInput("")
    setLoading(true)
    try {
      const res = await fetch(`${config.API_BASE_URL}${config.GRAPH_RAG.CHAT}?query=${encodeURIComponent(q)}&limit=5`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      const json = await res.json().catch(() => ({}))
      console.log('ChatPanel - Full API response:', json)
      const reply = json?.response || "No response."
      const graphResults = json?.graph_results || []
      const entities = json?.context_papers?.flatMap((paper: any) => paper.entities || []) || []
      const graphStructure = json?.graph_structure || null
      console.log('ChatPanel - graphStructure:', graphStructure)
      
      const newMessage = { 
        role: "assistant" as const, 
        content: String(reply),
        graphResults,
        entities,
        graphStructure
      }
      setMessages((m) => [...m, newMessage])
      
      // Pass graph results to parent component for visualization
      if (onGraphResults && graphResults.length > 0) {
        onGraphResults(graphResults)
      }
      
      // Pass graph structure to parent component for visualization
      if (onGraphStructure && graphStructure) {
        onGraphStructure(graphStructure)
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Error contacting the Graph RAG endpoint." }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <Card className="h-[70vh] md:h-[78vh] bg-card/50 backdrop-blur border-border/60">
      <CardContent className="h-full p-0 flex flex-col">
        <div className="px-4 py-3 border-b border-border/60">
          <h3 className="font-medium">Chat</h3>
        </div>
        <div className="flex-1">
          <ScrollArea className="h-full">
            <ul className="p-4 space-y-3">
              {messages.map((m, i) => (
                <li
                  key={i}
                  className={`max-w-[85%] rounded-lg px-4 py-3 transition-colors ${
                    m.role === "user" 
                      ? "ml-auto bg-brand-blue text-foreground" 
                      : "mr-auto bg-card border border-border/60"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="space-y-3">
                      {formatAIResponse(m.content)}
                      
                      {m.entities && m.entities.length > 0 && (
                        <div className="pt-2 border-t border-border/40">
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-medium text-muted-foreground">Related Entities:</span>
                            {m.entities.slice(0, 6).map((entity, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {entity}
                              </Badge>
                            ))}
                            {m.entities.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{m.entities.length - 6} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{m.content}</p>
                  )}
                </li>
              ))}
              {messages.length === 0 && (
                <li className="text-center py-8">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm text-muted-foreground mb-2 font-medium">
                    Ask about entities, relations, and findings from the knowledge graph.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try questions like "epinephrine surgery" or "spaceflight effects"
                  </p>
                </li>
              )}
            </ul>
          </ScrollArea>
        </div>
        <form onSubmit={send} className="p-3 border-t border-border/60 flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the knowledge engine…"
            className="h-11 focus-visible:ring-brand-purple"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-11 bg-brand-purple text-foreground hover:opacity-90 transition-opacity"
          >
            {loading ? "Sending…" : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
