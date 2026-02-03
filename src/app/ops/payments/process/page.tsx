import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import prisma from "@/lib/db"
import { PaymentProcessForm } from "./payment-process-form"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

function CheckrBadge({ status }: { status: string }) {
  switch (status) {
    case "CLEAR":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Clear
        </Badge>
      )
    case "PENDING":
      return (
        <Badge variant="warning" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Pending
        </Badge>
      )
    default:
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          {status}
        </Badge>
      )
  }
}

export default async function PaymentProcessPage() {
  // Get contractors with approved but unpaid time entries
  const contractorsWithHours = await prisma.contractor.findMany({
    where: {
      timeEntries: {
        some: {
          approved: true,
          paymentId: null, // Not yet paid
        }
      }
    },
    include: {
      timeEntries: {
        where: {
          approved: true,
          paymentId: null,
        },
        orderBy: { date: "asc" }
      }
    }
  })

  // Calculate payment data for each contractor
  const paymentData = contractorsWithHours.map(contractor => {
    const entries = contractor.timeEntries
    const totalHours = entries.reduce((sum, e) => sum + Number(e.totalHours), 0)
    const hourlyRate = Number(contractor.hourlyRate)
    const grossAmount = totalHours * hourlyRate

    // Get date range
    const dates = entries.map(e => new Date(e.date))
    const periodStart = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date()
    const periodEnd = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date()

    return {
      id: contractor.id,
      name: `${contractor.firstName} ${contractor.lastName}`,
      email: contractor.email,
      checkrStatus: contractor.checkrStatus,
      paymentEligible: contractor.paymentEligible,
      hourlyRate,
      totalHours,
      grossAmount,
      periodStart: periodStart.toISOString().split("T")[0],
      periodEnd: periodEnd.toISOString().split("T")[0],
      entryIds: entries.map(e => e.id),
      canPay: contractor.checkrStatus === "CLEAR" && contractor.paymentEligible,
    }
  })

  // Sort by name
  paymentData.sort((a, b) => a.name.localeCompare(b.name))

  const totalAmount = paymentData.reduce((sum, p) => sum + p.grossAmount, 0)
  const eligibleAmount = paymentData.filter(p => p.canPay).reduce((sum, p) => sum + p.grossAmount, 0)
  const blockedCount = paymentData.filter(p => !p.canPay).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Process Payments</h1>
        <p className="text-gray-500 mt-1">
          Create payments for contractors with approved hours
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">Contractors</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{paymentData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500">Eligible Amount</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(eligibleAmount)}</p>
          </CardContent>
        </Card>
        {blockedCount > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-red-700">Blocked</p>
              <p className="text-2xl font-bold text-red-700 mt-1">{blockedCount}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Warning for blocked payments */}
      {blockedCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800">Some Contractors Cannot Be Paid</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {blockedCount} contractor{blockedCount > 1 ? "s" : ""} cannot receive payment due to
                  pending Checkr verification or payment eligibility issues.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment List */}
      {paymentData.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
              <p className="text-lg font-medium">No Pending Payments</p>
              <p className="text-sm mt-1">All approved hours have been paid</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <PaymentProcessForm paymentData={paymentData} />
      )}
    </div>
  )
}
