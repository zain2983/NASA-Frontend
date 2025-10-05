"use client"

import useSWR from "swr"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function GraphPanel() {
  const [mode, setMode] = useState<"stats" | "search">("stats")
  const [q, setQ] = useState("")
  const stats = useSWR(mode === "stats" ? "/graph-rag/stats" : null, fetcher)
  const results = useSWR(mode === "search" && q ? `/graph-rag/search?q=${encodeURIComponent(q)}` : null, fetcher)

  return (
    <Card className="h-[70vh] md:h-[78vh] bg-card/50 backdrop-blur border-border/60">
      <CardContent className="h-full p-0 flex flex-col">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
            <TabsList className="grid grid-cols-2 bg-secondary/50">
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="search">Search Graph</TabsTrigger>
            </TabsList>
            <TabsContent value="stats" className="mt-3" />
            <TabsContent value="search" className="mt-3" />
          </Tabs>
        </div>

        {mode === "search" ? (
          <div className="px-4 pb-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                // SWR auto-revalidates based on key; state already set via setQ
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search the graph…"
                className="h-10 focus-visible:ring-brand-blue"
              />
              <Button
                type="submit"
                className="h-10 bg-brand-blue text-foreground hover:opacity-90"
                disabled={!q.trim()}
              >
                Go
              </Button>
            </form>
          </div>
        ) : null}

        <div className="flex-1 border-t border-border/60">
          <ScrollArea className="h-full">
            <div className="p-4">
              {mode === "stats" ? (
                <StatsView loading={stats.isLoading} error={stats.error} data={stats.data} />
              ) : (
                <SearchView loading={results.isLoading} error={results.error} data={results.data} />
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}

function StatsView({ loading, error, data }: { loading: boolean; error: any; data: any }) {
  if (loading) return <p className="text-sm text-muted-foreground">Loading stats…</p>
  if (error) return <p className="text-sm text-destructive">Error loading stats.</p>
  if (!data) return <p className="text-sm text-muted-foreground">No stats available.</p>

  // Display minimal stats; unknown shape-safe rendering
  const pairs = Object.entries(data as Record<string, any>).slice(0, 12)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {pairs.map(([k, v]) => (
        <div key={k} className="rounded-md border border-border/60 p-3 bg-card/50">
          <p className="text-xs uppercase text-muted-foreground tracking-wide">{k}</p>
          <p className="mt-1 text-lg font-medium">{String(v)}</p>
        </div>
      ))}
    </div>
  )
}

function SearchView({ loading, error, data }: { loading: boolean; error: any; data: any }) {
  if (!data && !loading && !error) {
    return <p className="text-sm text-muted-foreground">Enter a query to search the graph.</p>
  }
  if (loading) return <p className="text-sm text-muted-foreground">Searching graph…</p>
  if (error) return <p className="text-sm text-destructive">Error searching graph.</p>
  const items = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No graph matches.</p>

  return (
    <ul className="space-y-2">
      {items.slice(0, 20).map((n: any, idx: number) => (
        <li key={n.id ?? idx} className="rounded-md border border-border/60 p-3 bg-card/50">
          <p className="font-medium">{n.title ?? n.label ?? n.name ?? "Node"}</p>
          {n.summary || n.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{n.summary ?? n.description}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
