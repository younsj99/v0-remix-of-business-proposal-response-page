import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CandidateOfferPage } from "@/components/candidate-offer-page"

interface PageProps {
  params: Promise<{
    token: string
  }>
}

export default async function OfferPage({ params }: PageProps) {
  const { token } = await params
  const supabase = await createClient()

  // Fetch candidate data by unique token
  const { data: candidate, error } = await supabase.from("candidates").select("*").eq("unique_token", token).single()

  if (error || !candidate) {
    redirect("/404")
  }

  // Track page view
  const { data: existingView } = await supabase
    .from("candidate_page_views")
    .select("id")
    .eq("candidate_id", candidate.id)
    .single()

  // Only insert if this is the first view
  if (!existingView) {
    await supabase.from("candidate_page_views").insert({
      candidate_id: candidate.id,
      viewed_at: new Date().toISOString(),
    })

    // Update candidate status to 'viewed' if currently 'sent' or 'created'
    if (candidate.status === "sent" || candidate.status === "created") {
      await supabase.from("candidates").update({ status: "viewed" }).eq("id", candidate.id)
    }
  }

  return <CandidateOfferPage candidate={candidate} />
}
