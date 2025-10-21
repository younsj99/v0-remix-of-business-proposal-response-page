"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export function NewCandidateForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    track: "",
    experience: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Generate unique token
      const uniqueToken = crypto.randomUUID()

      const { error: insertError } = await supabase.from("candidates").insert({
        name: formData.name,
        position: formData.position,
        track: formData.track,
        experience: formData.experience,
        unique_token: uniqueToken,
        status: "created",
      })

      if (insertError) throw insertError

      router.push("/admin/candidates")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "후보자 생성 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>후보자 정보</CardTitle>
        <CardDescription>아래 4가지 필수 항목을 입력해주세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="홍길동"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">포지션 *</Label>
            <Input
              id="position"
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="백엔드 개발자"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="track">트랙 *</Label>
            <Input
              id="track"
              required
              value={formData.track}
              onChange={(e) => setFormData({ ...formData, track: e.target.value })}
              placeholder="웹 개발"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">경력 *</Label>
            <Input
              id="experience"
              required
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="3년"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "생성 중..." : "후보자 페이지 생성"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
