import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { RecentResponses } from "@/components/admin/recent-responses"
import { ResponseTrends } from "@/components/admin/response-trends"
import { StatusDistribution } from "@/components/admin/status-distribution"

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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Team Sparta" width={150} height={30} className="h-8 w-auto" />
            <h1 className="text-xl font-semibold">채용 관리 시스템</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action={handleSignOut}>
              <Button variant="outline" type="submit">
                로그아웃
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">대시보드</h2>
            <p className="text-muted-foreground">후보자 응답 현황을 한눈에 확인하세요</p>
          </div>
          <Button asChild>
            <Link href="/admin/candidates/new">새 후보자 추가</Link>
          </Button>
        </div>

        <DashboardStats
          totalCandidates={totalCandidates}
          acceptedCount={acceptedCount}
          declinedCount={declinedCount}
          pendingCount={pendingCount}
        />

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <StatusDistribution candidates={candidates || []} />
          <ResponseTrends responses={recentResponses || []} />
        </div>

        <div className="mt-6">
          <RecentResponses responses={recentResponses || []} />
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>후보자 관리</CardTitle>
              <CardDescription>모든 후보자 목록을 확인하고 관리하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/candidates">후보자 목록 보기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
