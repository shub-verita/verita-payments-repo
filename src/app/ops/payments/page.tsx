export const dynamic = 'force-dynamic'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/db"
import { PaymentStatus } from "@prisma/client"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

function formatPeriod(start: Date, end: Date) {
  const startStr = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(start))
  const endStr = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(end))
  return `${startStr} - ${endStr}`
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "PAID":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Paid
        </Badge>
      )
    case "PROCESSING":
      return (
        <Badge variant="info" className="gap-1">
          <Clock className="h-3 w-3" />
          Processing
        </Badge>
      )
    case "IN_TRANSIT":
      return (
        <Badge variant="info" className="gap-1">
          In Transit
        </Badge>
      )
    case "PENDING":
      return (
        <Badge variant="warning" className="gap-1">
          Pending
        </Badge>
      )
    case "FAILED":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      )
    case "CANCELLED":
      return (
        <Badge variant="secondary">
          Cancelled
        </Badge>
      )
    default:
      return <Badge>{status}</Badge>
  }
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const statusFilter = searchParams.status as PaymentStatus | undefined

  const payments = await prisma.payment.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: {
      contractor: true,
    },
    orderBy: { createdAt: "desc" }
  })

  const stats = await prisma.payment.groupBy({
    by: ["status"],
    _count: true,
    _sum: { grossAmount: true }
  })

  const totalPending = stats.find(s => s.status === "PENDING")?._count ?? 0
  const totalPaid = stats.find(s => s.status === "PAID")?._sum?.grossAmount ?? 0
  const pendingAmount = stats.find(s => s.status === "PENDING")?._sum?.grossAmount ?? 0

  const statuses: PaymentStatus[] = ["PENDING", "PROCESSING", "IN_TRANSIT", "PAID", "FAILED", "CANCELLED"]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">
            Payment history and processing
          </p>
        </div>
        <Link href="/ops/payments/process">
          <Button className="gap-2">
            <DollarSign className="h-4 w-4" />
            Create Batch Payment
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={totalPending > 0 ? "border-orange-200 bg-orange-50" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${totalPending > 0 ? "text-orange-700" : "text-gray-500"}`}>
                  Pending Payments
                </p>
                <p className={`text-2xl font-bold mt-1 ${totalPending > 0 ? "text-orange-700" : "text-gray-900"}`}>
                  {totalPending}
                </p>
              </div>
              <AlertCircle className={`h-8 w-8 ${totalPending > 0 ? "text-orange-500" : "text-gray-300"}`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(Number(pendingAmount))}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(Number(totalPaid))}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/ops/payments">
          <Button variant={!statusFilter ? "default" : "outline"} size="sm">
            All
          </Button>
        </Link>
        {statuses.map((status) => (
          <Link key={status} href={`/ops/payments?status=${status}`}>
            <Button
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
            >
              {status.charAt(0) + status.slice(1).toLowerCase().replace("_", " ")}
            </Button>
          </Link>
        ))}
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter ? `${statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()} Payments` : "All Payments"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Contractor</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Period</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Hours</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">
                        {payment.contractor.firstName} {payment.contractor.lastName}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatPeriod(payment.periodStart, payment.periodEnd)}
                    </td>
                    <td className="py-4 px-4 text-gray-900">
                      {Number(payment.totalHours).toFixed(1)}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {formatCurrency(Number(payment.grossAmount))}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {payment.paidAt ? formatDate(payment.paidAt) : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No payments found
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
