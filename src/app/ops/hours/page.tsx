export const dynamic = 'force-dynamic'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, AlertCircle } from "lucide-react"
import { getPendingTimeEntries } from "@/lib/queries"
import { HoursApprovalForm } from "./hours-approval-form"

export default async function HoursPage() {
  const pendingEntries = await getPendingTimeEntries()

  // Serialize and group by contractor
  const entriesByContractor = pendingEntries.reduce((acc, entry) => {
    const contractorId = entry.contractor.id
    if (!acc[contractorId]) {
      acc[contractorId] = {
        contractor: entry.contractor,
        entries: []
      }
    }
    acc[contractorId].entries.push({
      id: entry.id,
      date: entry.date,
      totalHours: Number(entry.totalHours),
      productiveHours: entry.productiveHours ? Number(entry.productiveHours) : null,
      source: entry.source,
      contractor: entry.contractor,
      project: entry.project,
    })
    return acc
  }, {} as Record<string, { contractor: typeof pendingEntries[0]["contractor"], entries: Array<{
    id: string
    date: Date
    totalHours: number
    productiveHours: number | null
    source: string
    contractor: { id: string; firstName: string; lastName: string }
    project: { name: string } | null
  }> }>)

  const totalPendingHours = pendingEntries.reduce((sum, e) => sum + Number(e.totalHours), 0)
  const contractorCount = Object.keys(entriesByContractor).length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hours Review</h1>
          <p className="text-gray-500 mt-1">Review and approve contractor time entries</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Pending Approval</p>
                <p className="text-2xl font-bold text-orange-700 mt-1">{totalPendingHours.toFixed(1)} hrs</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Entries to Review</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pendingEntries.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">Contractors</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{contractorCount}</p>
          </CardContent>
        </Card>
      </div>

      {contractorCount === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm mt-1">No time entries pending approval</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <HoursApprovalForm entriesByContractor={entriesByContractor} />
      )}
    </div>
  )
}
