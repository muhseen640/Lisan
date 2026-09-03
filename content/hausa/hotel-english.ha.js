/**
 * Hausa content for the "hotel-english" pack.
 *
 * This is the file to open for editing Hausa text — it's just flat
 * id -> text, deliberately kept separate from the pack's main content
 * file (content/hotel-english.js) so editing here never risks touching the
 * Arabic/English sentence data, ids, or quiz structure.
 *
 * sentences: lesson id -> the Hausa translation of the sentence itself
 *            (shown as a third line under the sentence, below the
 *            English translation, with no listen button — matches
 *            explainAr/explainEn's "en" text in content/hotel-english.js)
 * lessons:   lesson id -> the Hausa usage NOTE (the explanation shown
 *            in the explain box, matches explainAr/explainEn)
 * quizzes:   quiz id -> { question, explain } — Hausa quiz text
 *
 * To add/change a translation: find the id below (it matches the id in
 * content/hotel-english.js) and edit the text. Nothing else needs to change —
 * content/packs.js merges this file onto the pack automatically.
 */
export const sentences = {
  'hot-01': 'Ina da ajiya a ƙarƙashin suna...',
  'hot-02': 'Da ƙarfe nawa ake barin ɗaki?',
  'hot-03': 'Akwai intanet kyauta?',
  'hot-04': 'Zan iya samun ƙarin tawul?',
  'hot-05': 'Na\'urar sanyaya iska ba ta aiki.',
};

export const lessons = {
  'hot-01': 'Ana amfani da ita a lokacin rijista don gaya wa ma\'aikacin tebur sunan da aka yi ajiyar ɗakinka da shi.',
  'hot-02': 'Ana amfani da ita don tambaya lokacin da ya kamata ka bar ɗakin.',
  'hot-03': 'Tambaya ce da ake yawan yi lokacin isowa a kowane otal.',
  'hot-04': 'Ana amfani da ita don neman ƙarin kayayyaki daga hidimar ɗaki.',
  'hot-05': 'Ana amfani da ita don ba da rahoton matsala da ɗakin.',
};

export const quizzes = {
  'q-hot-02': { question: 'Yaya za a ce "What time is checkout?" a Larabci?', explain: '"What time is checkout?" na nufin "في أي وقت يجب أن أغادر الغرفة؟" a Larabci.' },
  'q-hot-04': { question: 'Yaya za a ce "Can I get an extra towel?" a Larabci?', explain: '"Can I get an extra towel?" na nufin "هل يمكنني الحصول على منشفة إضافية؟" a Larabci.' },
};
