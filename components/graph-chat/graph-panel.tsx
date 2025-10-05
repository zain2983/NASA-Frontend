"use client"

import useSWR from "swr"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { config } from "@/lib/config"
import { GraphVisualization } from "./graph-visualization"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface GraphPanelProps {
  graphResults?: any[];
  graphStructure?: any;
}

export function GraphPanel({ graphResults, graphStructure }: GraphPanelProps) {
  const [mode, setMode] = useState<"stats" | "search" | "visualization">("stats")
  const [q, setQ] = useState("")
  const [currentGraphResults, setCurrentGraphResults] = useState<any[]>([])
  const [currentGraphStructure, setCurrentGraphStructure] = useState<any>(null)
  
  const stats = useSWR(mode === "stats" ? `${config.API_BASE_URL}${config.GRAPH_RAG.STATS}` : null, fetcher)
  const results = useSWR(mode === "search" && q ? `${config.API_BASE_URL}${config.GRAPH_RAG.SEARCH}?query=${encodeURIComponent(q)}&limit=10` : null, fetcher)
  
  // Update visualization when new graph results come in
  useEffect(() => {
    if (graphResults && graphResults.length > 0) {
      setCurrentGraphResults(graphResults)
      setMode("visualization")
    }
  }, [graphResults])
  
  // Update graph structure when new structure comes in
  useEffect(() => {
    console.log('GraphPanel - graphStructure received:', graphStructure)
    if (graphStructure) {
      setCurrentGraphStructure(graphStructure)
      setMode("visualization")
    }
  }, [graphStructure])
  
  // Debug current state
  useEffect(() => {
    console.log('GraphPanel - currentGraphStructure:', currentGraphStructure)
    console.log('GraphPanel - mode:', mode)
  }, [currentGraphStructure, mode])

  return (
    <Card className="h-[70vh] md:h-[78vh] bg-card/50 backdrop-blur border-border/60">
      <CardContent className="h-full p-0 flex flex-col">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
            <TabsList className="grid grid-cols-3 bg-secondary/50">
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="search">Search Graph</TabsTrigger>
              <TabsTrigger value="visualization">Graph View</TabsTrigger>
            </TabsList>
            <TabsContent value="stats" className="mt-3" />
            <TabsContent value="search" className="mt-3" />
            <TabsContent value="visualization" className="mt-3" />
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
          {mode === "stats" ? (
            <ScrollArea className="h-full">
              <div className="p-4">
                <StatsView loading={stats.isLoading} error={stats.error} data={stats.data} />
              </div>
            </ScrollArea>
          ) : mode === "search" ? (
            <ScrollArea className="h-full">
              <div className="p-4">
                <SearchView loading={results.isLoading} error={results.error} data={results.data} />
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full w-full">
              <GraphVisualization graphData={currentGraphStructure} />
            </div>
          )}
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
      {items.slice(0, 20).map((result: any, idx: number) => (
        <li key={result.pub_id ?? idx} className="rounded-md border border-border/60 p-3 bg-card/50">
          <p className="font-medium">{result.title || `Paper ${result.pub_id}`}</p>
          {result.mentioned_entities && result.mentioned_entities.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">Entities:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {result.mentioned_entities.slice(0, 5).map((entity: string, i: number) => (
                  <span key={i} className="text-xs bg-primary/20 px-2 py-1 rounded">
                    {entity}
                  </span>
                ))}
                {result.mentioned_entities.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{result.mentioned_entities.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

function VisualizationView({ graphResults }: { graphResults: any[] }) {
  if (!graphResults || graphResults.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No graph data to visualize.</p>
        <p className="text-xs text-muted-foreground mt-1">Ask a question to see the knowledge graph.</p>
      </div>
    )
  }

  // Extract all unique entities from the results
  const allEntities = new Set<string>()
  graphResults.forEach(result => {
    if (result.mentioned_entities) {
      result.mentioned_entities.forEach((entity: string) => allEntities.add(entity))
    }
  })

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="font-medium">Knowledge Graph Visualization</h4>
        <p className="text-sm text-muted-foreground">
          {graphResults.length} papers with {allEntities.size} unique entities
        </p>
      </div>
      
      {/* Simple node visualization */}
      <div className="space-y-3">
        {graphResults.slice(0, 5).map((result, idx) => (
          <div key={result.pub_id || idx} className="rounded-md border border-border/60 p-3 bg-card/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <p className="font-medium text-sm">{result.title || `Paper ${result.pub_id}`}</p>
            </div>
            
            {result.mentioned_entities && result.mentioned_entities.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Connected Entities:</p>
                <div className="flex flex-wrap gap-1">
                  {result.mentioned_entities.map((entity: string, i: number) => (
                    <span key={i} className="text-xs bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {graphResults.length > 5 && (
          <p className="text-xs text-muted-foreground text-center">
            ... and {graphResults.length - 5} more papers
          </p>
        )}
      </div>
    </div>
  )
}
