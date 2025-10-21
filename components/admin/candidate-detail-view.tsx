"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit, Copy, ExternalLink, Trash2, Clock, Eye, MessageSquare, AlertCircle } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { ko } from "date-fns/locale"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface CandidateDetailViewProps {
  candidate: {
    id: string
    name: string
    position: string
    track: string
    experience: string
    unique_token: string
    status: string
    created_at: string
    updated_at: string
  }
  responses: Array<{
    id: string
    response_type: string
    response_data: any
    created_at: string
  }>
  pageViews: Array<{
    id: string
    viewed_at: string
    ip_address?: string
    user_agent?: string
  }>
  notes: Array<{
    id: string
    note: string
    created_by: string
    created_at: string
  }>
  userEmail: string
}

export function CandidateDetailView({ candidate, responses, pageViews, notes, userEmail }: CandidateDetailViewProps) {
  const router = useRouter()
  const [newNote, setNewNote] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getStatusBadge = (status: string) => {
    const variants = {
      created: { label: "생성됨", className: "bg-gray-500" },
      sent: { label: "발송됨", className: "bg-blue-500" },
      viewed: { label: "열람함", className: "bg-yellow-500" },
      accepted: { label: "수락함", className: "bg-green-500" },
      declined: { label: "거절함", className: "bg-red-500" },
      inquiry: { label: "문의", className: "bg-purple-500" },
    }
    const variant = variants[status as keyof typeof variants] || { label: status, className: "bg-gray-500" }
    return <Badge className={cn("text-white", variant.className)}>{variant.label}</Badge>
  }

  const copyUrl = () => {
    const url = `${window.location.origin}/offer/${candidate.unique_token}`
    navigator.clipboard.writeText(url)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsAddingNote(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("candidate_notes").insert({
        candidate_id: candidate.id,
        note: newNote,
        created_by: userEmail,
      })

      if (error) throw error

      setNewNote("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "메모 추가 중 오류가 발생했습니다")
    } finally {
      setIsAddingNote(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`정말로 ${candidate.name}님의 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("candidates").delete().eq("id", candidate.id)

      if (error) throw error

      router.push("/admin/candidates")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/candidates/${candidate.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              정보 수정
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={copyUrl}>
            <Copy className="h-4 w-4 mr-2" />
            {copiedUrl ? "복사됨!" : "URL 복사"}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`/offer/${candidate.unique_token}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              페이지 보기
            </a>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "삭제 중..." : "삭제"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">상태</span>
              {getStatusBadge(candidate.status)}
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">이름</span>
                <span className="text-sm font-semibold">{candidate.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">포지션</span>
                <span className="text-sm">{candidate.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">트랙</span>
                <span className="text-sm">{candidate.track}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">경력</span>
                <span className="text-sm">{candidate.experience}</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">생성일</span>
                <span>{format(new Date(candidate.created_at), "PPP p", { locale: ko })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">수정일</span>
                <span>{format(new Date(candidate.updated_at), "PPP p", { locale: ko })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>활동 통계</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">페이지 조회</span>
              </div>
              <span className="text-2xl font-bold">{pageViews.length}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">응답 횟수</span>
              </div>
              <span className="text-2xl font-bold">{responses.length}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">마지막 활동</span>
              </div>
              <span className="text-sm">
                {pageViews.length > 0
                  ? formatDistanceToNow(new Date(pageViews[0].viewed_at), { addSuffix: true, locale: ko })
                  : "활동 없음"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Views Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>페이지 조회 기록</CardTitle>
          <CardDescription>후보자가 제안 페이지를 열람한 기록입니다</CardDescription>
        </CardHeader>
        <CardContent>
          {pageViews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">아직 페이지를 조회하지 않았습니다</p>
          ) : (
            <div className="space-y-3">
              {pageViews.map((view) => (
                <div key={view.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">페이지 조회</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(view.viewed_at), "PPP p", { locale: ko })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Responses */}
      <Card>
        <CardHeader>
          <CardTitle>응답 기록</CardTitle>
          <CardDescription>후보자의 모든 응답 내역입니다</CardDescription>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">아직 응답이 없습니다</p>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <div key={response.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge>{response.response_type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(response.created_at), "PPP p", { locale: ko })}
                    </span>
                  </div>
                  {response.response_data && (
                    <div className="text-sm space-y-1 mt-2">
                      {Object.entries(response.response_data).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="font-medium text-muted-foreground">{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>메모 및 코멘트</CardTitle>
          <CardDescription>팀원들과 후보자에 대한 의견을 공유하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="새 메모를 입력하세요..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button onClick={handleAddNote} disabled={isAddingNote || !newNote.trim()} size="sm">
              {isAddingNote ? "추가 중..." : "메모 추가"}
            </Button>
          </div>

          <Separator />

          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">아직 메모가 없습니다</p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="text-sm">{note.note}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{note.created_by}</span>
                    <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: ko })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
