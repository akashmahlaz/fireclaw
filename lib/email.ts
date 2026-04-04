import { Resend } from "resend"

function getClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("Missing RESEND_API_KEY")
  return new Resend(apiKey)
}

const FROM = process.env.RESEND_FROM_EMAIL || "FireClaw <noreply@fireclaw.ai>"

export async function sendWelcomeEmail(to: string, name: string) {
  const resend = getClient()
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to FireClaw",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 800; color: #171717; margin-bottom: 16px;">
          Welcome to FireClaw, ${escapeHtml(name)}!
        </h1>
        <p style="font-size: 14px; color: #525252; line-height: 1.6;">
          You're all set to deploy AI agents on dedicated infrastructure.
          Head to your dashboard to get started.
        </p>
        <a href="${getBaseUrl()}/dashboard" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #171717; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
          Go to Dashboard
        </a>
      </div>
    `,
  })
}

export async function sendDeploySuccessEmail(
  to: string,
  agentName: string,
  domain: string,
) {
  const resend = getClient()
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Agent "${agentName}" is live!`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 800; color: #171717; margin-bottom: 16px;">
          Your agent is live 🚀
        </h1>
        <p style="font-size: 14px; color: #525252; line-height: 1.6;">
          <strong>${escapeHtml(agentName)}</strong> has been deployed and is now accessible at:
        </p>
        <a href="https://${escapeHtml(domain)}" style="display: inline-block; margin-top: 12px; font-size: 14px; color: #f97316; font-weight: 600;">
          https://${escapeHtml(domain)}
        </a>
        <a href="${getBaseUrl()}/dashboard/agents" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #171717; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
          View in Dashboard
        </a>
      </div>
    `,
  })
}

export async function sendDeployFailureEmail(
  to: string,
  agentName: string,
  errorMessage: string,
) {
  const resend = getClient()
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Agent "${agentName}" failed to deploy`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 800; color: #171717; margin-bottom: 16px;">
          Deployment failed
        </h1>
        <p style="font-size: 14px; color: #525252; line-height: 1.6;">
          <strong>${escapeHtml(agentName)}</strong> could not be deployed:
        </p>
        <div style="margin-top: 12px; padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; font-size: 13px; color: #991b1b; font-family: monospace;">
          ${escapeHtml(errorMessage)}
        </div>
        <p style="font-size: 14px; color: #525252; line-height: 1.6; margin-top: 16px;">
          You can retry from your dashboard or contact support.
        </p>
        <a href="${getBaseUrl()}/dashboard/agents" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #171717; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
          View in Dashboard
        </a>
      </div>
    `,
  })
}

export async function sendPaymentReceivedEmail(
  to: string,
  tier: string,
  amount: string,
) {
  const resend = getClient()
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Payment confirmed",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 800; color: #171717; margin-bottom: 16px;">
          Payment received
        </h1>
        <p style="font-size: 14px; color: #525252; line-height: 1.6;">
          We've received your payment of <strong>${escapeHtml(amount)}</strong> for the
          <strong>${escapeHtml(tier)}</strong> plan.
        </p>
        <a href="${getBaseUrl()}/dashboard/billing" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #171717; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
          View Billing
        </a>
      </div>
    `,
  })
}

export async function sendPaymentFailedEmail(to: string, tier: string) {
  const resend = getClient()
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Payment failed — action required",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 800; color: #ef4444; margin-bottom: 16px;">
          Payment failed
        </h1>
        <p style="font-size: 14px; color: #525252; line-height: 1.6;">
          We couldn't charge your payment method for the
          <strong>${escapeHtml(tier)}</strong> plan. Please update your payment method to keep your agents running.
        </p>
        <a href="${getBaseUrl()}/dashboard/billing" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #ef4444; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
          Update Payment Method
        </a>
      </div>
    `,
  })
}

function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
