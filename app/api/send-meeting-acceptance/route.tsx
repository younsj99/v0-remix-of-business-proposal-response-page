import { Resend } from "resend"
import { NextResponse } from "next/server"
import { isValidEmail, sanitizeHtml, sanitizeText, checkRateLimit } from "@/lib/validation"
import { createClient } from "@/lib/supabase/server"
import { sendSlackNotification } from "@/lib/slack"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    if (!checkRateLimit(`meeting-${ip}`, 3, 60000)) {
      return NextResponse.json({ error: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요." }, { status: 429 })
    }

    const body = await request.json()

    const name = sanitizeText(body.name, 100)
    const email = sanitizeText(body.email, 254)
    const contact = sanitizeText(body.contact, 20)
    const candidate_id = body.candidate_id

    if (!name || !email) {
      return NextResponse.json({ error: "이름과 이메일은 필수 입력 항목입니다." }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "올바른 이메일 주소를 입력해주세요." }, { status: 400 })
    }

    if (candidate_id) {
      const supabase = await createClient()

      await supabase.from("candidates").update({ status: "accepted" }).eq("id", candidate_id)

      await supabase.from("candidate_responses").insert({
        candidate_id,
        response_type: "accepted",
        response_data: { name, email, contact },
      })
    }

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "tutor@teamsparta.co",
      subject: "비즈니스 제안 - 인터뷰 수락",
      html: `
        <h2>새로운 인터뷰 수락이 접수되었습니다</h2>
        <p><strong>이름:</strong> ${sanitizeHtml(name)}</p>
        <p><strong>이메일:</strong> ${sanitizeHtml(email)}</p>
        <p><strong>연락처:</strong> ${contact ? sanitizeHtml(contact) : "미입력"}</p>
      `,
    })

    if (error) {
      return NextResponse.json({ error: "이메일 전송에 실패했습니다." }, { status: 500 })
    }

    await sendSlackNotification(`✅ 새로운 인터뷰 수락: ${name}`, [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*새로운 인터뷰 수락이 접수되었습니다*\n\n*이름:* ${name}\n*이메일:* ${email}\n*연락처:* ${contact || "미입력"}`,
        },
      },
    ])

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error sending meeting acceptance:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
