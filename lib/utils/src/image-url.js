import { IMAGE_PROXY } from "./constants";

/**
 * Returns a trimmed absolute or protocol-relative HTTP(S) image URL.
 *
 * @param {string | null | undefined} value
 * @returns {string}
 */
export const getImageUrl = (value) => {
  const source = value?.trim() ?? "";
  if (!source || !/^(?:https?:)?\/\//i.test(source)) {
    return "";
  }

  return source;
};

/**
 * Validates and proxies an image URL.
 *
 * @param {string | null | undefined} value
 * @param {string} [proxy]
 * @returns {string}
 */
export const getProxiedImageUrl = (value, proxy = IMAGE_PROXY) => {
  const source = getImageUrl(value);
  if (!source) {
    return "";
  }

  if (!proxy || source.startsWith(proxy)) {
    return source;
  }

  return `${proxy}${encodeURIComponent(source)}`;
};

/**
 * Extracts the original URL from encoded or legacy proxy URLs.
 *
 * @param {string | null | undefined} value
 * @param {string} [proxy]
 * @returns {string}
 */
export const getUnproxiedImageUrl = (value, proxy = IMAGE_PROXY) => {
  const source = value?.trim() ?? "";
  if (!source || !proxy || !source.startsWith(proxy)) {
    return source;
  }

  const proxiedValue = source.slice(proxy.length);

  if (/^(?:https?:)?\/\//i.test(proxiedValue)) {
    return proxiedValue;
  }

  try {
    return decodeURIComponent(proxiedValue);
  } catch {
    return proxiedValue;
  }
};
