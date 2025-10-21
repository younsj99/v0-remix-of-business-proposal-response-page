import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { RecentResponses } from "@/components/admin/recent-responses"
import { ResponseTrends } from "@/components/admin/response-trends"
import { StatusDistribution } from "@/components/admin/status-distribution"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/admin/login")
  }

  // Fetch dashboard data
  const { data: candidates } = await supabase.from("candidates").select("*").order("created_at", { ascending: false })

  const { data: recentResponses } = await supabase
    .from("candidate_responses")
    .select("*, candidates(*)")
    .order("created_at", { ascending: false })
    .limit(10)

  const totalCandidates = candidates?.length || 0
  const acceptedCount = candidates?.filter((c) => c.status === "accepted").length || 0
  const declinedCount = candidates?.filter((c) => c.status === "declined").length || 0
  const pendingCount = candidates?.filter((c) => c.status === "sent" || c.status === "viewed").length || 0

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/admin/login")
  }

  return (
    <AdminLayout userEmail={user.email || ""} onSignOut={handleSignOut}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
            <p className="text-muted-foreground mt-1">후보자 응답 현황을 한눈에 확인하세요</p>
          </div>
          <Button asChild size="lg">
            <Link href="/admin/candidates/new">
              새 후보자 추가
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <DashboardStats
          totalCandidates={totalCandidates}
          acceptedCount={acceptedCount}
          declinedCount={declinedCount}
          pendingCount={pendingCount}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <StatusDistribution candidates={candidates || []} />
          <ResponseTrends responses={recentResponses || []} />
        </div>

        <RecentResponses responses={recentResponses || []} />

        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
            <CardDescription>자주 사용하는 기능에 빠르게 접근하세요</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Button asChild variant="outline" className="h-auto py-4 justify-start bg-transparent">
              <Link href="/admin/candidates">
                <div className="text-left">
                  <div className="font-semibold">후보자 목록</div>
                  <div className="text-sm text-muted-foreground">모든 후보자 확인 및 관리</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 justify-start bg-transparent">
              <Link href="/admin/candidates/new">
                <div className="text-left">
                  <div className="font-semibold">새 후보자 추가</div>
                  <div className="text-sm text-muted-foreground">맞춤형 제안 페이지 생성</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
