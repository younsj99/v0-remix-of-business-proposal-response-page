import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
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
    <AdminLayout userEmail={user.email || ""} onSignOut={handleSignOut}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">새 후보자 추가</h1>
          <p className="text-muted-foreground mt-1">후보자 정보를 입력하여 맞춤형 제안 페이지를 생성하세요</p>
        </div>

        <NewCandidateForm />
      </div>
    </AdminLayout>
  )
}
