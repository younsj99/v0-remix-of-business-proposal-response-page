"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, ExternalLink, Search, Filter } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface Candidate {
  id: string
  name: string
  position: string
  track: string
  experience: string
  unique_token: string
  status: string
  created_at: string
}

interface CandidatesListEnhancedProps {
  candidates: Candidate[]
}

export function CandidatesListEnhanced({ candidates }: CandidatesListEnhancedProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

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

  const copyToClipboard = (token: string, id: string) => {
    const url = `${window.location.origin}/offer/${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.track.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || candidate.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [candidates, searchQuery, statusFilter])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름, 포지션, 트랙으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="created">생성됨</SelectItem>
                <SelectItem value="sent">발송됨</SelectItem>
                <SelectItem value="viewed">열람함</SelectItem>
                <SelectItem value="accepted">수락함</SelectItem>
                <SelectItem value="declined">거절함</SelectItem>
                <SelectItem value="inquiry">문의</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredCandidates.length}개의 후보자
        {searchQuery || statusFilter !== "all" ? ` (필터 적용됨)` : ""}
      </div>

      {/* Candidates list */}
      {filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "검색 조건에 맞는 후보자가 없습니다"
                  : "아직 후보자가 없습니다"}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                  }}
                >
                  필터 초기화
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold">{candidate.name}</h3>
                      {getStatusBadge(candidate.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-medium">포지션:</span>
                        <span>{candidate.position}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-medium">트랙:</span>
                        <span>{candidate.track}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-medium">경력:</span>
                        <span>{candidate.experience}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-medium">생성:</span>
                        <span>
                          {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true, locale: ko })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <code className="text-xs bg-muted px-3 py-1.5 rounded-md flex-1 overflow-x-auto">
                        {window.location.origin}/offer/{candidate.unique_token}
                      </code>
                    </div>
                  </div>
                  <div className="flex gap-2 lg:flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:flex-none bg-transparent"
                      onClick={() => copyToClipboard(candidate.unique_token, candidate.id)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copiedId === candidate.id ? "복사됨!" : "URL 복사"}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 lg:flex-none bg-transparent" asChild>
                      <a href={`/offer/${candidate.unique_token}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        페이지 보기
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
