"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPlus, Edit, Trash2, Eye, Send, MessageSquare, StickyNote, RefreshCw, Activity } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ActivityTimelineProps {
  activities: Array<{
    id: string
    action_type: string
    action_description: string
    performed_by: string
    metadata?: any
    created_at: string
  }>
  maxHeight?: string
}

export function ActivityTimeline({ activities, maxHeight = "600px" }: ActivityTimelineProps) {
  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case "candidate_created":
        return <UserPlus className="h-4 w-4" />
      case "candidate_updated":
        return <Edit className="h-4 w-4" />
      case "candidate_deleted":
        return <Trash2 className="h-4 w-4" />
      case "candidate_viewed":
        return <Eye className="h-4 w-4" />
      case "page_sent":
        return <Send className="h-4 w-4" />
      case "page_viewed":
        return <Eye className="h-4 w-4" />
      case "response_received":
        return <MessageSquare className="h-4 w-4" />
      case "note_added":
        return <StickyNote className="h-4 w-4" />
      case "status_changed":
        return <RefreshCw className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (actionType: string) => {
    switch (actionType) {
      case "candidate_created":
        return "bg-blue-500"
      case "candidate_updated":
        return "bg-yellow-500"
      case "candidate_deleted":
        return "bg-red-500"
      case "response_received":
        return "bg-green-500"
      case "note_added":
        return "bg-purple-500"
      case "status_changed":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>활동 기록</CardTitle>
        <CardDescription>모든 활동과 변경 사항이 기록됩니다</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">아직 활동 기록이 없습니다</p>
          ) : (
            <div className="relative space-y-4 pl-6">
              {/* Timeline line */}
              <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />

              {activities.map((activity, index) => (
                <div key={activity.id} className="relative">
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "absolute -left-6 top-1 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center text-white",
                      getActivityColor(activity.action_type),
                    )}
                  >
                    {getActivityIcon(activity.action_type)}
                  </div>

                  {/* Activity content */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-relaxed">{activity.action_description}</p>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        {format(new Date(activity.created_at), "MM/dd HH:mm", { locale: ko })}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.performed_by}</p>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
