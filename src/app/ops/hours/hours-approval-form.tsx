"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { TimeEntrySourceBadge } from "@/components/StatusBadges"
import { formatDate } from "@/lib/format"
import { approveTimeEntries } from "./actions"

type TimeEntry = {
  id: string
  date: Date
  totalHours: number
  productiveHours: number | null
  source: string
  contractor: { id: string; firstName: string; lastName: string }
  project: { name: string } | null
}

type EntriesByContractor = Record<string, {
  contractor: { id: string; firstName: string; lastName: string }
  entries: TimeEntry[]
}>

export function HoursApprovalForm({ entriesByContractor }: { entriesByContractor: EntriesByContractor }) {
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const toggleEntry = (entryId: string) => {
    const newSelected = new Set(selectedEntries)
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId)
    } else {
      newSelected.add(entryId)
    }
    setSelectedEntries(newSelected)
  }

  const toggleContractor = (entries: TimeEntry[]) => {
    const entryIds = entries.map(e => e.id)
    const allSelected = entryIds.every(id => selectedEntries.has(id))
    const newSelected = new Set(selectedEntries)

    if (allSelected) {
      entryIds.forEach(id => newSelected.delete(id))
    } else {
      entryIds.forEach(id => newSelected.add(id))
    }
    setSelectedEntries(newSelected)
  }

  const selectAll = () => {
    const allIds = Object.values(entriesByContractor).flatMap(g => g.entries.map(e => e.id))
    setSelectedEntries(new Set(allIds))
  }

  const handleApprove = () => {
    startTransition(async () => {
      await approveTimeEntries(Array.from(selectedEntries))
      setSelectedEntries(new Set())
    })
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{selectedEntries.size} entries selected</span>
          <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
        </div>
        <Button onClick={handleApprove} disabled={selectedEntries.size === 0 || isPending} className="gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Approve Selected
        </Button>
      </div>

      {/* Entries by Contractor */}
      {Object.entries(entriesByContractor).map(([contractorId, { contractor, entries }]) => {
        const contractorTotal = entries.reduce((sum, e) => sum + e.totalHours, 0)
        const allSelected = entries.every(e => selectedEntries.has(e.id))

        return (
          <Card key={contractorId}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => toggleContractor(entries)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <CardTitle className="text-lg">{contractor.firstName} {contractor.lastName}</CardTitle>
                </div>
                <span className="text-sm font-medium text-gray-500">{contractorTotal.toFixed(1)} hrs total</span>
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 w-8"></th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Total Hours</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Productive</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-gray-600">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <input
                          type="checkbox"
                          checked={selectedEntries.has(entry.id)}
                          onChange={() => toggleEntry(entry.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="py-3 px-4 text-gray-900">{formatDate(entry.date)}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">{entry.totalHours.toFixed(1)}</td>
                      <td className="py-3 px-4 text-gray-600">{entry.productiveHours?.toFixed(1) ?? "—"}</td>
                      <td className="py-3 px-4"><TimeEntrySourceBadge source={entry.source} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
