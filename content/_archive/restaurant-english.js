/** @type {import('./types.js').Pack} */
export const restaurantEnglish = {
  id: 'restaurant-english',
  slug: 'restaurant-english',
  icon: 'restaurant',
  titleAr: 'إنجليزية المطعم',
  titleEn: 'Restaurant English',
  descAr: 'اطلب طعامك بثقة، من الحجز وحتى الفاتورة.',
  descEn: 'Order with confidence, from reservation to the bill.',
  category: 'dining',
  categoryAr: 'المطاعم',
  categoryEn: 'Dining',
  releaseMonth: '2026-10',
  access: 'premium', // unlocked with a subscriber code
  price: 1500,
  currency: 'NGN',
  difficulty: 'beginner',
  status: 'published',
  lessons: [
    { id: 'res-01', ar: 'هل لديكم طاولة لشخصين؟', en: 'Do you have a table for two?', explainAr: 'تُستخدم عند الوصول للمطعم للسؤال عن توفر طاولة.', explainEn: 'Used when arriving at a restaurant to ask about a table.' },
    { id: 'res-02', ar: 'هل يمكنني رؤية قائمة الطعام؟', en: 'Can I see the menu, please?', explainAr: 'لطلب قائمة الطعام من النادل.', explainEn: 'Used to ask the waiter for the menu.' },
    { id: 'res-03', ar: 'ماذا تنصح بأن آكل؟', en: 'What do you recommend?', explainAr: 'للسؤال عن رأي النادل في أفضل الأطباق.', explainEn: 'Used to ask the waiter\'s opinion on the best dishes.' },
    { id: 'res-04', ar: 'الحساب من فضلك.', en: 'The check, please.', explainAr: 'لطلب الفاتورة في نهاية الوجبة.', explainEn: 'Used to ask for the bill at the end of a meal.' },
    { id: 'res-05', ar: 'هذا الطبق لذيذ جدًا.', en: 'This dish is delicious.', explainAr: 'للتعبير عن إعجابك بالطعام.', explainEn: 'Used to express that you like the food.' },
  ],
  quizzes: [
    { id: 'q-res-02', lessonId: 'res-02', questionAr: 'كيف تطلب قائمة الطعام؟', questionEn: 'How do you say "Can I see the menu, please?" in Arabic?', options: [{ ar: 'ماذا تنصح بأن آكل؟', en: 'What do you recommend?', correct: false }, { ar: 'الحساب من فضلك.', en: 'The check, please.', correct: false }, { ar: 'هل يمكنني رؤية قائمة الطعام؟', en: 'Can I see the menu, please?', correct: true }], explainAr: 'menu تعني قائمة الطعام.', explainEn: '"Can I see the menu, please?" is "هل يمكنني رؤية قائمة الطعام؟" in Arabic.' },
    { id: 'q-res-04', lessonId: 'res-04', questionAr: 'كيف تطلب الفاتورة؟', questionEn: 'How do you say "The check, please." in Arabic?', options: [{ ar: 'الحساب من فضلك.', en: 'The check, please.', correct: true }, { ar: 'هذا الطبق لذيذ جدًا.', en: 'This dish is delicious.', correct: false }, { ar: 'هل لديكم طاولة لشخصين؟', en: 'Do you have a table for two?', correct: false }], explainAr: 'check تعني الفاتورة في المطعم (بالإنجليزية الأمريكية).', explainEn: '"The check, please." is "الحساب من فضلك." in Arabic.' },
  ],
};
