/**
 * @typedef {Record<string, unknown>} SiteContent
 */

/** @type {Map<string, Promise<SiteContent>>} */
const siteContentCache = new Map();

/**
 * Loads JSON site content and caches the request by URL.
 *
 * @param {string} url
 * @returns {Promise<SiteContent>}
 */
function loadSiteContent(url) {
  if (typeof url !== "string" || !url.trim()) {
    return Promise.reject(
      new TypeError("Site content URL must be a non-empty string")
    );
  }

  const cachedRequest = siteContentCache.get(url);
  if (cachedRequest) {
    return cachedRequest;
  }

  const request = fetch(url, { priority: "high" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to load site content from ${url}: ${response.status} ${response.statusText}`
        );
      }

      return response.arrayBuffer();
    })
    .then((buffer) => {
      const text = new TextDecoder("windows-1251").decode(buffer);

      return JSON.parse(text);
    })
    .then((data) => {
      if (data === null || typeof data !== "object" || Array.isArray(data)) {
        throw new Error(
          `Site content from ${url} must be a non-null JSON object`
        );
      }

      return /** @type {SiteContent} */ (data);
    });

  siteContentCache.set(url, request);
  request.catch(() => {
    if (siteContentCache.get(url) === request) {
      siteContentCache.delete(url);
    }
  });

  return request;
}

export default loadSiteContent;
