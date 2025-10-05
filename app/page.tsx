import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6">
      <div className="max-w-3xl text-center animate-in fade-in duration-500">
        <h1 className="text-balance text-3xl sm:text-5xl font-semibold tracking-tight">
          NASA Hackathon – Space Biology Knowledge Engine
        </h1>
        <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
          Explore NASA bioscience literature with a minimal, fast, and interactive interface—search papers, visualize
          knowledge graphs, and chat with your data.
        </p>
        <div className="mt-8 flex items-center justify-center">
          <Button asChild className="bg-brand-blue text-foreground hover:opacity-90 transition-colors">
            <Link href="/search">Start Searching</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
