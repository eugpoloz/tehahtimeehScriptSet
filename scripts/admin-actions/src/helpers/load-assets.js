/**
 * Loads the character config and stylesheet.
 *
 * @param {object} options
 * @param {string} [options.stylesUrl]
 * @returns {Promise<void>}
 */
const loadAssets = async ({ stylesUrl }) => {
  const loadFromCore = window.teh?.loadCharacters;
  if (typeof loadFromCore !== "function") {
    throw new Error("Load @teh/core before admin-actions.");
  }

  if (stylesUrl) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = stylesUrl;
    document.head.append(stylesheet);
  }

  await loadFromCore();
};

export default loadAssets;
