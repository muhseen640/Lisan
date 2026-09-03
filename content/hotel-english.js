/** @type {import('./types.js').Pack} */
export const hotelEnglish = {
  id: 'hotel-english',
  slug: 'hotel-english',
  icon: 'hotel',
  titleAr: 'إنجليزية الفندق',
  titleEn: 'Hotel English',
  descAr: 'تعلم الإنجليزية التي تحتاجها من تسجيل الدخول حتى المغادرة.',
  descEn: 'Learn the Arabic you need from check-in to check-out.',
  category: 'travel',
  categoryAr: 'السفر',
  categoryEn: 'Travel',
  releaseMonth: '2026-09',
  access: 'premium', // unlocked with a subscriber code
  price: 1500,
  currency: 'NGN',
  difficulty: 'beginner',
  status: 'published',
  lessons: [
    { id: 'hot-01', ar: 'لدي حجز باسم...', en: 'I have a reservation under...', explainAr: 'تُستخدم عند تسجيل الدخول لإخبار الموظف باسم الحجز.', explainEn: 'Used at check-in to tell the front desk the name your reservation is under.' },
    { id: 'hot-02', ar: 'في أي وقت يجب أن أغادر الغرفة؟', en: 'What time is checkout?', explainAr: 'للسؤال عن موعد إخلاء الغرفة قبل المغادرة.', explainEn: 'Used to ask what time you need to vacate the room.' },
    { id: 'hot-03', ar: 'هل يوجد واي فاي مجاني؟', en: 'Is there free Wi-Fi?', explainAr: 'سؤال شائع عند الوصول لأي فندق.', explainEn: 'A common question when arriving at any hotel.' },
    { id: 'hot-04', ar: 'هل يمكنني الحصول على منشفة إضافية؟', en: 'Can I get an extra towel?', explainAr: 'لطلب أغراض إضافية من خدمة الغرف.', explainEn: 'Used to request extra items from room service.' },
    { id: 'hot-05', ar: 'المكيف لا يعمل في غرفتي.', en: 'The air conditioner is not working.', explainAr: 'للإبلاغ عن عطل في الغرفة.', explainEn: 'Used to report a problem with the room.' },
  ],
  quizzes: [
    { id: 'q-hot-02', lessonId: 'hot-02', questionAr: 'كيف تسأل عن موعد إخلاء الغرفة؟', questionEn: 'How do you say "What time is checkout?" in Arabic?', options: [{ ar: 'هل يمكنني الحصول على منشفة إضافية؟', en: 'Can I get an extra towel?', correct: false }, { ar: 'في أي وقت يجب أن أغادر الغرفة؟', en: 'What time is checkout?', correct: true }, { ar: 'هل يوجد واي فاي مجاني؟', en: 'Is there free Wi-Fi?', correct: false }], explainAr: 'checkout تعني وقت إخلاء الغرفة ومغادرة الفندق.', explainEn: '"What time is checkout?" is "في أي وقت يجب أن أغادر الغرفة؟" in Arabic.' },
    { id: 'q-hot-04', lessonId: 'hot-04', questionAr: 'كيف تطلب منشفة إضافية؟', questionEn: 'How do you say "Can I get an extra towel?" in Arabic?', options: [{ ar: 'المكيف لا يعمل في غرفتي.', en: 'The air conditioner is not working.', correct: false }, { ar: 'لدي حجز باسم...', en: 'I have a reservation under...', correct: false }, { ar: 'هل يمكنني الحصول على منشفة إضافية؟', en: 'Can I get an extra towel?', correct: true }], explainAr: 'extra towel تعني منشفة إضافية.', explainEn: '"Can I get an extra towel?" is "هل يمكنني الحصول على منشفة إضافية؟" in Arabic.' },
  ],
};
