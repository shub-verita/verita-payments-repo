import prisma from "./db"
import { currentUser } from "@clerk/nextjs/server"

// Get current contractor from Clerk session
export async function getCurrentContractor() {
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress

  if (!email) return null

  return prisma.contractor.findUnique({
    where: { email },
    include: {
      projectAssignments: {
        where: { isActive: true },
        include: { project: true }
      }
    }
  })
}

// Get contractor with minimal fields
export async function getCurrentContractorBasic() {
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress

  if (!email) return null

  return prisma.contractor.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      hourlyRate: true,
    }
  })
}

// Get ops dashboard stats
export async function getOpsDashboardStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    activeContractors,
    pendingPayments,
    pendingHoursEntries,
    periodHours,
    pendingCheckrCount,
  ] = await Promise.all([
    prisma.contractor.count({ where: { status: "ACTIVE" } }),
    prisma.payment.findMany({
      where: { status: "PENDING" },
      include: { contractor: { select: { firstName: true, lastName: true, checkrStatus: true } } },
    }),
    prisma.timeEntry.findMany({
      where: { approved: false },
      select: { totalHours: true }
    }),
    prisma.timeEntry.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { totalHours: true },
    }),
    prisma.contractor.count({ where: { checkrStatus: "PENDING" } }),
  ])

  const totalPendingAmount = pendingPayments.reduce(
    (sum, p) => sum + Number(p.grossAmount), 0
  )
  const pendingHoursTotal = pendingHoursEntries.reduce(
    (sum, e) => sum + Number(e.totalHours), 0
  )

  return {
    activeContractors,
    pendingPayments,
    pendingPaymentsCount: pendingPayments.length,
    totalPendingAmount,
    pendingHoursTotal,
    periodHoursTotal: Number(periodHours._sum.totalHours || 0),
    pendingCheckrCount,
    startOfMonth,
  }
}

// Get contractors with approved unpaid hours (for payment processing)
export async function getContractorsWithUnpaidHours() {
  return prisma.contractor.findMany({
    where: {
      timeEntries: {
        some: {
          approved: true,
          paymentId: null,
        }
      }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      hourlyRate: true,
      checkrStatus: true,
      paymentEligible: true,
      timeEntries: {
        where: {
          approved: true,
          paymentId: null,
        },
        select: {
          id: true,
          date: true,
          totalHours: true,
        },
        orderBy: { date: "asc" }
      }
    }
  })
}

// Get pending time entries grouped by contractor
export async function getPendingTimeEntries() {
  return prisma.timeEntry.findMany({
    where: { approved: false },
    select: {
      id: true,
      date: true,
      totalHours: true,
      productiveHours: true,
      source: true,
      contractor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },
      project: {
        select: { name: true }
      }
    },
    orderBy: [
      { contractor: { lastName: "asc" } },
      { date: "desc" }
    ]
  })
}
