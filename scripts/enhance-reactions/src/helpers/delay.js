const DELAY_MAX = 1300;
const DELAY_MIN = 700;

export const randomDelay = () =>
  DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN);

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
