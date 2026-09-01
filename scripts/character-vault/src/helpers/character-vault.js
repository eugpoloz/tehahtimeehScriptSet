/** @typedef {import("../types.js").Character} Character */
/** @typedef {import("../types.js").Coupon} Coupon */

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
 * Parses optional trailing metadata from a coupon line.
 *
 * @param {string} value
 * @returns {Coupon}
 */
export const parseCoupon = (value) => {
  const source = value.trim();
  let content = source;
  let quantity = 1;
  let reusable = false;

  const reusableMatch = source.match(/^(.*)\|\s*reusable\s*$/i);
  if (reusableMatch) {
    reusable = true;
    content = reusableMatch[1].trim();
  }

  const quantityMatch = content.match(/^(.*)\|\s*([1-9]\d*)\s*$/);
  if (quantityMatch) {
    const parsedQuantity = Number(quantityMatch[2]);
    if (Number.isSafeInteger(parsedQuantity)) {
      quantity = parsedQuantity;
      content = quantityMatch[1].trim();
    }
  }

  return { content, quantity, reusable };
};

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

/**
 * @param {HTMLElement} root
 * @returns {void}
 */
export const enableAvatarFallbacks = (root) => {
  /** @type {NodeListOf<HTMLImageElement>} */ (
    root.querySelectorAll(".char-filter__avatar img, .char-avatar img")
  ).forEach((image) => {
    const removeImage = () => image.remove();

    if (image.complete && !image.naturalWidth) {
      removeImage();
      return;
    }

    image.addEventListener("error", removeImage, { once: true });
  });
};

/** @param {Record<string, Character>} characters @returns {string[]} */
export const sortCharacterKeys = (characters) =>
  Object.keys(characters).sort((first, second) => {
    if (first === characters[second]?.main) {
      return -1;
    }

    if (second === characters[first]?.main) {
      return 1;
    }

    return 0;
  });
