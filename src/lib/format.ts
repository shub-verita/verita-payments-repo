// Shared formatting utilities

export function formatCurrency(amount: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function formatPeriod(start: Date | string, end: Date | string): string {
  return `${formatDateShort(start)} - ${formatDateShort(end)}`
}

export function formatHours(hours: number): string {
  return hours.toFixed(1)
}
