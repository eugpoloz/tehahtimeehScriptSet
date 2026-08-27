/**
 * @param {HTMLElement} root
 * @returns {string[]}
 */
export const parseDataFromElement = (root) =>
  root.innerHTML
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);

/**
 * @param {HTMLElement} root
 * @param {string} key
 * @returns {string[]}
 */
export const parseCollection = (root, key) =>
  Array.from(
    /** @type {NodeListOf<HTMLElement>} */ (
      root.querySelectorAll(`[data-collection="${key}"]`)
    )
  ).flatMap(parseDataFromElement);
