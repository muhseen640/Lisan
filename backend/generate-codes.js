#!/usr/bin/env node
/**
 * Generates a batch of unique, hard-to-guess unlock codes for a pack and
 * writes:
 *   - backend/out/<packId>-codes.csv   one code per line, for handing out
 *     (e.g. emailing one to each buyer, or loading into your storefront)
 *   - backend/out/<packId>-seed.sql    INSERT statements to load them
 *     into D1 with `wrangler d1 execute lisan-unlock-db --file=...`
 *
 * Usage:
 *   node generate-codes.js <packId> <count> [prefix]
 *   node generate-codes.js hotel-english 200 HOTEL
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const [, , packId, countArg, prefixArg] = process.argv;
if (!packId || !countArg) {
  console.error('Usage: node generate-codes.js <packId> <count> [prefix]');
  process.exit(1);
}
const count = parseInt(countArg, 10);
const prefix = (prefixArg || packId.split('-')[0]).toUpperCase();

// Crockford-ish alphabet: no 0/O or 1/I/L, so a human reading a code
// aloud or retyping it from an email can't confuse similar characters.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function randomCode(len = 10) {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  // e.g. HOTEL-7K2M9-QX4RP
  return `${prefix}-${out.slice(0, 5)}-${out.slice(5, 10)}`;
}

const codes = new Set();
while (codes.size < count) codes.add(randomCode());

const outDir = path.join(__dirname, 'out');
fs.mkdirSync(outDir, { recursive: true });

const csvPath = path.join(outDir, `${packId}-codes.csv`);
fs.writeFileSync(csvPath, [...codes].join('\n') + '\n');

const esc = s => s.replace(/'/g, "''");
const sqlPath = path.join(outDir, `${packId}-seed.sql`);
const inserts = [...codes]
  .map(c => `INSERT INTO unlock_codes (code, pack_id) VALUES ('${esc(c)}', '${esc(packId)}');`)
  .join('\n');
fs.writeFileSync(sqlPath, inserts + '\n');

console.log(`Generated ${count} codes for "${packId}"`);
console.log(`  ${csvPath}`);
console.log(`  ${sqlPath}`);
console.log('\nLoad into D1 with:');
console.log(`  wrangler d1 execute lisan-unlock-db --remote --file=./out/${packId}-seed.sql`);
