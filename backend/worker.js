/**
 * Lisan unlock-code API.
 *
 * One job: make each unlock code redeemable by exactly one person, ever.
 * The client (lib/unlockCode.js) no longer decides this on its own — it
 * asks this Worker, which is the single source of truth backed by D1.
 * A code embedded in the client bundle can be read by anyone; a code
 * that only exists as a row in a database the client can't reach can't
 * be forged, and the atomic UPDATE below is what stops two people (or
 * two tabs) from redeeming the same code in a race.
 *
 * Deploy: see backend/README.md. Requires one binding:
 *   - DB   → D1 database created from schema.sql
 */

const ALLOWED_ORIGIN = 'https://muhseen640.github.io'; // GitHub Pages origin — host only, no /Lisan/ path, no trailing slash
const MAX_ATTEMPTS_PER_WINDOW = 20; // per IP, per RATE_WINDOW_MIN — generous, just an abuse guard
const RATE_WINDOW_MIN = 10;

function cors(resp) {
  resp.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  resp.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  resp.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return resp;
}
function json(body, status = 200) {
  return cors(new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  }));
}

async function withinRateLimit(db, ip) {
  await db.prepare('INSERT INTO attempt_log (ip) VALUES (?)').bind(ip).run();
  const { count } = await db
    .prepare(
      `SELECT COUNT(*) as count FROM attempt_log
       WHERE ip = ? AND ts >= datetime('now', ?)`
    )
    .bind(ip, `-${RATE_WINDOW_MIN} minutes`)
    .first();
  return count <= MAX_ATTEMPTS_PER_WINDOW;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }));
    const url = new URL(request.url);

    if (url.pathname === '/api/validate-code' && request.method === 'POST') {
      return handleValidate(request, env);
    }
    return json({ ok: false, reasonKey: 'notFound' }, 404);
  },
};

async function handleValidate(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, reasonKey: 'badRequest' }, 400);
  }

  const code = String(body.code || '').trim().toUpperCase();
  const packId = String(body.packId || '').trim();
  const deviceId = String(body.deviceId || '').trim().slice(0, 128);

  if (!packId) return json({ ok: false, reasonKey: 'packMissing' }, 400);
  if (!code) return json({ ok: false, reasonKey: 'enterCode' }, 400);
  if (!deviceId) return json({ ok: false, reasonKey: 'badRequest' }, 400);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const ok = await withinRateLimit(env.DB, ip).catch(() => true); // fail open on limiter errors
  if (!ok) return json({ ok: false, reasonKey: 'tooManyAttempts' }, 429);

  const row = await env.DB
    .prepare('SELECT code, pack_id, redeemed_at, redeemed_device FROM unlock_codes WHERE code = ?')
    .bind(code)
    .first();

  if (!row) return json({ ok: false, reasonKey: 'invalidCode' }, 404);
  if (row.pack_id !== packId) return json({ ok: false, reasonKey: 'invalidCode' }, 404);

  if (row.redeemed_at) {
    // Same device redeeming again (reinstall, second visit) is fine —
    // it's the same owner. A different device is the case we exist to stop.
    if (row.redeemed_device === deviceId) return json({ ok: true });
    return json({ ok: false, reasonKey: 'alreadyUsed' }, 409);
  }

  // The WHERE redeemed_at IS NULL clause is the whole mechanism: if two
  // requests for the same code arrive at once, only one UPDATE can win
  // (D1 serializes writes), so only one gets meta.changes === 1.
  const result = await env.DB
    .prepare(
      `UPDATE unlock_codes
       SET redeemed_at = datetime('now'), redeemed_device = ?
       WHERE code = ? AND redeemed_at IS NULL`
    )
    .bind(deviceId, code)
    .run();

  if (result.meta.changes === 1) return json({ ok: true });
  // Someone else's request won the race in between our SELECT and UPDATE.
  return json({ ok: false, reasonKey: 'alreadyUsed' }, 409);
}
