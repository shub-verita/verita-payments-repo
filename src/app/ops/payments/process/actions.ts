"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/db"

type PaymentInput = {
  contractorId: string
  periodStart: string
  periodEnd: string
  totalHours: number
  hourlyRate: number
  grossAmount: number
  entryIds: string[]
}

export async function createPayments(payments: PaymentInput[]) {
  if (payments.length === 0) {
    throw new Error("No payments to create")
  }

  // Verify all contractors have CLEAR Checkr status
  for (const payment of payments) {
    const contractor = await prisma.contractor.findUnique({
      where: { id: payment.contractorId },
      select: { checkrStatus: true, paymentEligible: true, firstName: true, lastName: true }
    })

    if (!contractor) {
      throw new Error(`Contractor not found: ${payment.contractorId}`)
    }

    if (contractor.checkrStatus !== "CLEAR") {
      throw new Error(`Cannot create payment for ${contractor.firstName} ${contractor.lastName}: Checkr status is ${contractor.checkrStatus}`)
    }

    if (!contractor.paymentEligible) {
      throw new Error(`Cannot create payment for ${contractor.firstName} ${contractor.lastName}: Not payment eligible`)
    }
  }

  // Create payments in a transaction
  const createdPayments = await prisma.$transaction(async (tx) => {
    const results = []

    for (const payment of payments) {
      // Create the payment
      const newPayment = await tx.payment.create({
        data: {
          contractorId: payment.contractorId,
          periodStart: new Date(payment.periodStart),
          periodEnd: new Date(payment.periodEnd),
          totalHours: payment.totalHours,
          hourlyRate: payment.hourlyRate,
          grossAmount: payment.grossAmount,
          netAmount: payment.grossAmount, // Same as gross for now
          status: "PENDING",
        }
      })

      // Link time entries to this payment
      await tx.timeEntry.updateMany({
        where: {
          id: { in: payment.entryIds }
        },
        data: {
          paymentId: newPayment.id
        }
      })

      results.push(newPayment)
    }

    return results
  })

  revalidatePath("/ops/payments")
  revalidatePath("/ops/payments/process")
  revalidatePath("/ops")

  return createdPayments
}
