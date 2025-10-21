"use client"

import { cn } from "@/lib/utils"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { validatePasswordStrength } from "@/lib/password-validation"
import { AlertCircle } from "lucide-react"

export default function AdminSignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof validatePasswordStrength> | null>(null)
  const [showWeakPasswordWarning, setShowWeakPasswordWarning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (password) {
      const strength = validatePasswordStrength(password)
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(null)
    }
  }, [password])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("비밀번호가 일치하지 않습니다")
      setIsLoading(false)
      return
    }

    // Check password strength
    if (passwordStrength?.isWeak && !showWeakPasswordWarning) {
      setShowWeakPasswordWarning(true)
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/admin`,
        },
      })
      if (error) throw error
      router.push("/admin/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const getStrengthColor = (score: number) => {
    if (score <= 1) return "bg-red-500"
    if (score === 2) return "bg-yellow-500"
    if (score === 3) return "bg-blue-500"
    return "bg-green-500"
  }

  const getStrengthText = (score: number) => {
    if (score <= 1) return "매우 약함"
    if (score === 2) return "약함"
    if (score === 3) return "보통"
    return "강함"
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Team Sparta" width={200} height={40} className="h-10 w-auto" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">관리자 회원가입</CardTitle>
              <CardDescription>새 관리자 계정을 생성하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@teamsparta.co"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">비밀번호</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {passwordStrength && (
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">비밀번호 강도:</span>
                          <span
                            className={cn(
                              "font-medium",
                              passwordStrength.score <= 1 && "text-red-500",
                              passwordStrength.score === 2 && "text-yellow-500",
                              passwordStrength.score === 3 && "text-blue-500",
                              passwordStrength.score === 4 && "text-green-500",
                            )}
                          >
                            {getStrengthText(passwordStrength.score)}
                          </span>
                        </div>
                        <Progress value={(passwordStrength.score / 4) * 100} className="h-2" />
                        {passwordStrength.feedback.length > 0 && (
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {passwordStrength.feedback.map((item, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span className="text-red-500 mt-0.5">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password">비밀번호 확인</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>

                  {showWeakPasswordWarning && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        약한 비밀번호입니다. 계속하시겠습니까? 보안을 위해 더 강한 비밀번호를 권장합니다.
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "계정 생성 중..." : showWeakPasswordWarning ? "약한 비밀번호로 계속" : "회원가입"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  이미 계정이 있으신가요?{" "}
                  <Link href="/admin/login" className="underline underline-offset-4 font-medium">
                    로그인
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
