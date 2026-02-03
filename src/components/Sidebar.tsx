"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import {
  LayoutDashboard,
  Wallet,
  FileText,
  User,
  Settings,
  Users,
  Clock,
  CreditCard,
  FolderKanban
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const contractorNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Payment History", href: "/payments", icon: Wallet },
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "Profile", href: "/profile", icon: User },
]

const opsNav: NavItem[] = [
  { title: "Overview", href: "/ops", icon: LayoutDashboard },
  { title: "Contractors", href: "/ops/contractors", icon: Users },
  { title: "Hours Review", href: "/ops/hours", icon: Clock },
  { title: "Payments", href: "/ops/payments", icon: CreditCard },
  { title: "Projects", href: "/ops/projects", icon: FolderKanban },
]

// Simple role check - matches lib/auth.ts
const OPS_DOMAINS = ['verita-ai.com']

function isOpsUser(email: string | undefined | null): boolean {
  if (!email) return false
  const domain = email.split('@')[1]?.toLowerCase()
  return domain ? OPS_DOMAINS.includes(domain) : false
}

interface SidebarProps {
  type: "contractor" | "ops"
}

export function Sidebar({ type }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useUser()
  const navItems = type === "ops" ? opsNav : contractorNav

  const userEmail = user?.emailAddresses?.[0]?.emailAddress
  const canAccessOps = isOpsUser(userEmail)

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href={type === "ops" ? "/ops" : "/dashboard"} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
            V
          </div>
          <span className="text-lg font-semibold">
            Verita {type === "ops" ? "Ops" : "Payments"}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/dashboard" && item.href !== "/ops" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <UserButton
            afterSignOutUrl="/login"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8"
              }
            }}
          />
          <span className="text-sm text-gray-600">Account</span>
        </div>
        {type === "contractor" && canAccessOps && (
          <Link
            href="/ops"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <Settings className="h-5 w-5 text-gray-400" />
            Ops Portal
          </Link>
        )}
        {type === "ops" && (
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <User className="h-5 w-5 text-gray-400" />
            Contractor View
          </Link>
        )}
      </div>
    </div>
  )
}
