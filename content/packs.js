import { arabicBasics } from './arabic-basics.js';
import { hotelEnglish } from './hotel-english.js';
import { dialoguesRestaurant } from './dialogues-restaurant.js';
import { dialoguesSchool } from './dialogues-school.js';

import * as haBasics from './hausa/arabic-basics.ha.js';
import * as haHotel from './hausa/hotel-english.ha.js';

/**
 * Attaches Hausa text from a content/hausa/<slug>.ha.js file onto a
 * pack's lessons/quizzes in place:
 *   - lesson.ha         the Hausa translation of the sentence itself
 *                        (ha.sentences) — shown as a third line under
 *                        the sentence, below the English translation
 *   - lesson.explainHa   the Hausa usage note (ha.lessons)
 *   - quiz.questionHa / quiz.explainHa   Hausa quiz text (ha.quizzes)
 *
 * Keeping Hausa text in its own file (see content/hausa/README.md)
 * means editing a translation never means touching this file, the
 * pack's main content file, ids, or any other field — just the one
 * line for that id.
 *
 * A lesson/quiz with no matching Hausa entry simply has no lesson.ha/
 * explainHa/questionHa (undefined) — app.js falls back gracefully
 * (hides the Hausa line, or shows English) rather than breaking, so a
 * pack can have partial Hausa coverage while translations are still
 * being added.
 */
function attachHausa(pack, ha) {
  for (const lesson of pack.lessons) {
    if (ha.sentences && ha.sentences[lesson.id]) lesson.ha = ha.sentences[lesson.id];
    if (ha.lessons && ha.lessons[lesson.id]) lesson.explainHa = ha.lessons[lesson.id];
  }
  for (const quiz of pack.quizzes) {
    const entry = ha.quizzes && ha.quizzes[quiz.id];
    if (entry) {
      quiz.questionHa = entry.question;
      quiz.explainHa = entry.explain;
    }
  }
  return pack;
}

attachHausa(arabicBasics, haBasics);
attachHausa(hotelEnglish, haHotel);

/**
 * Publishing a new monthly pack = write a content/<slug>.js file in the
 * same shape (see types.js) and add one line here. No UI, router, DB
 * schema, or component needs to change. If the pack introduces a brand
 * new `category`, also give it `categoryAr`/`categoryEn` labels — the
 * home screen's category grid picks those up automatically, no other
 * file to touch. Remember to also list the new content/<slug>.js file
 * (and its content/hausa/<slug>.ha.js companion, once it has one) in
 * sw.js's SHELL_FILES (and bump CACHE_NAME) so it's available offline
 * from the very first load.
 * @type {import('./types.js').Pack[]}
 */
export const ALL_PACKS = [arabicBasics, hotelEnglish, dialoguesRestaurant, dialoguesSchool];

export function getPublishedPacks() {
  return ALL_PACKS.filter(p => p.status === 'published');
}
export function getPackBySlug(slug) {
  return ALL_PACKS.find(p => p.slug === slug) || null;
}
export function getNewestPack() {
  return [...getPublishedPacks()].sort((a, b) => b.releaseMonth.localeCompare(a.releaseMonth))[0] || null;
}
export function getCategories() {
  const seen = new Map();
  for (const p of getPublishedPacks()) {
    if (!seen.has(p.category)) {
      seen.set(p.category, { id: p.category, icon: p.icon, labelAr: p.categoryAr, labelEn: p.categoryEn, count: 0 });
    }
    seen.get(p.category).count++;
  }
  return [...seen.values()];
}
