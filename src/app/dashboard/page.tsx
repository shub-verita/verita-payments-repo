import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EarningsChart } from "@/components/contractor/EarningsChart"
import { PaymentStatusBadge } from "@/components/StatusBadges"
import { DollarSign, Clock, TrendingUp, Download, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"
import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/db"
import { formatCurrency, formatDate } from "@/lib/format"

export default async function DashboardPage() {
  const user = await currentUser()
  const userEmail = user?.emailAddresses?.[0]?.emailAddress

  const contractor = userEmail
    ? await prisma.contractor.findUnique({
        where: { email: userEmail },
        select: { id: true, firstName: true, hourlyRate: true }
      })
    : null

  if (!contractor) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Verita Payments</h1>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Account Setup Required</h3>
                <p className="text-yellow-700 mt-2">
                  Your account ({userEmail || "unknown"}) is not yet linked to a contractor profile.
                </p>
                <a href="mailto:ops@verita.ai" className="inline-block mt-4">
                  <Button variant="outline">Contact Operations</Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [payments, timeEntriesThisPeriod] = await Promise.all([
    prisma.payment.findMany({
      where: { contractorId: contractor.id },
      orderBy: { periodEnd: "desc" },
      take: 5,
      select: { id: true, periodStart: true, periodEnd: true, totalHours: true, grossAmount: true, status: true }
    }),
    prisma.timeEntry.aggregate({
      where: { contractorId: contractor.id, date: { gte: startOfMonth } },
      _sum: { totalHours: true }
    })
  ])

  const totalEarned = payments.filter(p => p.status === "PAID").reduce((sum, p) => sum + Number(p.grossAmount), 0)
  const pendingAmount = payments.filter(p => ["PENDING", "PROCESSING", "IN_TRANSIT"].includes(p.status)).reduce((sum, p) => sum + Number(p.grossAmount), 0)
  const totalHours = payments.reduce((sum, p) => sum + Number(p.totalHours), 0)
  const hoursThisPeriod = Number(timeEntriesThisPeriod._sum.totalHours || 0)

  const monthlyEarnings = await getMonthlyEarnings(contractor.id)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {contractor.firstName}!</h1>
          <p className="text-gray-500 mt-1">Here&apos;s your earnings overview</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Download Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Earned</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalEarned)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(pendingAmount)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalHours.toFixed(1)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">This Period</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{hoursThisPeriod.toFixed(1)} hrs</p>
                <p className="text-xs text-gray-400 mt-0.5">@ ${Number(contractor.hourlyRate)}/hr</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg font-semibold">Earnings Overview</CardTitle></CardHeader>
        <CardContent><EarningsChart data={monthlyEarnings} /></CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Payments</CardTitle>
          <Link href="/payments">
            <Button variant="ghost" size="sm" className="gap-1">View All <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No payments yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-gray-500">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4 text-right">Hours</th>
                  <th className="pb-3 pr-4 text-right">Amount</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-4 pr-4 text-sm text-gray-600">{formatDate(p.periodEnd)}</td>
                    <td className="py-4 pr-4 text-sm font-medium text-gray-900">
                      Payment - {formatDate(p.periodStart)} to {formatDate(p.periodEnd)}
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-600 text-right">{Number(p.totalHours)}</td>
                    <td className="py-4 pr-4 text-sm font-medium text-gray-900 text-right">{formatCurrency(Number(p.grossAmount))}</td>
                    <td className="py-4 text-right"><PaymentStatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

async function getMonthlyEarnings(contractorId: string) {
  const payments = await prisma.payment.findMany({
    where: { contractorId },
    select: { periodEnd: true, grossAmount: true, status: true }
  })

  const monthlyMap = new Map<string, { paid: number; pending: number }>()
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthlyMap.set(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, { paid: 0, pending: 0 })
  }

  for (const p of payments) {
    const date = new Date(p.periodEnd)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    if (monthlyMap.has(key)) {
      const current = monthlyMap.get(key)!
      if (p.status === "PAID") current.paid += Number(p.grossAmount)
      else if (["PENDING", "PROCESSING", "IN_TRANSIT"].includes(p.status)) current.pending += Number(p.grossAmount)
    }
  }

  return Array.from(monthlyMap.entries()).map(([month, data]) => ({ month, ...data }))
}
