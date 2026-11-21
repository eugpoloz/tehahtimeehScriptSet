/**
 * Wait for the specified number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pick a delay in milliseconds, including the lower bound and excluding the upper bound.
 * @param {number} minMs
 * @param {number} maxMs
 * @returns {number}
 */
export const randomDelay = (minMs, maxMs) =>
  minMs + Math.random() * (maxMs - minMs);
