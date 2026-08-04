// Bighorn Threads — shared Cloudflare Turnstile verification helper.
// Every protected endpoint must have TURNSTILE_SECRET configured. Missing
// configuration fails closed so a deployment mistake cannot silently disable
// bot verification.

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

// Returns true only when Cloudflare confirms the challenge. Missing
// configuration, a missing token, verification failure, or an outage all fail.
export async function verifyTurnstile({ env, request, token }) {
  if (!env?.TURNSTILE_SECRET || !token) return false

  const response = token ? String(token) : ''
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET,
        response,
        remoteip: request?.headers?.get('CF-Connecting-IP') || undefined,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    const data = await res.json()
    return data && data.success === true
  } catch (_) {
    return false
  }
}
