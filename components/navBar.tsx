"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Map, MessageCircle, Sparkles, User } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/dashboard", label: "Home", Icon: Home },
  { href: "/roadmap", label: "Roadmap", Icon: Map },
  { href: "/chat", label: "Chat", Icon: MessageCircle },
  { href: "/insights", label: "Insights", Icon: Sparkles },
  { href: "/profile", label: "Profile", Icon: User },
] as const

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] transition-transform duration-300 [body.report-modal-open_&]:translate-y-full md:hidden">
      <nav className="flex w-full max-w-md items-center justify-between rounded-[22px] border border-black/[0.06] bg-background/90 px-2 py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.10)] backdrop-blur-xl dark:border-white/[0.08]">
        {tabs.map(({ href, label, Icon }) => {
          const active = isActive(href)

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-2 transition-transform active:scale-95"
            >
              <Icon
                className={cn(
                  "h-[22px] w-[22px] transition-colors",
                  active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                )}
                strokeWidth={active ? 2.25 : 1.9}
              />
              <span
                className={cn(
                  "text-[10px] leading-none transition-colors",
                  active
                    ? "font-semibold text-emerald-600 dark:text-emerald-400"
                    : "font-medium text-muted-foreground"
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}