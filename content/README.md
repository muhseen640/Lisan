# Adding a new pack

Three steps — no changes anywhere else in the app:

1. **Create `content/<your-slug>.js`**, copying the shape of an existing
   pack (see `types.js` for the full field list). Give it a unique
   `id`/`slug`, an `icon` (pick one already defined in `lib/icons.js`,
   or add a new glyph there).

   - If it's `access: 'premium'`, also set `price` (a number, e.g.
     `4.99`) and `currency` (an ISO code, e.g. `'USD'`) — the price
     badge, pack-detail callout, and unlock modal all pick this up
     automatically. Then generate its unlock codes separately with
     `backend/generate-codes.js` and load them into the unlock-code
     API's database — see `backend/README.md`. Codes are never stored
     in this content file; the pack only needs to know its price.

   - Reusing an existing `category` (e.g. `'travel'`) groups it with
     those packs automatically.
   - Introducing a **new** category? Just set `category`, `categoryAr`,
     and `categoryEn` on the pack — the home screen's category grid
     picks up the new label and icon on its own, nothing to edit in
     `app.js`.

2. **Register it in `content/packs.js`**: import it and add it to the
   `ALL_PACKS` array. That one line is what makes it appear in the
   Learn tab, Home screen, Progress screen, and unlock flow — all of
   which already render any pack generically, so a new pack looks and
   behaves exactly like the built-in ones.

3. **List the new file in `sw.js`'s `SHELL_FILES`** and bump
   `CACHE_NAME` (e.g. `v3` → `v4`) so the pack is cached for offline
   use from the very first load, and so returning users pick up the
   change instead of a stale cached shell.

Set `status: 'draft'` while you're still writing a pack — it stays
invisible to learners until you flip it to `'published'`.
