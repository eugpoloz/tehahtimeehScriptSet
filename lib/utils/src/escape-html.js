/** @type {Record<string, string>} */
const HTML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

/**
 * Escapes a string for safe interpolation into HTML text or attribute values.
 *
 * @param {string} value
 * @returns {string}
 */
export const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
