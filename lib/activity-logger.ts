import { createClient } from "@/lib/supabase/client"

export type ActivityAction =
  | "candidate_created"
  | "candidate_updated"
  | "candidate_deleted"
  | "candidate_viewed"
  | "page_sent"
  | "page_viewed"
  | "response_received"
  | "note_added"
  | "status_changed"

interface LogActivityParams {
  candidateId?: string
  actionType: ActivityAction
  actionDescription: string
  performedBy: string
  metadata?: Record<string, any>
}

export async function logActivity({
  candidateId,
  actionType,
  actionDescription,
  performedBy,
  metadata,
}: LogActivityParams) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("activity_log").insert({
      candidate_id: candidateId || null,
      action_type: actionType,
      action_description: actionDescription,
      performed_by: performedBy,
      metadata: metadata || null,
    })

    if (error) {
      console.error("[v0] Failed to log activity:", error)
    }
  } catch (error) {
    console.error("[v0] Error logging activity:", error)
  }
}
