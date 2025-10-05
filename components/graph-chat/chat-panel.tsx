"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

type Msg = { role: "user" | "assistant"; content: string }

export function ChatPanel() {
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
      const res = await fetch("/graph-rag/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history: messages }),
      })
      const json = await res.json().catch(() => ({}))
      const reply =
        json?.reply ??
        json?.content ??
        json?.message ??
        (Array.isArray(json?.messages) ? json.messages.at(-1)?.content : null) ??
        "No response."
      setMessages((m) => [...m, { role: "assistant", content: String(reply) }])
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Error contacting the chat endpoint." }])
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
                  className={`max-w-[85%] rounded-md px-3 py-2 transition-colors ${
                    m.role === "user" ? "ml-auto bg-brand-blue text-foreground" : "mr-auto bg-secondary/40"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{m.content}</p>
                </li>
              ))}
              {messages.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  Ask about entities, relations, and findings from the knowledge graph.
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
