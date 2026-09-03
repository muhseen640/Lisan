/**
 * Small hand-built inline-SVG icon set (stroke-based, 24x24 viewBox).
 * No emoji, no external icon font/CDN — keeps the app shell fully
 * self-contained and offline-cacheable, and gives a consistent,
 * professional line weight across the whole UI.
 */
const base = (inner, size = 22) => `
  <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
       stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;

const PATHS = {
  home: `<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9"/>`,
  book: `<path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5z"/><path d="M12 4v16"/>`,
  chart: `<path d="M4 20V10"/><path d="M12 20V4"/><path d="M20 20v-7"/><path d="M4 20h16"/>`,
  settings: `<circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.9 7.9 0 0 0 0-2l2-1.5-2-3.4-2.3.9a8 8 0 0 0-1.7-1L15 3.6h-4l-.4 2.4a8 8 0 0 0-1.7 1l-2.3-.9-2 3.4L6.6 11a7.9 7.9 0 0 0 0 2l-2 1.5 2 3.4 2.3-.9a8 8 0 0 0 1.7 1l.4 2.4h4l.4-2.4a8 8 0 0 0 1.7-1l2.3.9 2-3.4z"/>`,
  lock: `<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>`,
  unlock: `<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 7.4-2.1"/>`,
  headphones: `<path d="M4 13.5a8 8 0 0 1 16 0"/><rect x="3.5" y="13.5" width="4" height="6" rx="1.5"/><rect x="16.5" y="13.5" width="4" height="6" rx="1.5"/>`,
  slow: `<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.6 2"/><path d="M9.5 2.5h5"/>`,
  mic: `<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/><path d="M9 21h6"/>`,
  check: `<path d="M4.5 12.5 9 17l10.5-11"/>`,
  x: `<path d="M6 6l12 12"/><path d="M18 6 6 18"/>`,
  trophy: `<path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 5H4.5A2.5 2.5 0 0 0 4 9.9L7 11"/><path d="M17 5h2.5A2.5 2.5 0 0 1 20 9.9L17 11"/><path d="M12 13v3"/><path d="M8.5 20h7"/><path d="M9.5 16.5h5l.6 3.5H8.9z"/>`,
  flame: `<path d="M12 3s4 3.2 4 7.2a4 4 0 0 1-8 0c0-1 .4-1.8.9-2.6.3.9 1 1.4 1.6 1.1-.3-2.3.6-4 1.5-5.7z"/><path d="M8.2 13.5A4 4 0 0 0 12 21a4 4 0 0 0 3.8-7.5"/>`,
  star: `<path d="M12 3.5 14.5 9l6 .8-4.4 4.1 1.1 5.9-5.2-2.9-5.2 2.9 1.1-5.9L3.5 9.8l6-.8z"/>`,
  chevron: `<path d="M15 5 8 12l7 7"/>`,
  globe: `<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.5 2.4 3.8 5.4 3.8 8.5s-1.3 6.1-3.8 8.5c-2.5-2.4-3.8-5.4-3.8-8.5s1.3-6.1 3.8-8.5z"/>`,
  wifi: `<path d="M12 18.5h.01"/><path d="M8.5 15a5 5 0 0 1 7 0"/><path d="M5.5 12a9 9 0 0 1 13 0"/>`,
  device: `<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>`,

  /* pack/category glyphs */
  plane: `<path d="M11 2.5 21 12l-4 1-3.5 5.5-1.5-.5.7-4.6-3.2.3-1.8 2.6-1.4-.4.6-3-2.4-.6.9-1.3 3.1.3 3.4-3z"/>`,
  hotel: `<path d="M3.5 20V6a1.5 1.5 0 0 1 1.5-1.5h4V20"/><path d="M9 20V9.5H19A1.5 1.5 0 0 1 20.5 11V20"/><path d="M6 8h1"/><path d="M6 11h1"/><path d="M6 14h1"/><path d="M13 13h2"/><path d="M13 16h2"/><path d="M3.5 20h17"/>`,
  restaurant: `<path d="M6 2.5v8"/><path d="M4 2.5v5a2 2 0 0 0 4 0v-5"/><path d="M6 10.5V21"/><path d="M17.5 2.5c-2 0-3 2-3 5s1 4 3 4"/><path d="M17.5 2.5V21"/>`,
  taxi: `<path d="M4.5 16h15"/><path d="M5.5 16 7 10.5a2 2 0 0 1 2-1.5h6a2 2 0 0 1 2 1.5L18.5 16"/><rect x="3.5" y="16" width="17" height="4" rx="1.5"/><path d="M7 20v1.2"/><path d="M17 20v1.2"/><path d="M10 6.5h4"/>`,
  shop: `<path d="M4.5 8.5 5.7 4h12.6l1.2 4.5"/><path d="M4 8.5h16v10.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M9 12a3 3 0 0 0 6 0"/>`,
  briefcase: `<rect x="3" y="7.5" width="18" height="12" rx="2"/><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5"/><path d="M3 12.5h18"/>`,
  bank: `<path d="M3.5 9.5 12 4l8.5 5.5"/><path d="M4.5 9.5h15V19a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1z"/><path d="M8 12.5v5"/><path d="M12 12.5v5"/><path d="M16 12.5v5"/>`,
  phone: `<path d="M6 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 4.5 5.1 1.5 1.5 0 0 1 6 3.5z"/>`,
  chat: `<path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z"/>`,
  play: `<path d="M8 5.5 19 12 8 18.5Z"/>`,
  /* messaging-app glyph used for "contact a distributor" — a speech
     bubble with a phone handset, drawn in the app's own line style
     rather than reproducing any brand's logo. */
  whatsapp: `<path d="M12 4.5a7.5 7.5 0 0 0-6.5 11.3L4.5 19.5l3.9-1a7.5 7.5 0 1 0 3.6-14z"/><path d="M9.3 9.6c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .5.4l.6 1.4c.1.2 0 .4-.1.5l-.5.5c-.2.2-.1.4 0 .6.4.7 1.1 1.4 1.9 1.8.2.1.4.1.6-.1l.5-.6c.1-.1.3-.2.5-.1l1.4.6c.3.1.4.3.3.5-.3.8-1.2 1.3-2 1.2-1.7-.2-3.6-1.5-4.7-3.1-.6-.8-.8-1.9-.3-3.1z"/>`,
};

export function icon(name, { size = 22, className = '' } = {}) {
  const p = PATHS[name] || PATHS.star;
  return `<span class="icon-wrap ${className}">${base(p, size)}</span>`;
}
