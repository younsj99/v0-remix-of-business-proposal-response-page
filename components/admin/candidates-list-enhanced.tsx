"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AdvancedFilters } from "./advanced-filters"
import { exportToCSV, exportToJSON } from "@/lib/export-utils"
import { startOfDay, endOfDay, isWithinInterval } from "date-fns"

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
  const [positionFilter, setPositionFilter] = useState<string>("all")
  const [trackFilter, setTrackFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()

  // Extract unique positions and tracks
  const positions = useMemo(() => {
    return Array.from(new Set(candidates.map((c) => c.position))).sort()
  }, [candidates])

  const tracks = useMemo(() => {
    return Array.from(new Set(candidates.map((c) => c.track))).sort()
  }, [candidates])

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
      const matchesPosition = positionFilter === "all" || candidate.position === positionFilter
      const matchesTrack = trackFilter === "all" || candidate.track === trackFilter

      let matchesDate = true
      if (dateFrom || dateTo) {
        const candidateDate = new Date(candidate.created_at)
        if (dateFrom && dateTo) {
          matchesDate = isWithinInterval(candidateDate, {
            start: startOfDay(dateFrom),
            end: endOfDay(dateTo),
          })
        } else if (dateFrom) {
          matchesDate = candidateDate >= startOfDay(dateFrom)
        } else if (dateTo) {
          matchesDate = candidateDate <= endOfDay(dateTo)
        }
      }

      return matchesSearch && matchesStatus && matchesPosition && matchesTrack && matchesDate
    })
  }, [candidates, searchQuery, statusFilter, positionFilter, trackFilter, dateFrom, dateTo])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchQuery) count++
    if (statusFilter !== "all") count++
    if (positionFilter !== "all") count++
    if (trackFilter !== "all") count++
    if (dateFrom) count++
    if (dateTo) count++
    return count
  }, [searchQuery, statusFilter, positionFilter, trackFilter, dateFrom, dateTo])

  const handleReset = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setPositionFilter("all")
    setTrackFilter("all")
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const handleExport = (format: "csv" | "json") => {
    const exportData = filteredCandidates.map((c) => ({
      이름: c.name,
      포지션: c.position,
      트랙: c.track,
      경력: c.experience,
      상태: c.status,
      생성일: c.created_at,
      URL: `${window.location.origin}/offer/${c.unique_token}`,
    }))

    const filename = `candidates_${new Date().toISOString().split("T")[0]}`

    if (format === "csv") {
      exportToCSV(exportData, filename)
    } else {
      exportToJSON(exportData, filename)
    }
  }

  return (
    <div className="space-y-4">
      <AdvancedFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        positionFilter={positionFilter}
        setPositionFilter={setPositionFilter}
        trackFilter={trackFilter}
        setTrackFilter={setTrackFilter}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        onReset={handleReset}
        onExport={handleExport}
        positions={positions}
        tracks={tracks}
        activeFiltersCount={activeFiltersCount}
      />

      <div className="text-sm text-muted-foreground">
        {filteredCandidates.length}개의 후보자
        {activeFiltersCount > 0 && ` (${activeFiltersCount}개 필터 적용됨)`}
      </div>

      {filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                {activeFiltersCount > 0 ? "검색 조건에 맞는 후보자가 없습니다" : "아직 후보자가 없습니다"}
              </p>
              {activeFiltersCount > 0 && (
                <Button variant="link" onClick={handleReset}>
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
                      <Link href={`/admin/candidates/${candidate.id}`} className="hover:underline">
                        <h3 className="text-lg font-semibold">{candidate.name}</h3>
                      </Link>
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
                    <Button variant="default" size="sm" className="flex-1 lg:flex-none" asChild>
                      <Link href={`/admin/candidates/${candidate.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        상세보기
                      </Link>
                    </Button>
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
