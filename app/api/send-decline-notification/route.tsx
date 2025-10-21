import { NextResponse } from "next/server"
import { isValidEmail, sanitizeHtml, sanitizeText, checkRateLimit } from "@/lib/validation"
import { createClient } from "@/lib/supabase/server"
import { sendSlackNotification } from "@/lib/slack"

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    if (!checkRateLimit(`decline-${ip}`, 5, 60000)) {
      return NextResponse.json({ error: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요." }, { status: 429 })
    }

    const body = await request.json()

    const candidate_id = body.candidate_id
    const allowContact = Boolean(body.allowContact)
    const name = body.name ? sanitizeText(body.name, 100) : ""
    const email = body.email ? sanitizeText(body.email, 254) : ""
    const phone = body.phone ? sanitizeText(body.phone, 20) : ""

    if (allowContact && email && !isValidEmail(email)) {
      return NextResponse.json({ error: "올바른 이메일 주소를 입력해주세요." }, { status: 400 })
    }

    if (candidate_id) {
      const supabase = await createClient()

      await supabase.from("candidates").update({ status: "declined" }).eq("id", candidate_id)

      await supabase.from("candidate_responses").insert({
        candidate_id,
        response_type: allowContact ? "declined" : "declined_no_contact",
        response_data: allowContact ? { name, email, phone } : {},
      })
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: "tutor@teamsparta.co",
        subject: "제안 거절 알림",
        html: `
          <h2>제안이 거절되었습니다</h2>
          <p><strong>추후 연락 가능 여부:</strong> ${allowContact ? "연락주세요 ✅" : "괜찮아요 ❌"}</p>
          ${
            allowContact && email
              ? `
          <h3>연락처 정보</h3>
          ${name ? `<p><strong>이름:</strong> ${sanitizeHtml(name)}</p>` : ""}
          <p><strong>이메일:</strong> ${sanitizeHtml(email)}</p>
          ${phone ? `<p><strong>전화번호:</strong> ${sanitizeHtml(phone)}</p>` : ""}
          `
              : ""
          }
          <p>해당 사용자가 "아쉽지만 다음기회에" 버튼을 클릭했습니다.</p>
        `,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Resend API error:", errorData)
      return NextResponse.json({ error: "이메일 전송에 실패했습니다." }, { status: response.status })
    }

    const slackMessage = allowContact ? `❌ 제안 거절 (연락 희망): ${name || email}` : "❌ 제안 거절 (연락 불필요)"

    const slackBlocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: allowContact
            ? `*제안이 거절되었습니다 (연락 희망)*\n\n${name ? `*이름:* ${name}\n` : ""}*이메일:* ${email}\n${phone ? `*전화번호:* ${phone}` : ""}`
            : "*제안이 거절되었습니다*\n\n후보자가 추후 연락을 원하지 않습니다.",
        },
      },
    ]

    await sendSlackNotification(slackMessage, slackBlocks)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending decline notification:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
