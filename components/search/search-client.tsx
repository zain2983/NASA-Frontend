"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const DEMO_RESULTS = [
  {
    id: "nasa-001",
    title: "Microgravity Effects on Gene Expression in Arabidopsis",
    summary:
      "Study exploring differential gene expression profiles in Arabidopsis thaliana under microgravity conditions aboard the ISS.",
  },
  {
    id: "nasa-002",
    title: "Radiation-Induced DNA Repair Pathways in Human Fibroblasts",
    summary: "An analysis of DNA double-strand break repair mechanisms after simulated cosmic radiation exposure.",
  },
  {
    id: "nasa-003",
    title: "Muscle Atrophy Mitigation Strategies in Long-Duration Spaceflight",
    summary:
      "Systematic review of countermeasures including resistive exercise and pharmacological interventions to reduce muscle loss.",
  },
  {
    id: "nasa-004",
    title: "Microbiome Dynamics in Closed Habitat Environments",
    summary:
      "Temporal changes in microbial communities aboard confined habitats and their implications for astronaut health.",
  },
  {
    id: "nasa-005",
    title: "Plant Root Morphogenesis in Fractional Gravity",
    summary:
      "Insights into root growth orientation and hormone signaling pathways under partial gravity using clinostat experiments.",
  },
]

export default function SearchClient() {
  const [query, setQuery] = useState("")
  const [submitted, setSubmitted] = useState("")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(query.trim())
  }

  const papers = (() => {
    if (!submitted) return DEMO_RESULTS
    const q = submitted.toLowerCase()
    return DEMO_RESULTS.filter((p) => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q))
  })()

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-2xl items-center gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search NASA bioscience..."
          className="h-11 transition-all focus-visible:ring-brand-purple"
        />
        <Button
          type="submit"
          className="h-11 bg-brand-purple text-foreground hover:opacity-90 transition-transform hover:-translate-y-0.5"
          disabled={!query.trim()}
        >
          Search
        </Button>
      </form>

      <div className="mx-auto max-w-2xl space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {submitted ? `Results for "${submitted}" (${papers.length})` : "Featured results"}
          </p>
          <Badge variant="outline" className="border-(--color-brand-blue)/40 text-(--color-brand-blue)">
            Demo data
          </Badge>
        </div>

        {submitted && papers.length === 0 && (
          <p className="text-sm text-muted-foreground">No results found. Try a different query.</p>
        )}

        {papers.map((p, idx) => (
          <Card
            key={p.id ?? idx}
            className={cn(
              "group border-border/60 bg-card/50 transition-all",
              "hover:border-(--color-brand-blue)/60 hover:bg-card/70 hover:-translate-y-0.5",
            )}
          >
            <CardContent className="p-4">
              <h3 className="font-medium text-lg leading-tight">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
