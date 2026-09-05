"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { SiLeetcode } from "react-icons/si"
import { User } from "lucide-react"
import { FaGithub } from "react-icons/fa";


// Filled + outline icon pairs
const HomeIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]">
    {filled ? (
      <path
        d="M3.5 10.5L12 3.5L20.5 10.5V20a.5.5 0 0 1-.5.5H15V15.5H9V20.5H4a.5.5 0 0 1-.5-.5V10.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M3.5 10.5L12 3.5L20.5 10.5V20a.5.5 0 0 1-.5.5H15V15.5H9V20.5H4a.5.5 0 0 1-.5-.5V10.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    )}
  </svg>
)


const ProfileIcon = ({ filled }: { filled: boolean }) => (
  <User
    className={cn(
      "h-[22px] w-[22px]",
      filled ? "text-emerald-500" : "text-current"
    )}
  />
)

const LeetCodeIcon = ({ filled }: { filled: boolean }) => (
  <SiLeetcode
    className={cn(
      "h-[22px] w-[22px]",
      filled ? "text-emerald-500" : "text-current"
    )}
  />
)

const GitHubIcon = ({ filled }: { filled: boolean }) => (
  <FaGithub
    className={cn(
      "h-[22px] w-[22px]",
      filled ? "text-emerald-500" : "text-current"
    )}
  />
)

const tabs = [
  {
    href: "/dashboard",
    label: "Dashboard",
    Icon: HomeIcon,
  },
  {
    href: "/leetcode",
    label: "LeetCode",
    Icon: LeetCodeIcon,
  },
  {
    href: "/github",
    label: "GitHub",
    Icon: GitHubIcon,
  },
  {
    href: "/profile",
    label: "Profile",
    Icon: ProfileIcon,
  },
] as const

export default function BottomNav() {
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const [pillStyle, setPillStyle] = useState({
    left: 0,
    width: 0,
    ready: false,
  })

  const activeIndex = tabs.findIndex(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`)
  )

  useEffect(() => {
    const nav = navRef.current
    const item = itemRefs.current[activeIndex]
    if (!nav || !item) return
    const navRect = nav.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    setPillStyle({
      left: itemRect.left - navRect.left,
      width: itemRect.width,
      ready: true,
    })
  }, [activeIndex])

  return (
    // ── Outer wrapper ────────────────────────────────────────────────────────
    // translate-y-full slides the entire nav below the viewport edge.
    // transition-transform makes it animate smoothly in both directions.
    // [body.report-modal-open_&] targets this element when <body> has the
    // class "report-modal-open", which useReportModal adds/removes.
    <div className="fixed right-0 bottom-4 left-0 z-50 flex justify-center px-4 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] [body.report-modal-open_&]:translate-y-full">
      <nav
        ref={navRef}
        className="relative w-full max-w-md rounded-[22px] border border-black/[0.06] bg-background/90 px-1.5 py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.06]"
      >
        {pillStyle.ready && (
          <div
            className="pointer-events-none absolute top-1.5 h-[calc(100%-12px)] rounded-2xl bg-white shadow-[0_1px_6px_rgba(0,0,0,0.10),0_0_0_0.5px_rgba(0,0,0,0.05)] transition-[left,width] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] dark:bg-zinc-800"
            style={{ left: pillStyle.left, width: pillStyle.width }}
          />
        )}
        <ul className="flex items-center justify-between">
          {tabs.map(({ href, label, Icon }, i) => {
            const isActive = activeIndex === i
            return (
              <li
                key={href}
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                className="flex-1"
              >
                <Link
                  href={href}
                  className="relative flex flex-col items-center justify-center gap-[3px] rounded-2xl px-3 py-2 transition-transform duration-100 active:scale-90"
                >
                  <span
                    className={cn(
                      "relative z-10 transition-all duration-200",
                      isActive
                        ? "-translate-y-px scale-110 text-emerald-500"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon filled={isActive} />
                  </span>
                  <span
                    className={cn(
                      "relative z-10 text-[10.5px] leading-none transition-colors duration-200",
                      isActive
                        ? "font-semibold text-emerald-500"
                        : "font-medium text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
