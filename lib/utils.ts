import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string, fmt = 'MMM d, yyyy'): string {
  return format(new Date(date), fmt)
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  return `INV-${year}-${random}`
}

export function generateQuoteNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 9000) + 1000
  return `QT-${year}-${random}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function parseJsonSafe<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'text-green-400 bg-green-400/10',
    INACTIVE: 'text-gray-400 bg-gray-400/10',
    PROSPECT: 'text-blue-400 bg-blue-400/10',
    ONBOARDING: 'text-yellow-400 bg-yellow-400/10',
    DRAFT: 'text-gray-400 bg-gray-400/10',
    SENT: 'text-blue-400 bg-blue-400/10',
    ACCEPTED: 'text-green-400 bg-green-400/10',
    DECLINED: 'text-red-400 bg-red-400/10',
    EXPIRED: 'text-orange-400 bg-orange-400/10',
    VIEWED: 'text-purple-400 bg-purple-400/10',
    SIGNED: 'text-green-400 bg-green-400/10',
    UNPAID: 'text-yellow-400 bg-yellow-400/10',
    PAID: 'text-green-400 bg-green-400/10',
    OVERDUE: 'text-red-400 bg-red-400/10',
    CANCELLED: 'text-gray-400 bg-gray-400/10',
    PENDING: 'text-yellow-400 bg-yellow-400/10',
    COMPLETED: 'text-green-400 bg-green-400/10',
  }
  return map[status] || 'text-gray-400 bg-gray-400/10'
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
