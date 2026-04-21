const SAGE_ENDPOINT = 'https://www.promoplace.com/ws/ws.dll/ConnectAPI'

const SUPPLIER_FIELDS = ['supplier', 'suppId', 'net', 'catPriceCode', 'supplierId']

export function publicizeProduct(product) {
  if (!product || typeof product !== 'object') return product
  const out = { ...product }
  for (const f of SUPPLIER_FIELDS) delete out[f]
  if (Array.isArray(out.options)) {
    out.options = out.options.map(({ priceCode: _pc, ...rest }) => rest)
  }
  return out
}

export function resolveAuth(env, kind = 'public') {
  const acctId = Number(env.SAGE_ACCT_ID || 266315)
  if (kind === 'admin') {
    return {
      acctId,
      loginId: String(env.SAGE_CONNECT_ADMIN_LOGIN || ''),
      key: String(env.SAGE_CONNECT_ADMIN_KEY || ''),
    }
  }
  return {
    acctId,
    loginId: '',
    key: String(env.SAGE_CONNECT_AUTH_KEY || ''),
  }
}

// Expected top-level keys per serviceId we call. If SAGE renames/removes one,
// we log a warning (CF Pages Functions surface console output) so we notice
// breaking schema changes before the UI silently renders empty.
const EXPECTED_KEYS = {
  101: ['ok', 'categories'],
  103: ['ok', 'products'],
  104: ['ok', 'product'],
}

function checkSchema(serviceId, data) {
  const expected = EXPECTED_KEYS[serviceId]
  if (!expected) return
  const missing = expected.filter((k) => !(k in data))
  if (missing.length) {
    console.warn(`[sage-schema-drift] service=${serviceId} missing keys: ${missing.join(',')} | got keys: ${Object.keys(data).join(',')}`)
  }
}

export async function sagePost(serviceId, payload, auth, ref) {
  if (!auth.key) throw new Error('Missing SAGE auth key')
  const body = {
    serviceId,
    apiVer: 130,
    auth: { acctId: auth.acctId, loginId: auth.loginId, key: auth.key },
    ref,
    ...payload,
  }
  const res = await fetch(SAGE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`SAGE ${serviceId} HTTP ${res.status}`)
  const data = await res.json()
  if (!data.ok && data.errNum) {
    throw new Error(`SAGE ${serviceId} err ${data.errNum}: ${data.errMsg}`)
  }
  checkSchema(serviceId, data)
  return data
}

export function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60, s-maxage=300',
    },
  })
}

export function errorResponse(message, status = 500) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}
