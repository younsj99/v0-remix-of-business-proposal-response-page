import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

interface RecentResponsesProps {
  responses: Array<{
    id: string
    response_type: string
    created_at: string
    candidates: {
      name: string
      position: string
    }
  }>
}

export function RecentResponses({ responses }: RecentResponsesProps) {
  const getStatusBadge = (type: string) => {
    switch (type) {
      case "accepted":
        return <Badge className="bg-green-600">수락</Badge>
      case "declined":
        return <Badge className="bg-red-600">거절</Badge>
      case "inquiry":
        return <Badge className="bg-blue-600">문의</Badge>
      case "declined_no_contact":
        return <Badge variant="secondary">거절 (연락 불필요)</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 응답</CardTitle>
        <CardDescription>최근 7일 내 후보자 응답 현황</CardDescription>
      </CardHeader>
      <CardContent>
        {responses.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">아직 응답이 없습니다</p>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => (
              <div key={response.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div className="space-y-1">
                  <p className="font-medium">{response.candidates.name}</p>
                  <p className="text-sm text-muted-foreground">{response.candidates.position}</p>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(response.response_type)}
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(response.created_at), { addSuffix: true, locale: ko })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
