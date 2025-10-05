import GraphChatClient from "@/components/graph-chat/graph-chat-client"

export default function GraphChatPage() {
  return (
    <main className="min-h-dvh px-4 py-6 md:px-6">
      <div className="mx-auto max-w-[1400px] space-y-4">
        <header className="space-y-1 animate-in fade-in duration-300">
          <h2 className="text-2xl font-semibold">Graph + Chat</h2>
          <p className="text-muted-foreground">
            Explore graph stats or search on the left; chat with the knowledge engine on the right.
          </p>
        </header>
        <GraphChatClient />
      </div>
    </main>
  )
}
