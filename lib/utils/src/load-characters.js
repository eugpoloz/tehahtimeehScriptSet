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

/** @param {string} url @returns {Promise<void>} */
const loadCharacterScript = (url) =>
  new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.charset = "windows-1251";
    script.src = url;
    script.addEventListener(
      "load",
      () => {
        script.remove();
        resolve();
      },
      { once: true }
    );
    script.addEventListener(
      "error",
      () => {
        script.remove();
        reject(new Error("Character config script could not be loaded."));
      },
      { once: true }
    );
    document.head.append(script);
  });

/** @returns {Promise<CharactersConfig>} */
const readCharacters = async () => {
  const previousCharacters = window.characters;
  if (previousCharacters !== undefined) {
    return validateCharacters(previousCharacters);
  }

  const charactersConfigUrl = window.teh?.charactersConfigUrl;
  if (typeof charactersConfigUrl !== "string" || !charactersConfigUrl.trim()) {
    throw new Error("Pass the config URL when first loading characters.");
  }

  try {
    const filename = new URL(charactersConfigUrl, window.location.href)
      .pathname;
    let data;
    if (filename.endsWith(".json")) {
      const response = await fetch(charactersConfigUrl);
      if (!response.ok) {
        throw new Error(`Character config request failed: ${response.status}.`);
      }

      const bytes = await response.arrayBuffer();
      const text = new TextDecoder("windows-1251").decode(bytes);
      data = JSON.parse(text);
    } else if (filename.endsWith(".js")) {
      await loadCharacterScript(charactersConfigUrl);
      data = window.characters;
    } else {
      throw new Error("Character config must be a .js or .json file.");
    }

    const characters = validateCharacters(data);
    window.characters = characters;
    return characters;
  } catch (error) {
    window.characters = previousCharacters;
    throw error;
  }
};

/**
 * Loads the JS/JSON asset at `teh.charactersConfigUrl` and returns `window.characters`.
 * Reuses loaded data and concurrent requests; failed requests can be retried.
 * @param {string} [url] Config URL supplied once by the forum header.
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
