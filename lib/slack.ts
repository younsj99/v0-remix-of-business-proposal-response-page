export async function sendSlackNotification(message: string, blocks?: any[]) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL is not configured. Skipping Slack notification.")
    return { success: false, error: "Slack webhook not configured" }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
        blocks: blocks || undefined,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Slack API error:", errorText)
      return { success: false, error: errorText }
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending Slack notification:", error)
    return { success: false, error: String(error) }
  }
}
