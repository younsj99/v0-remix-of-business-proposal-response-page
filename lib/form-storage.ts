const STORAGE_KEY = "teamsparta_proposal_form"
const EXPIRATION_DAYS = 7

interface StoredFormData {
  timestamp: number
  viewState: string
  formData?: {
    name: string
    email: string
    contact: string
  }
  inquiryData?: {
    email: string
    message: string
  }
  contactFormData?: {
    email: string
    phone: string
  }
  privacyConsent?: boolean
  inquiryPrivacyConsent?: boolean
  contactPrivacyConsent?: boolean
}

export function saveFormData(data: Partial<StoredFormData>) {
  if (typeof window === "undefined") return

  try {
    const existing = loadFormData()
    const updated: StoredFormData = {
      ...existing,
      ...data,
      timestamp: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error("Failed to save form data:", error)
  }
}

export function loadFormData(): StoredFormData | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const data: StoredFormData = JSON.parse(stored)

    // Check expiration (7 days)
    const expirationTime = EXPIRATION_DAYS * 24 * 60 * 60 * 1000
    if (Date.now() - data.timestamp > expirationTime) {
      clearFormData()
      return null
    }

    return data
  } catch (error) {
    console.error("Failed to load form data:", error)
    return null
  }
}

export function clearFormData() {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear form data:", error)
  }
}

export function hasStoredData(): boolean {
  return loadFormData() !== null
}
