import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ActivityTimeline } from "@/components/admin/activity-timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

export default async function ActivityLogPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/admin/login")
  }

  // Fetch all activity logs
  const { data: activities } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  // Get activity statistics
  const activityByType = activities?.reduce(
    (acc, activity) => {
      acc[activity.action_type] = (acc[activity.action_type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/admin/login")
  }

  return (
    <AdminLayout userEmail={user.email || ""} onSignOut={handleSignOut}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">활동 로그</h1>
          <p className="text-muted-foreground mt-1">시스템의 모든 활동을 추적하고 감사합니다</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 활동</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activities?.length || 0}</div>
              <p className="text-xs text-muted-foreground">최근 100개 활동</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">후보자 생성</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityByType?.candidate_created || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">응답 수신</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityByType?.response_received || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">메모 추가</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activityByType?.note_added || 0}</div>
            </CardContent>
          </Card>
        </div>

        <ActivityTimeline activities={activities || []} maxHeight="calc(100vh - 400px)" />
      </div>
    </AdminLayout>
  )
}
