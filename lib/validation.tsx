// Security and validation utilities

// In-memory rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Escapes HTML special characters to prevent XSS attacks
 */
export function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Sanitizes and limits text length
 */
export function sanitizeText(text: string, maxLength: number): string {
  if (!text) return ""
  return text.trim().slice(0, maxLength)
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Simple in-memory rate limiting
 * @param key - Unique identifier (e.g., "inquiry-192.168.1.1")
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limit exceeded
 */
export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  // Clean up old entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k)
      }
    }
  }

  if (!record || record.resetTime < now) {
    // Create new record or reset expired record
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return true
  }

  if (record.count >= maxRequests) {
    // Rate limit exceeded
    return false
  }

  // Increment count
  record.count++
  return true
}
