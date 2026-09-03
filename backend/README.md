# Unlock-code API

Makes each unlock code redeemable by exactly one person. Requires a
[Cloudflare account](https://dash.cloudflare.com) (free tier is enough)
and the `wrangler` CLI.

## 1. Install wrangler & log in

```
npm install -g wrangler
wrangler login
```

## 2. Create the D1 database

```
cd backend
wrangler d1 create lisan-unlock-db
```

This prints a `database_id` — paste it into `wrangler.toml` in place of
`REPLACE_WITH_YOUR_D1_DATABASE_ID`.

## 3. Load the schema

```
wrangler d1 execute lisan-unlock-db --remote --file=./schema.sql
```

## 4. Deploy the Worker

```
wrangler deploy
```

This prints your Worker's URL, something like
`https://lisan-unlock-api.<your-subdomain>.workers.dev`.

## 5. Point the app at it

Open `../lib/unlockCode.js` and set `API_BASE` to that URL.

## 6. Generate codes for a pack

```
node generate-codes.js hotel-english 200 HOTEL
```

Writes `out/hotel-english-codes.csv` (one code per line — hand these
out, e.g. one per buyer/email) and `out/hotel-english-seed.sql`. Load
the codes into the live database:

```
wrangler d1 execute lisan-unlock-db --remote --file=./out/hotel-english-seed.sql
```

Repeat per pack (`packId` must match the pack's `id` in
`content/<pack>.js`). `out/` is where generated codes/CSVs land — treat
those files as sensitive (they're valid vouchers) and don't commit them.

## How the one-use guarantee works

- Every code is a row in `unlock_codes` with `redeemed_at` starting
  `NULL`.
- Redeeming runs `UPDATE ... WHERE code = ? AND redeemed_at IS NULL`.
  D1 serializes writes, so if two requests for the same code land at
  the same instant, only one `UPDATE` can actually change a row — the
  loser gets `alreadyUsed`, not a false success.
- The code itself never ships in the client bundle (unlike before), so
  there's nothing to read out of view-source and it can't be reused by
  someone else, since redemption is now checked server-side.
- The same device can re-validate its own already-redeemed code (e.g.
  reinstalling the app) without being blocked — only a *different*
  device attempting a code someone else already redeemed is rejected.

## Before going live

- In `worker.js`, change `ALLOWED_ORIGIN` from `'*'` to your deployed
  app's actual origin (e.g. `https://your-app.pages.dev`), so only your
  own front end can call the API. Then run `wrangler deploy` again —
  editing the file alone doesn't update the live Worker.
  For GitHub Pages specifically, the origin is your Pages **host**,
  not the repo path — `https://<username>.github.io`, not
  `https://<username>.github.io/<repo>/`.
- Never commit `backend/out/` to git (see `.gitignore`) — those CSV/SQL
  files are live, redeemable voucher codes. Anyone who reads them from
  a public repo can redeem your codes for free.
- Adjust `MAX_ATTEMPTS_PER_WINDOW` in `worker.js` if you want a
  stricter/looser brute-force guard.
