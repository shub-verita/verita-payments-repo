// Simple role-based access control
// In production, you'd use Clerk metadata or a database role field

const OPS_EMAILS = [
  'shubham@verita-ai.com',
  'ops@verita-ai.com',
  'admin@verita-ai.com',
]

const OPS_DOMAINS = [
  'verita-ai.com',
]

export function isOpsUser(email: string | undefined | null): boolean {
  if (!email) return false

  // Check specific emails
  if (OPS_EMAILS.includes(email.toLowerCase())) {
    return true
  }

  // Check domain
  const domain = email.split('@')[1]?.toLowerCase()
  if (domain && OPS_DOMAINS.includes(domain)) {
    return true
  }

  return false
}
