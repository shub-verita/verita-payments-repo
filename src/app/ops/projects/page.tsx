export const dynamic = 'force-dynamic'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, DollarSign, TrendingUp } from "lucide-react"
import prisma from "@/lib/db"
import { ProjectStatus } from "@prisma/client"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount)
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="success">Active</Badge>
    case "PAUSED":
      return <Badge variant="warning">Paused</Badge>
    case "COMPLETED":
      return <Badge variant="info">Completed</Badge>
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

function BudgetBar({ spent, budget }: { spent: number; budget: number | null }) {
  if (!budget) {
    return <span className="text-gray-400 text-sm">No budget set</span>
  }

  const percentage = Math.min((spent / budget) * 100, 100)
  const isOverBudget = spent > budget
  const isNearBudget = percentage >= 80

  return (
    <div className="w-full max-w-xs">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{formatCurrency(spent)} spent</span>
        <span>{percentage.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isOverBudget
              ? "bg-red-500"
              : isNearBudget
              ? "bg-yellow-500"
              : "bg-green-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        of {formatCurrency(budget)} budget
      </div>
    </div>
  )
}

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      assignments: {
        where: { isActive: true },
        include: { contractor: true }
      },
      timeEntries: {
        include: {
          payment: true
        }
      }
    },
    orderBy: { name: "asc" }
  })

  // Calculate spent amount per project (sum of payments for time entries on this project)
  const projectsWithSpent = projects.map(project => {
    const paymentIds = new Set<string>()
    project.timeEntries.forEach(entry => {
      if (entry.paymentId) paymentIds.add(entry.paymentId)
    })

    // Calculate total spent from time entries with payment
    const spent = project.timeEntries.reduce((sum, entry) => {
      if (entry.payment && entry.payment.status === "PAID") {
        // Approximate based on hours * rate from payment
        const hourlyRate = Number(entry.payment.grossAmount) / Number(entry.payment.totalHours)
        return sum + (Number(entry.totalHours) * hourlyRate)
      }
      return sum
    }, 0)

    return {
      ...project,
      spent
    }
  })

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "ACTIVE").length,
    totalBudget: projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0),
    totalSpent: projectsWithSpent.reduce((sum, p) => sum + p.spent, 0),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">
            Project list with budget tracking
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Projects</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.totalBudget)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.totalSpent)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Code</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Contractors</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Budget Utilization</th>
                </tr>
              </thead>
              <tbody>
                {projectsWithSpent.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-medium text-gray-900">{project.name}</span>
                        {project.client && (
                          <p className="text-sm text-gray-500">{project.client}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {project.code}
                      </code>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      {project.assignments.length}
                    </td>
                    <td className="py-4 px-4">
                      <BudgetBar
                        spent={project.spent}
                        budget={project.budget ? Number(project.budget) : null}
                      />
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No projects found
                    </td>
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
