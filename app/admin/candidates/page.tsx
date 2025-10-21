import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { CandidatesListEnhanced } from "@/components/admin/candidates-list-enhanced"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserPlus } from "lucide-react"

export default async function CandidatesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/admin/login")
  }

  const { data: candidates } = await supabase.from("candidates").select("*").order("created_at", { ascending: false })

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
            <h1 className="text-3xl font-bold tracking-tight">후보자 목록</h1>
            <p className="text-muted-foreground mt-1">총 {candidates?.length || 0}명의 후보자를 관리하고 있습니다</p>
          </div>
          <Button asChild size="lg">
            <Link href="/admin/candidates/new">
              <UserPlus className="mr-2 h-4 w-4" />새 후보자 추가
            </Link>
          </Button>
        </div>

        <CandidatesListEnhanced candidates={candidates || []} />
      </div>
    </AdminLayout>
  )
}
