import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatHours(hours: number): string {
  return `${hours.toFixed(1)} hrs`
}

export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-700'
    case 'IN_TRANSIT':
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-700'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700'
    case 'FAILED':
    case 'CANCELLED':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case 'PAID':
      return 'Received'
    case 'IN_TRANSIT':
      return 'In Transit'
    case 'PROCESSING':
      return 'Processing'
    case 'PENDING':
      return 'Pending'
    case 'FAILED':
      return 'Failed'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return status
  }
}

export function getCheckrStatusColor(status: string): string {
  switch (status) {
    case 'CLEAR':
      return 'bg-green-100 text-green-700'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700'
    case 'CONSIDER':
      return 'bg-orange-100 text-orange-700'
    case 'SUSPENDED':
    case 'EXPIRED':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export function getContractorStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-700'
    case 'ONBOARDING':
    case 'PENDING_CHECKR':
      return 'bg-yellow-100 text-yellow-700'
    case 'PAUSED':
      return 'bg-orange-100 text-orange-700'
    case 'OFFBOARDED':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}
