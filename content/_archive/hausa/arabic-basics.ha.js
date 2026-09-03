/**
 * Hausa content for the "arabic-basics" pack.
 *
 * This is the file to open for editing Hausa text — it's just flat
 * id -> text, deliberately kept separate from the pack's main content
 * file (content/arabic-basics.js) so editing here never risks touching the
 * Arabic/English sentence data, ids, or quiz structure.
 *
 * sentences: lesson id -> the Hausa translation of the sentence itself
 *            (shown as a third line under the sentence, below the
 *            English translation, with no listen button — matches
 *            explainAr/explainEn's "en" text in content/arabic-basics.js)
 * lessons:   lesson id -> the Hausa usage NOTE (the explanation shown
 *            in the explain box, matches explainAr/explainEn)
 * quizzes:   quiz id -> { question, explain } — Hausa quiz text
 *
 * To add/change a translation: find the id below (it matches the id in
 * content/arabic-basics.js) and edit the text. Nothing else needs to change —
 * content/packs.js merges this file onto the pack automatically.
 */
export const sentences = {
  'bas-01': 'Ina son sayan sabon littafi.',
  'bas-02': 'Ina asibiti mafi kusa?',
  'bas-03': 'Yaya kake a yau?',
  'bas-04': 'Me kake yi a lokacin hutunka?',
  'bas-05': 'Ina kantin magani mafi kusa?',
  'bas-06': 'Ina koyon Turanci kowace rana.',
  'bas-07': 'Za ka iya taimaka mini don Allah?',
  'bas-08': 'Yanayin iska yana da kyau sosai wannan safiya.',
  'bas-09': 'Ina son ajiye tebur don mutane biyu.',
  'bas-10': 'Nawa ne wannan agogo?',
  'bas-11': 'Na gode sosai kan taimakonka.',
  'bas-12': 'Zan yi tafiya zuwa Alkahira mako mai zuwa.',
  'bas-13': 'Ina son karanta littattafai a laburare.',
  'bas-14': 'Kana jin Turanci?',
  'bas-15': 'Karin kumallo ya shirya a kan tebur.',
  'bas-16': 'Ina kwana! Yaya kake a yau?',
  'bas-17': 'Lafiya lau, na gode.',
  'bas-18': 'Na yi murnar haduwa da kai!',
  'bas-19': 'Ranarka ta yi kyau!',
  'bas-20': 'Yaya sunanka?',
  'bas-21': 'Sunana Alex.',
  'bas-22': 'Daga ina kake?',
  'bas-23': 'Ina zaune a wani babban birni.',
  'bas-24': 'Ni dalibi ne.',
};

export const lessons = {
  'bas-01': 'Ana amfani da ita idan kana son sayan wani abu na musamman, kamar littafi.',
  'bas-02': 'Ana amfani da ita don neman hanya zuwa asibiti mafi kusa a lokacin gaggawa.',
  'bas-03': 'Hanya ce ta abokantaka don tambayar yadda wani yake.',
  'bas-04': 'Tambaya ce ta zance mai sauƙi da ake yi don ƙarin sanin wani.',
  'bas-05': 'Ana amfani da ita don tambayar inda za a sami kantin magani kusa.',
  'bas-06': 'Ana amfani da ita don bayyana wata ɗabi\'a ko aiki na yau da kullum.',
  'bas-07': 'Hanya ce ta ladabi don neman wani ya taimake ka.',
  'bas-08': 'Kalma ce ta buɗe zance mai sauƙi game da yanayin iska.',
  'bas-09': 'Ana amfani da ita lokacin kiran gidan abinci ko isowa a can don ajiye tebur.',
  'bas-10': 'Ana amfani da ita don tambayar farashin wani abu yayin sayayya.',
  'bas-11': 'Hanya ce mai dumi don gode wa wani da ya taimake ka.',
  'bas-12': 'Ana amfani da ita don magana game da shirin tafiya na gaba.',
  'bas-13': 'Ana amfani da ita don magana game da wani sha\'awa da kake morewa.',
  'bas-14': 'Tambaya ce mai amfani idan ba ka tabbata da irin harshen da za a yi amfani da shi ba.',
  'bas-15': 'Ana amfani da ita a gida don sanar da wani cewa abinci ya shirya.',
  'bas-16': 'Gaisuwar safiya ce ta abokantaka don fara zance.',
  'bas-17': 'Ita ce amsar ladabi ta yau da kullum ga tambayar \'yaya kake\'.',
  'bas-18': 'Ana faɗarta lokacin haduwa da wani a karo na farko.',
  'bas-19': 'Hanya ce ta abokantaka don yin ban kwana.',
  'bas-20': 'Ana amfani da ita don tambayar sunan wani a karo na farko da ka same shi.',
  'bas-21': 'Ana amfani da ita don gabatar da kanka da suna.',
  'bas-22': 'Tambaya ce da ake yawan yi lokacin sanin sabon mutum.',
  'bas-23': 'Ana amfani da ita don bayyana inda kake zama.',
  'bas-24': 'Ana amfani da ita don bayyana sana\'arka ko matsayinka.',
};

export const quizzes = {
  'q-bas-01': { question: 'Yaya za a ce "How are you today?" a Larabci?', explain: '"How are you today?" na nufin "كَيْفَ حَالُكَ الْيَوْمَ؟" a Larabci.' },
  'q-bas-02': { question: 'Yaya za a ce "I learn English every day." a Larabci?', explain: '"I learn English every day." na nufin "أَنَا أَتَعَلَّمُ اللُّغَةَ الْإِنْجِلِيزِيَّةَ كُلَّ يَوْمٍ." a Larabci.' },
  'q-bas-03': { question: 'Yaya za a ce "I want to book a table for two people." a Larabci?', explain: '"I want to book a table for two people." na nufin "أُرِيدُ حَجْزَ طَاوِلَةٍ لِشَخْصَيْنِ." a Larabci.' },
  'q-bas-04': { question: 'Yaya za a ce "I will travel to Cairo next week." a Larabci?', explain: '"I will travel to Cairo next week." na nufin "سَأَسَافِرُ إِلَى الْقَاهِرَةِ الأُسْبُوعَ القَادِمَ." a Larabci.' },
  'q-bas-05': { question: 'Yaya za a ce "Breakfast is ready on the table." a Larabci?', explain: '"Breakfast is ready on the table." na nufin "الإِفْطَارُ جَاهِزٌ عَلَى الطَّاوِلَةِ." a Larabci.' },
  'q-bas-06': { question: 'Yaya za a ce "Nice to meet you!" a Larabci?', explain: '"Nice to meet you!" na nufin "سَعِيدٌ بِلِقَائِكَ!" a Larabci.' },
  'q-bas-07': { question: 'Yaya za a ce "My name is Alex." a Larabci?', explain: '"My name is Alex." na nufin "اسْمِي أَلِكْس." a Larabci.' },
  'q-bas-08': { question: 'Yaya za a ce "I am a student." a Larabci?', explain: '"I am a student." na nufin "أَنَا طَالِبٌ." a Larabci.' },
};
