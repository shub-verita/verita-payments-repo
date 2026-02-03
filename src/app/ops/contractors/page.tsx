import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/db"
import { formatCurrency } from "@/lib/format"
import { CheckrBadge, ContractorStatusBadge } from "@/components/StatusBadges"

export default async function ContractorsPage() {
  const contractors = await prisma.contractor.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      checkrStatus: true,
      hourlyRate: true,
      projectAssignments: {
        where: { isActive: true },
        select: { project: { select: { name: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const stats = {
    total: contractors.length,
    active: contractors.filter(c => c.status === "ACTIVE").length,
    pendingCheckr: contractors.filter(c => c.checkrStatus === "PENDING").length,
    onboarding: contractors.filter(c => c.status === "ONBOARDING").length,
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contractors</h1>
          <p className="text-gray-500 mt-1">Manage contractor information and status</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">Onboarding</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.onboarding}</p>
          </CardContent>
        </Card>
        <Card className={stats.pendingCheckr > 0 ? "border-yellow-200 bg-yellow-50" : ""}>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">Pending Checkr</p>
            <p className={`text-2xl font-bold mt-1 ${stats.pendingCheckr > 0 ? "text-yellow-600" : "text-gray-900"}`}>
              {stats.pendingCheckr}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Contractors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Checkr</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rate</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Project</th>
                </tr>
              </thead>
              <tbody>
                {contractors.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <Link href={`/ops/contractors/${c.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{c.email}</td>
                    <td className="py-4 px-4"><ContractorStatusBadge status={c.status} /></td>
                    <td className="py-4 px-4"><CheckrBadge status={c.checkrStatus} /></td>
                    <td className="py-4 px-4 font-medium">{formatCurrency(Number(c.hourlyRate))}/hr</td>
                    <td className="py-4 px-4 text-gray-600">
                      {c.projectAssignments.length > 0
                        ? c.projectAssignments.map(a => a.project.name).join(", ")
                        : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                ))}
                {contractors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">No contractors found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
