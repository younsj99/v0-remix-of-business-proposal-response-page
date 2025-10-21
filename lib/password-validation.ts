export interface PasswordStrength {
  score: number // 0-4
  feedback: string[]
  isWeak: boolean
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) score++
  else feedback.push("최소 8자 이상이어야 합니다")

  if (password.length >= 12) score++

  // Complexity checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push("대문자와 소문자를 모두 포함해야 합니다")
  }

  if (/\d/.test(password)) {
    score++
  } else {
    feedback.push("숫자를 포함해야 합니다")
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++
  } else {
    feedback.push("특수문자를 포함해야 합니다")
  }

  // Common passwords check
  const commonPasswords = ["1234", "password", "12345678", "qwerty", "abc123"]
  if (commonPasswords.includes(password.toLowerCase())) {
    score = Math.max(0, score - 2)
    feedback.push("너무 흔한 비밀번호입니다")
  }

  return {
    score: Math.min(score, 4),
    feedback,
    isWeak: score < 3,
  }
}
