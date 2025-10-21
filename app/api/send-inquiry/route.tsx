import { NextResponse } from "next/server"
import { Resend } from "resend"
import { isValidEmail, sanitizeHtml, sanitizeText, checkRateLimit } from "@/lib/validation"
import { createClient } from "@/lib/supabase/server"
import { sendSlackNotification } from "@/lib/slack"

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    if (!checkRateLimit(`inquiry-${ip}`, 3, 60000)) {
      return NextResponse.json(
        { success: false, error: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 },
      )
    }

    const body = await request.json()

    const email = sanitizeText(body.email, 254)
    const message = sanitizeText(body.message, 5000)
    const candidate_id = body.candidate_id

    if (!email || !message) {
      return NextResponse.json({ success: false, error: "이메일과 문의 내용을 모두 입력해주세요." }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "올바른 이메일 주소를 입력해주세요." }, { status: 400 })
    }

    if (message.length < 10) {
      return NextResponse.json({ success: false, error: "문의 내용을 10자 이상 입력해주세요." }, { status: 400 })
    }

    if (candidate_id) {
      const supabase = await createClient()

      await supabase.from("candidates").update({ status: "inquiry" }).eq("id", candidate_id)

      await supabase.from("candidate_responses").insert({
        candidate_id,
        response_type: "inquiry",
        response_data: { email, message },
      })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "tutor@teamsparta.co",
      replyTo: email,
      subject: "새로운 문의가 접수되었습니다",
      html: `
        <h2>새로운 문의가 접수되었습니다</h2>
        <p><strong>문의자 이메일:</strong> ${sanitizeHtml(email)}</p>
        <p><strong>문의 내용:</strong></p>
        <p>${sanitizeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
    })

    await sendSlackNotification(`💬 새로운 문의: ${email}`, [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*새로운 문의가 접수되었습니다*\n\n*문의자 이메일:* ${email}\n*문의 내용:*\n${message.substring(0, 200)}${message.length > 200 ? "..." : ""}`,
        },
      },
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { success: false, error: "이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    )
  }
}
