import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EditCandidateForm } from "@/components/admin/edit-candidate-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function EditCandidatePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/admin/login")
  }

  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", params.id)
    .single()

  if (candidateError || !candidate) {
    notFound()
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
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/candidates/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">후보자 정보 수정</h1>
            <p className="text-muted-foreground mt-1">{candidate.name}님의 정보를 수정합니다</p>
          </div>
        </div>

        <EditCandidateForm candidate={candidate} />
      </div>
    </AdminLayout>
  )
}
