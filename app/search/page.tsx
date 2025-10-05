import SearchClient from "@/components/search/search-client"

export default function SearchPage() {
  return (
    <main className="min-h-dvh px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="text-center space-y-2 animate-in fade-in duration-300">
          <h2 className="text-2xl font-semibold">Search Papers</h2>
          <p className="text-muted-foreground">Query the NASA bioscience corpus. Results show the top 5 papers.</p>
        </header>
        <SearchClient />
      </div>
    </main>
  )
}
