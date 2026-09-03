import { getPackBySlug } from '../content/packs.js';
import { getDeviceId } from './store.js';

/**
 * Codes are no longer checked against anything shipped in the client
 * bundle — there is no valid code embedded in this app anymore, so
 * view-source reveals nothing redeemable. Every code lives only in the
 * backend's database (see ../backend/) and is redeemable exactly once;
 * this file just calls that API and translates its response.
 *
 * Set API_BASE to your deployed Worker's URL (see ../backend/README.md).
 */
const API_BASE = 'https://lisan-unlock-api.isahabdullah640.workers.dev';

/**
 * validateCode(code, packId) -> Promise<{ ok: boolean, reasonKey?: string }>
 *
 * reasonKey maps to lib/i18n.js so the message renders in whichever UI
 * language is currently active.
 */
export async function validateCode(rawCode, packId) {
  const code = (rawCode || '').trim().toUpperCase();
  const pack = getPackBySlug(packId);

  if (!pack) return { ok: false, reasonKey: 'packMissing' };
  if (pack.access === 'free') return { ok: true };
  if (!code) return { ok: false, reasonKey: 'enterCode' };

  let res;
  try {
    res = await fetch(`${API_BASE}/api/validate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, packId, deviceId: getDeviceId() }),
    });
  } catch (err) {
    // Offline, DNS failure, API not yet deployed, etc. — distinct from
    // "wrong code" so the learner isn't told their code is invalid when
    // it's really just that we couldn't reach the server.
    return { ok: false, reasonKey: 'networkError' };
  }

  let data;
  try {
    data = await res.json();
  } catch {
    return { ok: false, reasonKey: 'networkError' };
  }

  if (data.ok) return { ok: true };
  return { ok: false, reasonKey: data.reasonKey || 'invalidCode' };
}
