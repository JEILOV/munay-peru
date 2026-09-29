// src/utils/url.js
//
// Validación de URLs externas. Solo http(s): rechaza javascript:, data:, etc.
// Se usa al guardar (admin) y otra vez al renderizar el href (web pública).

export function isValidHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const { protocol } = new URL(value.trim());
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}