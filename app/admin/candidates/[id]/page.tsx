import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { CandidateDetailView } from "@/components/admin/candidate-detail-view"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function CandidateDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/admin/login")
  }

  // Fetch candidate data
  const { data: candidate, error: candidateError } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", params.id)
    .single()

  if (candidateError || !candidate) {
    notFound()
  }

  // Fetch candidate responses
  const { data: responses } = await supabase
    .from("candidate_responses")
    .select("*")
    .eq("candidate_id", params.id)
    .order("created_at", { ascending: false })

  // Fetch page views
  const { data: pageViews } = await supabase
    .from("candidate_page_views")
    .select("*")
    .eq("candidate_id", params.id)
    .order("viewed_at", { ascending: false })

  // Fetch notes
  const { data: notes } = await supabase
    .from("candidate_notes")
    .select("*")
    .eq("candidate_id", params.id)
    .order("created_at", { ascending: false })

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/admin/login")
  }

  return (
    <AdminLayout userEmail={user.email || ""} onSignOut={handleSignOut}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/candidates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{candidate.name}</h1>
            <p className="text-muted-foreground mt-1">{candidate.position}</p>
          </div>
        </div>

        <CandidateDetailView
          candidate={candidate}
          responses={responses || []}
          pageViews={pageViews || []}
          notes={notes || []}
          userEmail={user.email || ""}
        />
      </div>
    </AdminLayout>
  )
}
