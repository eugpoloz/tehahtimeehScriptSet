/** @typedef {Record<string, Record<string, unknown>>} CharactersConfig */

/** @type {Promise<CharactersConfig> | null} */
let pendingLoad = null;

/** @param {unknown} value @returns {CharactersConfig} */
const validateCharacters = (value) => {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.values(value).some(
      (character) =>
        !character || typeof character !== "object" || Array.isArray(character)
    )
  ) {
    throw new Error("Character config must contain character objects.");
  }

  return /** @type {CharactersConfig} */ (value);
};

/** @returns {Promise<CharactersConfig>} */
const readCharacters = async () => {
  const previousCharacters = window.characters;
  const charactersConfigUrl = window.teh?.charactersConfigUrl;
  if (typeof charactersConfigUrl !== "string" || !charactersConfigUrl.trim()) {
    throw new Error("Pass the config URL when first loading characters.");
  }

  try {
    const filename = new URL(charactersConfigUrl, window.location.href)
      .pathname;
    if (!filename.endsWith(".json")) {
      throw new Error("Character config must be a .json file.");
    }

    if (previousCharacters !== undefined) {
      return validateCharacters(previousCharacters);
    }

    const response = await fetch(charactersConfigUrl);
    if (!response.ok) {
      throw new Error(`Character config request failed: ${response.status}.`);
    }

    const bytes = await response.arrayBuffer();
    const text = new TextDecoder("windows-1251").decode(bytes);
    const characters = validateCharacters(JSON.parse(text));
    window.characters = characters;
    return characters;
  } catch (error) {
    window.characters = previousCharacters;
    throw error;
  }
};

/**
 * Loads the JSON asset at `teh.charactersConfigUrl` and returns `window.characters`.
 * Reuses loaded data and concurrent requests; failed requests can be retried.
 * @param {string} [url] JSON config URL supplied once by the forum header.
 * @returns {Promise<CharactersConfig>}
 */
export const loadCharacters = (url) => {
  if (url !== undefined) {
    if (!window.teh) {
      window.teh = {};
    }

    window.teh.charactersConfigUrl = url;
  }

  if (pendingLoad) {
    return pendingLoad;
  }

  pendingLoad = readCharacters().finally(() => {
    pendingLoad = null;
  });
  return pendingLoad;
};
