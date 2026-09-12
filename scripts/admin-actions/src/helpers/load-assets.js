/**
 * Loads the character config and stylesheet.
 *
 * @param {object} options
 * @param {string} options.configUrl
 * @param {string} options.stylesUrl
 * @param {() => void} [options.onload]
 * @returns {HTMLScriptElement | null}
 */
const loadAssets = ({ configUrl, stylesUrl, onload }) => {
  if (
    typeof configUrl !== "string" ||
    !configUrl ||
    typeof stylesUrl !== "string" ||
    !stylesUrl
  ) {
    return null;
  }

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = stylesUrl;
  document.head.append(stylesheet);

  const script = document.createElement("script");
  script.charset = "windows-1251";
  script.src = configUrl;
  if (onload) {
    script.addEventListener("load", onload, { once: true });
  }
  document.head.append(script);

  return script;
};

export default loadAssets;
