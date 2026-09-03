/**
 * Hausa content for the "jobs-interview-english" pack.
 *
 * This is the file to open for editing Hausa text — it's just flat
 * id -> text, deliberately kept separate from the pack's main content
 * file (content/jobs-interview-english.js) so editing here never risks touching the
 * Arabic/English sentence data, ids, or quiz structure.
 *
 * sentences: lesson id -> the Hausa translation of the sentence itself
 *            (shown as a third line under the sentence, below the
 *            English translation, with no listen button — matches
 *            explainAr/explainEn's "en" text in content/jobs-interview-english.js)
 * lessons:   lesson id -> the Hausa usage NOTE (the explanation shown
 *            in the explain box, matches explainAr/explainEn)
 * quizzes:   quiz id -> { question, explain } — Hausa quiz text
 *
 * To add/change a translation: find the id below (it matches the id in
 * content/jobs-interview-english.js) and edit the text. Nothing else needs to change —
 * content/packs.js merges this file onto the pack automatically.
 */
export const sentences = {
  'job-01': 'Gaya mini game da kanka.',
  'job-02': 'Me ya sa kake son yin aiki a nan?',
  'job-03': 'Menene ƙarfinka?',
  'job-04': 'Menene raunin ka?',
  'job-05': 'Ina da shekaru biyar na ƙwarewa a wannan fanni.',
  'job-06': 'A ina kake ganin kanka bayan shekaru biyar?',
  'job-07': 'Me ya sa ka bar aikinka na baya?',
  'job-08': 'Menene tsammanin albashinka?',
  'job-09': 'Za ka iya aiki a ƙarƙashin matsi?',
  'job-10': 'Bayyana wata matsala da ka fuskanta a wurin aiki.',
  'job-11': 'Yaya kake magance suka?',
  'job-12': 'Kana da wata tambaya a gare ni?',
  'job-13': 'Na shirya in fara aiki nan take.',
  'job-14': 'Yaushe zan iya jira jin labari daga gare ku?',
  'job-15': 'Wannan matsayi ne na cikakken lokaci ko na wani lokaci?',
  'job-16': 'Menene ayyukan yau da kullum na wannan matsayin?',
  'job-17': 'Ni mai kyakkyawan haɗin kai ne da tawaga.',
  'job-18': 'Don Allah duba takardar aikina da aka haɗa.',
  'job-19': 'Na gode kan wannan dama.',
  'job-20': 'Ina fatan jin labari daga gare ku nan ba da jimawa ba.',
};

export const lessons = {
  'job-01': 'Ita ce tambaya ta farawa da aka fi samu a kowane hira ta aiki.',
  'job-02': 'Mai yin hirar yana yin wannan tambayar ne don sanin dalilin da ya sa ka nemi aiki a wannan kamfani musamman.',
  'job-03': 'Ana amfani da ita don tambaya game da manyan ƙwarewarka da halayenka masu kyau.',
  'job-04': 'Tambaya ce da ake yawan yi don gwada fahimtarka game da fannonin da za ka inganta.',
  'job-05': 'Ana amfani da ita don bayyana yawan shekarun ƙwarewa da kake da su a fannin aikinka.',
  'job-06': 'Tana tambaya game da shirye-shiryenka na gaba da burin sana\'arka.',
  'job-07': 'Ana amfani da ita don tambaya dalilin da ya sa ka bar aikinka ko kamfaninka na baya.',
  'job-08': 'Ana amfani da ita don tambayar albashin da kake tsammani ko kake nema.',
  'job-09': 'Tana tambaya game da iyawarka na jimre wa lokutan ƙarshe ko yanayi mai matsi.',
  'job-10': 'Tambaya ce ta halaye da ake yawan yi game da yadda kake magance matsaloli.',
  'job-11': 'Ana amfani da ita don tambaya yadda kake amsawa ga sukar aikinka.',
  'job-12': 'Yawanci ana yin wannan a ƙarshen hira — ka shirya tambaya ɗaya ko biyu.',
  'job-13': 'Ana amfani da ita don bayyana cewa kana shirye ka fara aiki ba tare da jinkiri ba.',
  'job-14': 'Ana amfani da ita don tambaya game da lokacin da ake tsammanin sanin sakamakon hira.',
  'job-15': 'Ana amfani da ita don tambaya game da jadawalin aiki na wannan matsayin.',
  'job-16': 'Ana amfani da ita don tambaya game da ayyukan yau da kullum da ake tsammani a wannan matsayin.',
  'job-17': 'Ana amfani da ita don bayyana iyawarka ta yin aiki tare da tawaga yadda ya kamata.',
  'job-18': 'Kalma ce da ake yawan amfani da ita lokacin aika neman aiki ta imel.',
  'job-19': 'Kalma ce ta ladabi don bayyana godiya a ƙarshen hira.',
  'job-20': 'Layin rufewa ne na ladabi da ake amfani da shi a ƙarshen hira ko imel.',
};

export const quizzes = {
  'q-job-01': { question: 'Yaya za a ce "Tell me about yourself." a Larabci?', explain: '"Tell me about yourself." na nufin "حدثني عن نفسك." a Larabci.' },
  'q-job-03': { question: 'Yaya za a ce "What are your strengths?" a Larabci?', explain: '"What are your strengths?" na nufin "ما هي نقاط قوتك؟" a Larabci.' },
  'q-job-04': { question: 'Yaya za a ce "What are your weaknesses?" a Larabci?', explain: '"What are your weaknesses?" na nufin "ما هي نقاط ضعفك؟" a Larabci.' },
  'q-job-06': { question: 'Yaya za a ce "Where do you see yourself in five years?" a Larabci?', explain: '"Where do you see yourself in five years?" na nufin "أين ترى نفسك بعد خمس سنوات؟" a Larabci.' },
  'q-job-08': { question: 'Yaya za a ce "What are your salary expectations?" a Larabci?', explain: '"What are your salary expectations?" na nufin "ما هو راتبك المتوقع؟" a Larabci.' },
  'q-job-09': { question: 'Yaya za a ce "Can you work under pressure?" a Larabci?', explain: '"Can you work under pressure?" na nufin "هل يمكنك العمل تحت الضغط؟" a Larabci.' },
  'q-job-11': { question: 'Yaya za a ce "How do you handle criticism?" a Larabci?', explain: '"How do you handle criticism?" na nufin "كيف تتعامل مع النقد؟" a Larabci.' },
  'q-job-14': { question: 'Yaya za a ce "When can I expect to hear back from you?" a Larabci?', explain: '"When can I expect to hear back from you?" na nufin "متى يمكنني توقع ردكم؟" a Larabci.' },
  'q-job-17': { question: 'Yaya za a ce "I am a good team player." a Larabci?', explain: '"I am a good team player." na nufin "أنا لاعب جيد ضمن الفريق." a Larabci.' },
  'q-job-20': { question: 'Yaya za a ce "I look forward to hearing from you soon." a Larabci?', explain: '"I look forward to hearing from you soon." na nufin "أتطلع لسماع ردكم قريبًا." a Larabci.' },
};
