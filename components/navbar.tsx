"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/graph-chat", label: "Graph + Chat" },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary" className="mx-auto max-w-5xl px-4">
      <div className="flex items-center justify-between h-14">
        <Link
          href="/"
          className="font-medium tracking-tight hover:opacity-90 transition-opacity"
          aria-label="SpaceBio Engine Home"
        >
          <span className="text-pretty">SpaceBio Engine</span>
        </Link>

        <div className="flex items-center gap-2">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname?.startsWith(l.href))
            return (
              <Button
                key={l.href}
                asChild
                variant="ghost"
                className={cn(
                  "relative transition-all",
                  "hover:-translate-y-0.5 hover:opacity-95",
                  active
                    ? "bg-(--color-brand-purple)/20 text-foreground border border-(--color-brand-purple)/40"
                    : "border-transparent",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Link href={l.href}>
                  <span className="relative">
                    {l.label}
                    {/* animated underline on hover/active */}
                    <span
                      className={cn(
                        "absolute left-0 right-0 -bottom-1 h-0.5 rounded-full",
                        active ? "bg-(--color-brand-purple)" : "bg-transparent group-hover:bg-(--color-brand-purple)",
                        "transition-colors duration-300",
                      )}
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
