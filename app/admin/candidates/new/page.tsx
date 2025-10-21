import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { NewCandidateForm } from "@/components/admin/new-candidate-form"

export default async function NewCandidatePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/admin/login")
  }

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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">새 후보자 추가</h2>
          <p className="text-muted-foreground">후보자 정보를 입력하여 맞춤형 제안 페이지를 생성하세요</p>
        </div>

        <NewCandidateForm />

        <div className="mt-6">
          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href="/admin/candidates">취소하고 목록으로</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
