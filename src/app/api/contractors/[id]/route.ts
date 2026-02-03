import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contractor = await prisma.contractor.findUnique({
      where: { id: params.id },
      include: {
        documents: true,
        projectAssignments: {
          include: {
            project: true,
          },
        },
        payments: {
          orderBy: { periodEnd: 'desc' },
          take: 20,
        },
        timeEntries: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!contractor) {
      return NextResponse.json(
        { error: 'Contractor not found' },
        { status: 404 }
      )
    }

    // Calculate summary stats
    const totalEarned = contractor.payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.netAmount), 0)

    const pendingAmount = contractor.payments
      .filter(p => ['PENDING', 'PROCESSING', 'IN_TRANSIT'].includes(p.status))
      .reduce((sum, p) => sum + Number(p.netAmount), 0)

    const totalHours = contractor.timeEntries
      .reduce((sum, e) => sum + Number(e.totalHours), 0)

    // Monthly breakdown for chart
    const monthlyEarnings = contractor.payments.reduce((acc, payment) => {
      const month = new Date(payment.periodEnd).toISOString().slice(0, 7)
      if (!acc[month]) {
        acc[month] = { paid: 0, pending: 0 }
      }
      if (payment.status === 'PAID') {
        acc[month].paid += Number(payment.netAmount)
      } else if (['PENDING', 'PROCESSING', 'IN_TRANSIT'].includes(payment.status)) {
        acc[month].pending += Number(payment.netAmount)
      }
      return acc
    }, {} as Record<string, { paid: number; pending: number }>)

    return NextResponse.json({
      data: contractor,
      summary: {
        totalEarned,
        pendingAmount,
        totalHours,
      },
      monthlyEarnings: Object.entries(monthlyEarnings)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    })
  } catch (error) {
    console.error('Error fetching contractor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contractor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const contractor = await prisma.contractor.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json({ data: contractor })
  } catch (error) {
    console.error('Error updating contractor:', error)
    return NextResponse.json(
      { error: 'Failed to update contractor' },
      { status: 500 }
    )
  }
}
