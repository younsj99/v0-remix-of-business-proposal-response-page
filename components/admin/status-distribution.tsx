"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface StatusDistributionProps {
  candidates: Array<{
    status: string
  }>
}

export function StatusDistribution({ candidates }: StatusDistributionProps) {
  const statusCounts = candidates.reduce(
    (acc, candidate) => {
      acc[candidate.status] = (acc[candidate.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const data = [
    { name: "생성됨", value: statusCounts.created || 0, color: "#94a3b8" },
    { name: "발송됨", value: statusCounts.sent || 0, color: "#60a5fa" },
    { name: "열람함", value: statusCounts.viewed || 0, color: "#fbbf24" },
    { name: "수락함", value: statusCounts.accepted || 0, color: "#22c55e" },
    { name: "거절함", value: statusCounts.declined || 0, color: "#ef4444" },
    { name: "문의", value: statusCounts.inquiry || 0, color: "#8b5cf6" },
  ].filter((item) => item.value > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>후보자 상태 분포</CardTitle>
        <CardDescription>현재 후보자들의 상태별 분포</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">데이터가 없습니다</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
