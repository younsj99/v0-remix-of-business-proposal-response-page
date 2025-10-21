"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ConversionFunnelProps {
  candidates: Array<{
    status: string
  }>
}

export function ConversionFunnel({ candidates }: ConversionFunnelProps) {
  const total = candidates.length
  const sent = candidates.filter((c) => ["sent", "viewed", "accepted", "declined", "inquiry"].includes(c.status)).length
  const viewed = candidates.filter((c) => ["viewed", "accepted", "declined", "inquiry"].includes(c.status)).length
  const responded = candidates.filter((c) => ["accepted", "declined", "inquiry"].includes(c.status)).length
  const accepted = candidates.filter((c) => c.status === "accepted").length

  const stages = [
    { label: "생성됨", count: total, percentage: 100, color: "bg-gray-500" },
    { label: "발송됨", count: sent, percentage: total > 0 ? (sent / total) * 100 : 0, color: "bg-blue-500" },
    { label: "열람함", count: viewed, percentage: total > 0 ? (viewed / total) * 100 : 0, color: "bg-yellow-500" },
    {
      label: "응답함",
      count: responded,
      percentage: total > 0 ? (responded / total) * 100 : 0,
      color: "bg-purple-500",
    },
    { label: "수락함", count: accepted, percentage: total > 0 ? (accepted / total) * 100 : 0, color: "bg-green-500" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>전환 퍼널</CardTitle>
        <CardDescription>후보자의 단계별 전환율을 확인하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stage.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{stage.count}명</span>
                  <span className="font-semibold">{stage.percentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                <div
                  className={cn(
                    "h-full flex items-center justify-center text-white font-semibold transition-all",
                    stage.color,
                  )}
                  style={{ width: `${stage.percentage}%` }}
                >
                  {stage.percentage > 15 && `${stage.percentage.toFixed(0)}%`}
                </div>
              </div>
              {index < stages.length - 1 && (
                <div className="flex justify-center">
                  <div className="text-xs text-muted-foreground">
                    ↓ {stages[index + 1].count > 0 ? ((stages[index + 1].count / stage.count) * 100).toFixed(1) : "0"}%
                    전환
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
