/** @typedef {import("../types.js").Character} Character */

/** @returns {Promise<Record<string, Character>>} */
const loadCharacters = async () => {
  const loadFromCore = window.teh?.loadCharacters;
  if (typeof loadFromCore !== "function") {
    throw new Error("Load @teh/core before character-vault.");
  }

  return /** @type {Record<string, Character>} */ (await loadFromCore());
};

export default loadCharacters;
