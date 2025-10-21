import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { CandidatesList } from "@/components/admin/candidates-list"

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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Image src="/logo.png" alt="Team Sparta" width={150} height={30} className="h-8 w-auto" />
            </Link>
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
            <h2 className="text-3xl font-bold">후보자 목록</h2>
            <p className="text-muted-foreground">모든 후보자를 관리하고 상태를 확인하세요</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin">대시보드로</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/candidates/new">새 후보자 추가</Link>
            </Button>
          </div>
        </div>

        <CandidatesList candidates={candidates || []} />
      </main>
    </div>
  )
}
