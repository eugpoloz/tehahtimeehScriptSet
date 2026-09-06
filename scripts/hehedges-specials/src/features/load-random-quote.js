import { escapeHtml, handleError } from "@teh/utils";

/**
 * @typedef {object} Quote
 * @property {string} text
 * @property {string} username
 * @property {number} pid
 */

/**
 * @typedef {object} LoadRandomQuoteOptions
 * @property {string} [target] Quote container selector.
 */

/**
 * @param {unknown} value
 * @returns {value is Quote}
 */
const isQuote = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const quote = /** @type {Record<string, unknown>} */ (value);

  return (
    typeof quote.text === "string" &&
    Boolean(quote.text.trim()) &&
    typeof quote.username === "string" &&
    Boolean(quote.username.trim()) &&
    typeof quote.pid === "number" &&
    Number.isInteger(quote.pid) &&
    quote.pid > 0
  );
};

/**
 * Loads a random quote into a target container.
 *
 * @param {LoadRandomQuoteOptions} [options]
 * @returns {Promise<void>}
 */
const loadRandomQuote = async ({ target = "[data-random-quote]" } = {}) => {
  const container = document.querySelector(target);
  if (!container) {
    return;
  }

  try {
    const siteContentPromise = /** @type {Promise<unknown> | undefined} */ (
      window.teh?.siteContentPromise
    );
    if (!siteContentPromise) {
      throw new Error("teh.siteContentPromise must be initialized first");
    }

    const content = /** @type {Record<string, unknown>} */ (
      await siteContentPromise
    );
    const quotes = Array.isArray(content.quotes)
      ? content.quotes.filter(isQuote)
      : [];
    if (!quotes.length) {
      throw new Error("No valid quotes found in site content");
    }

    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    container.innerHTML = `
      <p>${escapeHtml(quote.text)}</p>
      <strong><a href="/viewtopic.php?pid=${quote.pid}#p${quote.pid}" target="_blank" rel="noopener noreferrer">@${escapeHtml(quote.username)}</a></strong>
    `;
  } catch (error) {
    handleError("hehedges-specials/loadRandomQuote", error);
  }
};

export default loadRandomQuote;
