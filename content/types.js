/**
 * Shared content shapes. Plain JSDoc (no build step / TypeScript compiler
 * needed) so packs stay simple JSON-like modules a non-engineer content
 * editor could eventually fill in via a future admin UI.
 *
 * @typedef {Object} Lesson
 * @property {string} id
 * @property {string} ar          Arabic sentence — the target language being learned
 * @property {string} en          English sentence — the learner's native-language meaning
 * @property {string} [ha]        Hausa translation of the sentence itself — attached
 *                                 from content/hausa/<slug>.ha.js (see
 *                                 content/hausa/README.md); shown as a third line
 *                                 under the sentence, below the English translation,
 *                                 with no listen button. Absent if not yet translated.
 * @property {string} explainAr   Short usage note, in Arabic
 * @property {string} explainEn   Short usage note, in English
 * @property {string} [explainHa] Short usage note, in Hausa — attached
 *                                 from content/hausa/<slug>.ha.js, not
 *                                 authored inline in the pack file (see
 *                                 content/hausa/README.md); absent if no
 *                                 Hausa translation exists yet for this id
 * @property {string} [arAudio]   Optional path to a recorded mp3 of the
 *                                 Arabic sentence. When present, Listen/
 *                                 Slow play this instead of synthesized
 *                                 speech (falling back to it if the file
 *                                 fails to load).
 * @property {string} [enAudio]   Same as arAudio, for the English sentence.
 *
 * @typedef {Object} DialogueTurn
 * @property {'them'|'you'} speaker  'them' auto-plays; 'you' prompts the
 *                                    learner to tap the mic and speak it.
 * @property {string} ar
 * @property {string} en
 * @property {string} audio        Path to a recorded mp3 of this turn.
 *                                  Required for both speakers — 'them'
 *                                  audio plays during practice AND the
 *                                  full listen-through; 'you' audio is
 *                                  used for the listen-through and as
 *                                  the answer reveal after a missed retry.
 *
 * @typedef {Object} Dialogue
 * A dialogue is a Lesson-shaped entry (same id/completion tracking,
 * same pack.lessons array) but with `turns` instead of ar/en/explain —
 * app.js checks for `.turns` to route to the dialogue screen instead
 * of the regular sentence-practice screen. No quiz follows a dialogue;
 * each 'you' turn is scored individually as it's answered (see
 * lib/store.js#recordQuizResult), so completing all turns is worth the
 * same number of marks as the dialogue has 'you' lines.
 * @property {string} id
 * @property {string} titleAr
 * @property {string} titleEn
 * @property {DialogueTurn[]} turns
 *
 * @typedef {Object} QuizOption
 * @property {string} ar
 * @property {string} en
 * @property {boolean} correct
 *
 * @typedef {Object} Quiz
 * @property {string} id
 * @property {string} lessonId    Lesson this quiz follows
 * @property {string} questionAr
 * @property {string} questionEn
 * @property {string} [questionHa] Hausa version, see Lesson.explainHa
 * @property {QuizOption[]} options
 * @property {string} explainAr
 * @property {string} explainEn
 * @property {string} [explainHa] Hausa version, see Lesson.explainHa
 *
 * @typedef {Object} Pack
 * @property {string} id
 * @property {string} slug
 * @property {string} icon
 * @property {string} titleAr
 * @property {string} titleEn
 * @property {string} descAr
 * @property {string} descEn
 * @property {string} category      stable id used to group packs, e.g. "travel"
 * @property {string} categoryAr    Arabic label shown for this category
 * @property {string} categoryEn    English label shown for this category
 * @property {string} releaseMonth   e.g. "2026-08"
 * @property {'free'|'premium'} access
 * @property {number} [price]      Unlock price, shown to the user (e.g. 4.99).
 *                                  Only meaningful when access is 'premium' —
 *                                  free packs should omit it.
 * @property {string} [currency]   ISO 4217 currency code for `price`, e.g.
 *                                  'NGN'. Defaults to 'NGN' if `price` is set
 *                                  but this is omitted.
 * @property {'beginner'|'elementary'|'intermediate'} difficulty
 * @property {'draft'|'published'|'archived'} status
 * @property {'phrasebook'|'dialogue'} [type]  Defaults to 'phrasebook' if
 *                                  omitted (all existing packs). A
 *                                  'dialogue' pack's `lessons` array holds
 *                                  Dialogue entries instead of Lessons —
 *                                  everything else (progress, XP, badges,
 *                                  unlock/price) works identically either
 *                                  way since it's all keyed off `lessons`.
 * @property {string} [themLabelAr]  Only for 'dialogue' packs — what to
 *                                  call the 'them' role in the "practice
 *                                  as" role picker (e.g. "Waiter"). Falls
 *                                  back to a generic "Person 1"/"Person 2"
 *                                  label if omitted.
 * @property {string} [themLabelEn]
 * @property {string} [youLabelAr]  Same, for the 'you' role (e.g. "Customer").
 * @property {string} [youLabelEn]
 * @property {Lesson[]|Dialogue[]} lessons
 * @property {Quiz[]} quizzes      Always [] for a 'dialogue' pack — turns
 *                                  are scored individually, not via a
 *                                  separate quiz step.
 */
export {};
