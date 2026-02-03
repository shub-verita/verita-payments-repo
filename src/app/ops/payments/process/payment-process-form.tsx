"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, DollarSign, AlertTriangle } from "lucide-react"
import { createPayments } from "./actions"

type PaymentData = {
  id: string
  name: string
  email: string
  checkrStatus: string
  paymentEligible: boolean
  hourlyRate: number
  totalHours: number
  grossAmount: number
  periodStart: string
  periodEnd: string
  entryIds: string[]
  canPay: boolean
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
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

export function PaymentProcessForm({ paymentData }: { paymentData: PaymentData[] }) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(paymentData.filter(p => p.canPay).map(p => p.id))
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const toggleContractor = (id: string, canPay: boolean) => {
    if (!canPay) return // Don't allow selecting blocked contractors

    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAllEligible = () => {
    setSelectedIds(new Set(paymentData.filter(p => p.canPay).map(p => p.id)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const selectedPayments = paymentData.filter(p => selectedIds.has(p.id))
  const selectedTotal = selectedPayments.reduce((sum, p) => sum + p.grossAmount, 0)

  const handleCreatePayments = () => {
    setError(null)
    startTransition(async () => {
      try {
        const paymentsToCreate = selectedPayments.map(p => ({
          contractorId: p.id,
          periodStart: p.periodStart,
          periodEnd: p.periodEnd,
          totalHours: p.totalHours,
          hourlyRate: p.hourlyRate,
          grossAmount: p.grossAmount,
          entryIds: p.entryIds,
        }))

        await createPayments(paymentsToCreate)
        router.push("/ops/payments")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create payments")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedIds.size} of {paymentData.filter(p => p.canPay).length} eligible selected
              </span>
              <Button variant="outline" size="sm" onClick={selectAllEligible}>
                Select All Eligible
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                Deselect All
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Selected Total</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedTotal)}</p>
              </div>
              <Button
                onClick={handleCreatePayments}
                disabled={selectedIds.size === 0 || isPending}
                className="gap-2"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <DollarSign className="h-4 w-4" />
                )}
                Create {selectedIds.size} Payment{selectedIds.size !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contractors with Approved Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 w-10"></th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Contractor</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Period</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Hours</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rate</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Checkr</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentData.map((payment) => (
                  <tr
                    key={payment.id}
                    className={`border-b border-gray-100 ${
                      payment.canPay ? "hover:bg-gray-50" : "bg-gray-50 opacity-60"
                    }`}
                  >
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(payment.id)}
                        onChange={() => toggleContractor(payment.id, payment.canPay)}
                        disabled={!payment.canPay}
                        className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{payment.name}</p>
                        <p className="text-sm text-gray-500">{payment.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatDate(payment.periodStart)} - {formatDate(payment.periodEnd)}
                    </td>
                    <td className="py-4 px-4 text-gray-900 font-medium">
                      {payment.totalHours.toFixed(1)}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      ${payment.hourlyRate}/hr
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900">
                      {formatCurrency(payment.grossAmount)}
                    </td>
                    <td className="py-4 px-4">
                      <CheckrBadge status={payment.checkrStatus} />
                    </td>
                    <td className="py-4 px-4">
                      {payment.canPay ? (
                        <Badge variant="success">Eligible</Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Blocked
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
