"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  Code2,
  Home,
  LogOut,
  Map,
  MessageCircle,
  Settings,
  Sparkles,
  CalendarDays,
  User,
} from "lucide-react"
import { FaGithub as Github } from "react-icons/fa"

import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { logout } from "@/services/authService"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const primaryLinks = [
  { href: "/dashboard", label: "Dashboard", Icon: Home },
  { href: "/roadmap", label: "Roadmap", Icon: Map },
  { href: "/calendar", label: "Calendar", Icon: CalendarDays },
  { href: "/chat", label: "Chat", Icon: MessageCircle },
  { href: "/insights", label: "Insights", Icon: Sparkles },
  { href: "/github", label: "GitHub", Icon: Github },
  { href: "/leetcode", label: "LeetCode", Icon: Code2 },
] as const

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const handleLogout = () => {
    logout()
    router.replace("/auth/login")
  }

  const initial = user?.username?.[0]?.toUpperCase() ?? "U"

  return (
    <header className="sticky top-0 z-40 hidden border-b bg-background/80 backdrop-blur-lg md:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <Image
            src="/images/logo.png"
            alt="ThiranX"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg object-cover"
            priority
          />
          <span className="text-lg font-bold tracking-tight">ThiranX</span>
        </Link>

        {/* Primary nav */}
        <nav className="flex items-center gap-1">
          {primaryLinks.map(({ href, label, Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 transition hover:bg-muted">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                {initial}
              </span>
              <span className="max-w-[120px] truncate text-sm font-medium">
                {user?.username ?? "Account"}
              </span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="truncate font-medium">{user?.username}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">
                {user?.email}
              </p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}