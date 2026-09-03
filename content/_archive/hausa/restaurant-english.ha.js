/**
 * Hausa content for the "restaurant-english" pack.
 *
 * This is the file to open for editing Hausa text — it's just flat
 * id -> text, deliberately kept separate from the pack's main content
 * file (content/restaurant-english.js) so editing here never risks touching the
 * Arabic/English sentence data, ids, or quiz structure.
 *
 * sentences: lesson id -> the Hausa translation of the sentence itself
 *            (shown as a third line under the sentence, below the
 *            English translation, with no listen button — matches
 *            explainAr/explainEn's "en" text in content/restaurant-english.js)
 * lessons:   lesson id -> the Hausa usage NOTE (the explanation shown
 *            in the explain box, matches explainAr/explainEn)
 * quizzes:   quiz id -> { question, explain } — Hausa quiz text
 *
 * To add/change a translation: find the id below (it matches the id in
 * content/restaurant-english.js) and edit the text. Nothing else needs to change —
 * content/packs.js merges this file onto the pack automatically.
 */
export const sentences = {
  'res-01': 'Kuna da tebur don mutane biyu?',
  'res-02': 'Zan iya ganin jerin abinci, don Allah?',
  'res-03': 'Me kuke ba da shawara?',
  'res-04': 'Lissafin kuɗi, don Allah.',
  'res-05': 'Wannan abincin yana da daɗi.',
};

export const lessons = {
  'res-01': 'Ana amfani da ita lokacin isowa gidan abinci don tambaya game da tebur.',
  'res-02': 'Ana amfani da ita don neman mai hidima jerin abinci.',
  'res-03': 'Ana amfani da ita don tambayar ra\'ayin mai hidima game da abinci mafi kyau.',
  'res-04': 'Ana amfani da ita don neman lissafin kuɗi bayan cin abinci.',
  'res-05': 'Ana amfani da ita don bayyana cewa kana son abincin.',
};

export const quizzes = {
  'q-res-02': { question: 'Yaya za a ce "Can I see the menu, please?" a Larabci?', explain: '"Can I see the menu, please?" na nufin "هل يمكنني رؤية قائمة الطعام؟" a Larabci.' },
  'q-res-04': { question: 'Yaya za a ce "The check, please." a Larabci?', explain: '"The check, please." na nufin "الحساب من فضلك." a Larabci.' },
};
