import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PaymentStatusBadge } from "@/components/StatusBadges"
import { Download, DollarSign, TrendingUp, AlertCircle } from "lucide-react"
import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/db"
import { formatCurrency, formatDate } from "@/lib/format"

export default async function PaymentsPage() {
  const user = await currentUser()
  const userEmail = user?.emailAddresses?.[0]?.emailAddress

  const contractor = userEmail
    ? await prisma.contractor.findUnique({
        where: { email: userEmail },
        select: { id: true }
      })
    : null

  if (!contractor) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Account Setup Required</h3>
                <p className="text-yellow-700 mt-2">Your account is not yet linked to a contractor profile.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const payments = await prisma.payment.findMany({
    where: { contractorId: contractor.id },
    orderBy: { periodEnd: "desc" },
    select: { id: true, periodStart: true, periodEnd: true, totalHours: true, grossAmount: true, status: true }
  })

  const totalEarned = payments.filter(p => p.status === "PAID").reduce((sum, p) => sum + Number(p.grossAmount), 0)
  const pendingAmount = payments.filter(p => ["PENDING", "PROCESSING", "IN_TRANSIT"].includes(p.status)).reduce((sum, p) => sum + Number(p.grossAmount), 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-500 mt-1">View all your past and pending payments</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Download CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
            <p className="text-sm font-medium text-gray-500">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{payments.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg font-semibold">All Payments</CardTitle></CardHeader>
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
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-4 pr-4 text-sm text-gray-600">{formatDate(p.periodEnd)}</td>
                    <td className="py-4 pr-4 text-sm font-medium text-gray-900">
                      Payment - {formatDate(p.periodStart)} to {formatDate(p.periodEnd)}
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-600 text-right">{Number(p.totalHours).toFixed(1)}</td>
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
