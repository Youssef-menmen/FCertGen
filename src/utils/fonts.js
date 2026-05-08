export const DEFAULT_FONT_ID = 'helvetica';
export function getFontById(id) { return { id, label: 'Helvetica', family: 'Arial, sans-serif' }; }
export function loadGoogleFont() { return Promise.resolve(); }
