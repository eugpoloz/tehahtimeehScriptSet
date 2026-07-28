import { handleError } from "@teh/utils";
import { CUSTOMFLDS_MODULE_NAME } from "../const";

/**
 * @typedef {import("../types.js").CustomFieldOption} CustomFieldOption
 */

/**
 * @param {string} [raw]
 * @returns {string}
 */
export const getCollectionPageHref = (raw = "") => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) {
    return trimmed;
  }

  const parsed = new DOMParser().parseFromString(trimmed, "text/html");
  return parsed.querySelector("a[href]")?.getAttribute("href")?.trim() ?? "";
};

/**
 * @param {ParentNode} root
 * @param {string} selector
 * @returns {string[]}
 */
export const parseDataFromHTML = (root, selector) => {
  const commentRegex = /<!--[\s\S]*?-->/g;
  const el = root.querySelector(selector);
  if (!el) {
    return [];
  }

  return el.innerHTML
    .replace(commentRegex, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

/** @type {Map<string, Promise<Document | null>>} */
const collectionPageCache = new Map();

/**
 * @param {string} pageUrl
 * @returns {Promise<Document | null>}
 */
export const loadCollectionPage = async (pageUrl) => {
  if (!collectionPageCache.has(pageUrl)) {
    collectionPageCache.set(
      pageUrl,
      (async () => {
        try {
          const res = await fetch(pageUrl, { credentials: "same-origin" });
          if (!res.ok) {
            throw new Error(`collection fetch failed: ${res.status}`);
          }

          return new DOMParser().parseFromString(await res.text(), "text/html");
        } catch (error) {
          handleError(CUSTOMFLDS_MODULE_NAME, error);
          collectionPageCache.delete(pageUrl);
          return null;
        }
      })()
    );
  }

  return collectionPageCache.get(pageUrl) ?? null;
};

/**
 * @param {CustomFieldOption} option
 * @returns {string}
 */
const getOptionValueKey = (option) => option?.value ?? "";

/**
 * @param {CustomFieldOption[]} [baseOptions]
 * @param {string[]} [collectionUrls]
 * @returns {CustomFieldOption[]}
 */
export const mergeOptionsWithCollection = (
  baseOptions = [],
  collectionUrls = []
) => {
  const merged = [...baseOptions];
  const seen = new Set(merged.map(getOptionValueKey));

  collectionUrls.forEach((value) => {
    if (seen.has(value)) {
      return;
    }

    seen.add(value);
    merged.push({ value });
  });

  return merged;
};

/**
 * @param {boolean | string | undefined} collection
 * @param {string} [inputName]
 * @returns {string}
 */
export const getCollectionName = (collection, inputName = "") => {
  if (typeof collection === "string" && collection.length) {
    return collection;
  }

  if (collection === true) {
    return inputName;
  }

  return "";
};
