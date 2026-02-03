import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create projects
  const coactive = await prisma.project.upsert({
    where: { code: 'COACTIVE' },
    update: {},
    create: {
      name: 'Coactive AI',
      code: 'COACTIVE',
      client: 'Coactive',
      status: 'ACTIVE',
      budget: 50000,
    },
  })

  const treeswift = await prisma.project.upsert({
    where: { code: 'TREESWIFT' },
    update: {},
    create: {
      name: 'Treeswift',
      code: 'TREESWIFT',
      client: 'Treeswift',
      status: 'ACTIVE',
      budget: 30000,
    },
  })

  const agi = await prisma.project.upsert({
    where: { code: 'AGI' },
    update: {},
    create: {
      name: 'AGI Inc',
      code: 'AGI',
      client: 'AGI Inc',
      status: 'ACTIVE',
      budget: 75000,
    },
  })

  console.log('✅ Projects created')

  // Create contractors
  const contractors = [
    {
      firstName: 'Alex',
      lastName: 'Thompson',
      email: 'alex.thompson@example.com',
      country: 'USA',
      hourlyRate: 25,
      status: 'ACTIVE' as const,
      checkrStatus: 'CLEAR' as const,
      onboardingComplete: true,
      paymentEligible: true,
    },
    {
      firstName: 'Jordan',
      lastName: 'Lee',
      email: 'jordan.lee@example.com',
      country: 'Canada',
      hourlyRate: 20,
      status: 'ACTIVE' as const,
      checkrStatus: 'CLEAR' as const,
      onboardingComplete: true,
      paymentEligible: true,
    },
    {
      firstName: 'Sam',
      lastName: 'Rivera',
      email: 'sam.rivera@example.com',
      country: 'Mexico',
      hourlyRate: 18,
      status: 'PENDING_CHECKR' as const,
      checkrStatus: 'PENDING' as const,
      onboardingComplete: false,
      paymentEligible: false,
    },
    {
      firstName: 'Casey',
      lastName: 'Morgan',
      email: 'casey.morgan@example.com',
      country: 'UK',
      hourlyRate: 22,
      status: 'ACTIVE' as const,
      checkrStatus: 'CLEAR' as const,
      onboardingComplete: true,
      paymentEligible: true,
    },
    {
      firstName: 'Taylor',
      lastName: 'Kim',
      email: 'taylor.kim@example.com',
      country: 'South Korea',
      hourlyRate: 20,
      status: 'ONBOARDING' as const,
      checkrStatus: 'NOT_STARTED' as const,
      onboardingComplete: false,
      paymentEligible: false,
    },
  ]

  for (const contractor of contractors) {
    await prisma.contractor.upsert({
      where: { email: contractor.email },
      update: {},
      create: contractor,
    })
  }

  console.log('✅ Contractors created')

  // Get contractor IDs for assignments and payments
  const alex = await prisma.contractor.findUnique({ where: { email: 'alex.thompson@example.com' } })
  const jordan = await prisma.contractor.findUnique({ where: { email: 'jordan.lee@example.com' } })
  const casey = await prisma.contractor.findUnique({ where: { email: 'casey.morgan@example.com' } })

  if (alex && jordan && casey) {
    // Create project assignments
    await prisma.projectAssignment.upsert({
      where: { contractorId_projectId: { contractorId: alex.id, projectId: coactive.id } },
      update: {},
      create: { contractorId: alex.id, projectId: coactive.id, role: 'Annotator' },
    })

    await prisma.projectAssignment.upsert({
      where: { contractorId_projectId: { contractorId: jordan.id, projectId: treeswift.id } },
      update: {},
      create: { contractorId: jordan.id, projectId: treeswift.id, role: 'QA' },
    })

    await prisma.projectAssignment.upsert({
      where: { contractorId_projectId: { contractorId: casey.id, projectId: coactive.id } },
      update: {},
      create: { contractorId: casey.id, projectId: coactive.id, role: 'Annotator' },
    })

    console.log('✅ Project assignments created')

    // Create sample payments for Alex
    const payments = [
      { periodStart: '2025-12-01', periodEnd: '2025-12-15', hours: 16, status: 'PAID' as const, paidAt: new Date('2025-12-18') },
      { periodStart: '2025-12-16', periodEnd: '2025-12-31', hours: 20, status: 'PAID' as const, paidAt: new Date('2026-01-03') },
      { periodStart: '2026-01-01', periodEnd: '2026-01-15', hours: 18, status: 'PAID' as const, paidAt: new Date('2026-01-18') },
      { periodStart: '2026-01-16', periodEnd: '2026-01-31', hours: 14, status: 'PAID' as const, paidAt: new Date('2026-02-03') },
      { periodStart: '2026-02-01', periodEnd: '2026-02-04', hours: 16, status: 'IN_TRANSIT' as const, paidAt: null },
    ]

    for (const payment of payments) {
      const amount = payment.hours * Number(alex.hourlyRate)
      await prisma.payment.create({
        data: {
          contractorId: alex.id,
          periodStart: new Date(payment.periodStart),
          periodEnd: new Date(payment.periodEnd),
          totalHours: payment.hours,
          hourlyRate: alex.hourlyRate,
          grossAmount: amount,
          netAmount: amount,
          status: payment.status,
          paidAt: payment.paidAt,
        },
      })
    }

    console.log('✅ Sample payments created')

    // Create sample time entries
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue

      const hours = Math.floor(Math.random() * 4) + 4 // 4-8 hours
      await prisma.timeEntry.create({
        data: {
          contractorId: alex.id,
          projectId: coactive.id,
          date: date,
          totalHours: hours,
          productiveHours: hours * 0.9,
          nonProductiveHours: hours * 0.1,
          source: 'INSIGHTFUL',
          approved: i > 5, // Older entries are approved
          screenshotCount: Math.floor(Math.random() * 20) + 10,
        },
      })
    }

    console.log('✅ Sample time entries created')
  }

  console.log('🎉 Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
