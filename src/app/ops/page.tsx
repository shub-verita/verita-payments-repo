import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, Clock, AlertCircle, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/format"
import { getOpsDashboardStats } from "@/lib/queries"
import { CheckrBadge } from "@/components/StatusBadges"

export default async function OpsOverviewPage() {
  const stats = await getOpsDashboardStats()

  const periodEnd = new Date(stats.startOfMonth.getFullYear(), stats.startOfMonth.getMonth() + 1, 0)
  const periodLabel = `${stats.startOfMonth.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${periodEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`

  const paymentQueue = stats.pendingPayments.slice(0, 4).map(p => ({
    id: p.id,
    name: `${p.contractor.firstName} ${p.contractor.lastName}`,
    hours: Number(p.totalHours),
    amount: Number(p.grossAmount),
    checkrStatus: p.contractor.checkrStatus,
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-gray-500 mt-1">Payment period: {periodLabel}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/ops/hours">
            <Button variant="outline">Review Hours</Button>
          </Link>
          <Link href="/ops/payments/process">
            <Button className="gap-2">
              <DollarSign className="h-4 w-4" />
              Process Payments
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Contractors</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeContractors}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Payments</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pendingPaymentsCount}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalPendingAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Hours Logged</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.periodHoursTotal.toFixed(0)}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.pendingHoursTotal > 0 ? "border-orange-200 bg-orange-50" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${stats.pendingHoursTotal > 0 ? "text-orange-700" : "text-gray-500"}`}>
                  Needs Approval
                </p>
                <p className={`text-2xl font-bold mt-1 ${stats.pendingHoursTotal > 0 ? "text-orange-700" : "text-gray-900"}`}>
                  {stats.pendingHoursTotal.toFixed(0)} hrs
                </p>
              </div>
              <AlertCircle className={`h-8 w-8 ${stats.pendingHoursTotal > 0 ? "text-orange-500" : "text-gray-300"}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Payment Queue</CardTitle>
            <Link href="/ops/payments">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {paymentQueue.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                <p>No pending payments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentQueue.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.hours} hrs</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckrBadge status={item.checkrStatus} />
                      <span className="font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Pending Amount</span>
                <span className="font-semibold text-gray-900">{formatCurrency(stats.totalPendingAmount)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Pending Checkr Verifications</span>
                <span className={`font-semibold ${stats.pendingCheckrCount > 0 ? "text-orange-600" : "text-gray-900"}`}>
                  {stats.pendingCheckrCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(stats.pendingCheckrCount > 0 || stats.pendingHoursTotal > 0 || stats.pendingPaymentsCount > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800">Action Required</h3>
                <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                  {stats.pendingCheckrCount > 0 && (
                    <li>• {stats.pendingCheckrCount} contractor{stats.pendingCheckrCount > 1 ? "s have" : " has"} pending Checkr verification</li>
                  )}
                  {stats.pendingHoursTotal > 0 && (
                    <li>• {stats.pendingHoursTotal.toFixed(0)} hours awaiting approval</li>
                  )}
                  {stats.pendingPaymentsCount > 0 && (
                    <li>• {stats.pendingPaymentsCount} payment{stats.pendingPaymentsCount > 1 ? "s" : ""} ready to process</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
