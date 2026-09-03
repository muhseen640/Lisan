/**
 * People who sell/hand out unlock codes for premium packs. Shown as a
 * WhatsApp contact list from the unlock modal so a learner who doesn't
 * have a code yet can reach someone who sells them, without that
 * contact info needing to live in the backend or content files.
 *
 * `phone` must be E.164 (digits only, country code, no leading +/00)
 * so it works directly in a wa.me link.
 */
export const DISTRIBUTORS = [
  { name: 'Isah Abdullahi', phone: '2348160521539' },
  { name: 'Sulaiman S. Nuhu', phone: '2348143446229' },
  { name: 'Yahuza Muhammad', phone: '2348032111428' },
];

export function whatsappLink(phone, message = '') {
  const base = `https://wa.me/${phone}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
