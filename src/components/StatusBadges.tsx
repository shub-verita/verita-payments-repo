import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Clock, AlertCircle, AlertTriangle } from "lucide-react"
import type { ContractorStatus, CheckrStatus, PaymentStatus, ProjectStatus, DocumentStatus } from "@prisma/client"

export function CheckrBadge({ status }: { status: CheckrStatus | string }) {
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
    case "NOT_STARTED":
      return <Badge variant="secondary">Not Started</Badge>
    case "CONSIDER":
      return (
        <Badge variant="warning" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Consider
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

export function ContractorStatusBadge({ status }: { status: ContractorStatus | string }) {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="success">Active</Badge>
    case "ONBOARDING":
      return <Badge variant="info">Onboarding</Badge>
    case "PENDING_CHECKR":
      return <Badge variant="warning">Pending Checkr</Badge>
    case "PAUSED":
      return <Badge variant="secondary">Paused</Badge>
    case "OFFBOARDED":
      return <Badge variant="destructive">Offboarded</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus | string }) {
  switch (status) {
    case "PAID":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Received
        </Badge>
      )
    case "PROCESSING":
      return <Badge variant="info">Processing</Badge>
    case "IN_TRANSIT":
      return <Badge variant="info">In Transit</Badge>
    case "PENDING":
      return <Badge variant="warning">Pending</Badge>
    case "FAILED":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      )
    case "CANCELLED":
      return <Badge variant="secondary">Cancelled</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus | string }) {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="success">Active</Badge>
    case "PAUSED":
      return <Badge variant="warning">Paused</Badge>
    case "COMPLETED":
      return <Badge variant="info">Completed</Badge>
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus | string }) {
  switch (status) {
    case "SIGNED":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Signed
        </Badge>
      )
    case "VIEWED":
      return <Badge variant="info">Viewed</Badge>
    case "SENT":
      return <Badge variant="warning">Sent</Badge>
    case "PENDING":
      return (
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      )
    case "EXPIRED":
      return <Badge variant="destructive">Expired</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export function TimeEntrySourceBadge({ source }: { source: string }) {
  switch (source) {
    case "INSIGHTFUL":
      return <Badge variant="info">Insightful</Badge>
    case "INHOUSE":
      return <Badge variant="secondary">In-house</Badge>
    case "MANUAL":
      return <Badge variant="outline">Manual</Badge>
    case "PIPELINE":
      return <Badge variant="success">Pipeline</Badge>
    default:
      return <Badge>{source}</Badge>
  }
}

export function EligibilityBadge({ canPay }: { canPay: boolean }) {
  return canPay ? (
    <Badge variant="success">Eligible</Badge>
  ) : (
    <Badge variant="destructive" className="gap-1">
      <AlertTriangle className="h-3 w-3" />
      Blocked
    </Badge>
  )
}
