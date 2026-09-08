import { IMAGE_PROXY } from "./constants";

/**
 * Validates an external image URL and routes it through an image proxy.
 *
 * @param {string | null | undefined} value
 * @param {string} [proxy]
 * @returns {string}
 */
export const getProxiedImageUrl = (value, proxy = IMAGE_PROXY) => {
  const source = value?.trim() ?? "";
  if (!source || !/^(?:https?:)?\/\//i.test(source)) {
    return "";
  }

  if (!proxy || source.startsWith(proxy)) {
    return source;
  }

  return `${proxy}${encodeURIComponent(source)}`;
};

/**
 * Extracts an editable source URL from current encoded and legacy raw proxy URLs.
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
