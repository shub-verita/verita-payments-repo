import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const checkrStatus = searchParams.get('checkrStatus')

    const where: any = {}
    if (status) where.status = status
    if (checkrStatus) where.checkrStatus = checkrStatus

    const contractors = await prisma.contractor.findMany({
      where,
      include: {
        projectAssignments: {
          include: {
            project: true,
          },
        },
        _count: {
          select: {
            payments: true,
            timeEntries: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: contractors })
  } catch (error) {
    console.error('Error fetching contractors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contractors' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const contractor = await prisma.contractor.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        country: body.country,
        timezone: body.timezone,
        hourlyRate: body.hourlyRate,
        weeklyCap: body.weeklyCap,
        status: 'ONBOARDING',
        checkrStatus: 'NOT_STARTED',
      },
    })

    return NextResponse.json({ data: contractor }, { status: 201 })
  } catch (error) {
    console.error('Error creating contractor:', error)
    return NextResponse.json(
      { error: 'Failed to create contractor' },
      { status: 500 }
    )
  }
}
