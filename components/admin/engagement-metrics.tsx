"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Eye, MousePointerClick, MessageSquare, CheckCircle } from "lucide-react"

interface EngagementMetricsProps {
  candidates: Array<{
    id: string
    status: string
  }>
  pageViews: Array<{
    candidate_id: string
  }>
  responses: Array<{
    candidate_id: string
    response_type: string
  }>
}

export function EngagementMetrics({ candidates, pageViews, responses }: EngagementMetricsProps) {
  const total = candidates.length
  const viewedCount = candidates.filter((c) => ["viewed", "accepted", "declined", "inquiry"].includes(c.status)).length
  const respondedCount = candidates.filter((c) => ["accepted", "declined", "inquiry"].includes(c.status)).length
  const acceptedCount = candidates.filter((c) => c.status === "accepted").length

  const viewRate = total > 0 ? (viewedCount / total) * 100 : 0
  const responseRate = total > 0 ? (respondedCount / total) * 100 : 0
  const acceptanceRate = total > 0 ? (acceptedCount / total) * 100 : 0
  const engagementRate = viewedCount > 0 ? (respondedCount / viewedCount) * 100 : 0

  const metrics = [
    {
      label: "페이지 열람률",
      value: viewRate,
      count: viewedCount,
      total: total,
      icon: Eye,
      color: "text-blue-600",
    },
    {
      label: "응답률",
      value: responseRate,
      count: respondedCount,
      total: total,
      icon: MessageSquare,
      color: "text-purple-600",
    },
    {
      label: "참여율",
      value: engagementRate,
      count: respondedCount,
      total: viewedCount,
      icon: MousePointerClick,
      color: "text-yellow-600",
      description: "열람 후 응답 비율",
    },
    {
      label: "수락률",
      value: acceptanceRate,
      count: acceptedCount,
      total: total,
      icon: CheckCircle,
      color: "text-green-600",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>참여 지표</CardTitle>
        <CardDescription>후보자의 참여도와 전환율을 측정합니다</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {metric.count}/{metric.total}
                  </span>
                  <span className={`text-lg font-bold ${metric.color}`}>{metric.value.toFixed(1)}%</span>
                </div>
              </div>
              <Progress value={metric.value} className="h-2" />
              {metric.description && <p className="text-xs text-muted-foreground">{metric.description}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
