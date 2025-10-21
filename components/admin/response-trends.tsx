"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from "recharts"
import { format, subDays, startOfDay } from "date-fns"
import { ko } from "date-fns/locale"

interface ResponseTrendsProps {
  responses: Array<{
    response_type: string
    created_at: string
  }>
}

export function ResponseTrends({ responses }: ResponseTrendsProps) {
  // Generate last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i))
    return {
      date: format(date, "MM/dd", { locale: ko }),
      accepted: 0,
      declined: 0,
    }
  })

  // Count responses by day
  responses.forEach((response) => {
    const responseDate = startOfDay(new Date(response.created_at))
    const dayIndex = last7Days.findIndex((day) => {
      const dayDate = startOfDay(subDays(new Date(), 6 - last7Days.indexOf(day)))
      return dayDate.getTime() === responseDate.getTime()
    })

    if (dayIndex !== -1) {
      if (response.response_type === "accepted") {
        last7Days[dayIndex].accepted++
      } else if (response.response_type === "declined" || response.response_type === "declined_no_contact") {
        last7Days[dayIndex].declined++
      }
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>응답 트렌드</CardTitle>
        <CardDescription>최근 7일간 수락/거절 추이</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="accepted" stroke="#22c55e" name="수락" strokeWidth={2} />
            <Line type="monotone" dataKey="declined" stroke="#ef4444" name="거절" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
