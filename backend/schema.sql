-- Each row is one voucher, good for exactly one redemption.
-- redeemed_at stays NULL until the first successful validate-code call;
-- the Worker's UPDATE ... WHERE redeemed_at IS NULL is what makes
-- redemption atomic, so two simultaneous requests for the same code
-- can't both succeed.
CREATE TABLE IF NOT EXISTS unlock_codes (
  code            TEXT PRIMARY KEY,
  pack_id         TEXT NOT NULL,
  redeemed_at     TEXT,              -- ISO timestamp, NULL until used
  redeemed_device TEXT,              -- device id that redeemed it (see lib/device.js)
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_unlock_codes_pack_id ON unlock_codes(pack_id);

-- Rough brute-force guard: log every attempt, throttle by IP. Codes are
-- long random strings so guessing is already impractical, but this
-- costs nothing and closes the door further.
CREATE TABLE IF NOT EXISTS attempt_log (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  ip        TEXT NOT NULL,
  ts        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_attempt_log_ip_ts ON attempt_log(ip, ts);
