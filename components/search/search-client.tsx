"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// 👇 Define your API base URL here
const API_BASE_URL = "http://127.0.0.1:8000"

export default function SearchClient() {
  const [query, setQuery] = useState("")
  const [submitted, setSubmitted] = useState("")
  const [papers, setPapers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({}) // track expanded states

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return
    setSubmitted(trimmedQuery)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(trimmedQuery)}`)
      if (!res.ok) {
        throw new Error(`Error: ${res.status}`)
      }
      const data = await res.json()
      setPapers(data.results || [])
      setExpanded({}) // reset expanded state when new results load
    } catch (err) {
      console.error("Failed to fetch search results:", err)
      setPapers([])
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (idx: number) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-6xl items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search NASA bioscience..."
          className="h-11 transition-all focus-visible:ring-brand-purple"
        />
        <Button
          type="submit"
          className="h-11 bg-brand-purple text-foreground border-2 hover:opacity-90 transition-transform hover:bg-transparent hover:border-2 hover:border-brand-purple"
          disabled={!query.trim() || loading}
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      <div className="mx-auto max-w-6xl space-y-3">
        {submitted && !loading && papers.length === 0 && (
          <p className="text-sm text-muted-foreground">No results found. Try a different query.</p>
        )}

        {papers.map((p, idx) => {
          const isExpanded = expanded[idx] || false
          return (
            <Card
              key={idx}
              onClick={() => toggleExpand(idx)}
              className={cn(
                "group border-border/60 bg-card/50 transition-all cursor-pointer",
                "hover:border-(--color-brand-purple)/60 hover:bg-card/70 hover:-translate-y-0.5",
              )}
            >
              <CardContent className="p-4 space-y-2">
                {/* Header row with title and + / − toggle */}
                <div className="flex items-center justify-between">
                  {p.title && <h3 className="font-medium text-lg leading-tight">{p.title}</h3>}
                  <span className="text-xl select-none">{isExpanded ? "−" : "+"}</span>
                </div>

                {/* Snippet (collapsed view only) */}
                {!isExpanded && p.introduction && (
                  <p className="text-sm text-muted-foreground">
                    {p.introduction.length > 150
                      ? p.introduction.slice(0, 150) + "..."
                      : p.introduction}
                  </p>
                )}

                {/* Expandable content with smooth animation */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out",
                    isExpanded ? "max-h-[2000px] opacity-100 mt-2" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="space-y-2">
                    {Object.entries(p).map(([key, value]) => {
                      if (!value || key === "title") return null
                      return (
                        <div key={key} className="text-sm">
                          <span className="font-semibold capitalize">{key}: </span>
                          <span className="text-muted-foreground">{String(value)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
