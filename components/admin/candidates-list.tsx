"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { useState } from "react"

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

interface CandidatesListProps {
  candidates: Candidate[]
}

export function CandidatesList({ candidates }: CandidatesListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "created":
        return <Badge variant="secondary">생성됨</Badge>
      case "sent":
        return <Badge className="bg-blue-600">발송됨</Badge>
      case "viewed":
        return <Badge className="bg-yellow-600">열람함</Badge>
      case "accepted":
        return <Badge className="bg-green-600">수락함</Badge>
      case "declined":
        return <Badge className="bg-red-600">거절함</Badge>
      case "inquiry":
        return <Badge className="bg-purple-600">문의</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const copyToClipboard = (token: string, id: string) => {
    const url = `${window.location.origin}/offer/${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-4">
      {candidates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">아직 후보자가 없습니다</p>
          </CardContent>
        </Card>
      ) : (
        candidates.map((candidate) => (
          <Card key={candidate.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{candidate.name}</h3>
                    {getStatusBadge(candidate.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">포지션:</span> {candidate.position}
                    </div>
                    <div>
                      <span className="text-muted-foreground">트랙:</span> {candidate.track}
                    </div>
                    <div>
                      <span className="text-muted-foreground">경력:</span> {candidate.experience}
                    </div>
                    <div>
                      <span className="text-muted-foreground">생성:</span>{" "}
                      {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true, locale: ko })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {window.location.origin}/offer/{candidate.unique_token}
                    </code>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(candidate.unique_token, candidate.id)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {copiedId === candidate.id ? "복사됨!" : "URL 복사"}
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/offer/${candidate.unique_token}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      페이지 보기
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
