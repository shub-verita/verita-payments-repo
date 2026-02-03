"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/db"

export async function approveTimeEntries(entryIds: string[]) {
  if (entryIds.length === 0) return

  await prisma.timeEntry.updateMany({
    where: { id: { in: entryIds } },
    data: {
      approved: true,
      approvedAt: new Date(),
    }
  })

  revalidatePath("/ops/hours")
  revalidatePath("/ops")
}
