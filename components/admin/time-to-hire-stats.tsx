"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { differenceInHours } from "date-fns"
import { Clock, TrendingDown, TrendingUp } from "lucide-react"

interface TimeToHireStatsProps {
  candidates: Array<{
    status: string
    created_at: string
    updated_at: string
  }>
}

export function TimeToHireStats({ candidates }: TimeToHireStatsProps) {
  const acceptedCandidates = candidates.filter((c) => c.status === "accepted")

  const timeToHire = acceptedCandidates.map((c) => {
    const created = new Date(c.created_at)
    const updated = new Date(c.updated_at)
    return differenceInHours(updated, created)
  })

  const avgTimeToHire = timeToHire.length > 0 ? timeToHire.reduce((a, b) => a + b, 0) / timeToHire.length : 0

  const avgDays = Math.floor(avgTimeToHire / 24)
  const avgHours = Math.floor(avgTimeToHire % 24)

  // Calculate trend (comparing last 3 vs previous 3)
  const recentThree = timeToHire.slice(-3)
  const previousThree = timeToHire.slice(-6, -3)
  const recentAvg = recentThree.length > 0 ? recentThree.reduce((a, b) => a + b, 0) / recentThree.length : 0
  const previousAvg = previousThree.length > 0 ? previousThree.reduce((a, b) => a + b, 0) / previousThree.length : 0
  const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0

  const fastestHire = timeToHire.length > 0 ? Math.min(...timeToHire) : 0
  const slowestHire = timeToHire.length > 0 ? Math.max(...timeToHire) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>채용 소요 시간</CardTitle>
        <CardDescription>제안부터 수락까지 걸린 평균 시간</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">평균 소요 시간</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{avgDays}</span>
                <span className="text-lg text-muted-foreground">일</span>
                <span className="text-2xl font-bold">{avgHours}</span>
                <span className="text-lg text-muted-foreground">시간</span>
              </div>
            </div>
            <Clock className="h-12 w-12 text-muted-foreground" />
          </div>

          {trend !== 0 && (
            <div className="flex items-center gap-2 text-sm">
              {trend < 0 ? (
                <>
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">{Math.abs(trend).toFixed(1)}% 개선</span>
                  <span className="text-muted-foreground">최근 3건 기준</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 font-medium">{trend.toFixed(1)}% 증가</span>
                  <span className="text-muted-foreground">최근 3건 기준</span>
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground mb-1">최단 시간</p>
              <p className="text-lg font-semibold">
                {Math.floor(fastestHire / 24)}일 {Math.floor(fastestHire % 24)}시간
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">최장 시간</p>
              <p className="text-lg font-semibold">
                {Math.floor(slowestHire / 24)}일 {Math.floor(slowestHire % 24)}시간
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
