"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle } from "lucide-react"

interface EditCandidateFormProps {
  candidate: {
    id: string
    name: string
    position: string
    track: string
    experience: string
  }
}

export function EditCandidateForm({ candidate }: EditCandidateFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: candidate.name,
    position: candidate.position,
    track: candidate.track,
    experience: candidate.experience,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from("candidates")
        .update({
          name: formData.name,
          position: formData.position,
          track: formData.track,
          experience: formData.experience,
          updated_at: new Date().toISOString(),
        })
        .eq("id", candidate.id)

      if (updateError) throw updateError

      router.push(`/admin/candidates/${candidate.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "수정 중 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>후보자 정보 수정</CardTitle>
        <CardDescription>후보자의 기본 정보를 수정합니다</CardDescription>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">포지션 *</Label>
            <Input
              id="position"
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="track">트랙 *</Label>
            <Input
              id="track"
              required
              value={formData.track}
              onChange={(e) => setFormData({ ...formData, track: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">경력 *</Label>
            <Input
              id="experience"
              required
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "저장 중..." : "변경사항 저장"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
