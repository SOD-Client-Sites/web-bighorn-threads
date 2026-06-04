// Bighorn Threads — shared Cloudflare Turnstile verification helper.
// Guarded by TURNSTILE_SECRET: if the secret is unset (e.g. before it's
// configured in the Pages project), verification is skipped so the live
// forms keep working. Once the secret is set, every protected endpoint
// rejects submissions that fail the challenge.

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

// Returns true when the request passes (or when verification is disabled).
// Returns false only when the secret is configured AND the token fails.
export async function verifyTurnstile({ env, request, token }) {
  if (!env || !env.TURNSTILE_SECRET) return true // not configured -> skip

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
