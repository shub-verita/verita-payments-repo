import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { Sidebar } from "@/components/Sidebar"
import { isOpsUser } from "@/lib/auth"

export default async function OpsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user has ops access
  const user = await currentUser()
  const userEmail = user?.emailAddresses?.[0]?.emailAddress

  if (!isOpsUser(userEmail)) {
    redirect("/dashboard")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar type="ops" />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
