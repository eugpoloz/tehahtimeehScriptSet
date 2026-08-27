export const VAULT_MODAL_HTML = `<dialog id="vault-modal" closedby="any">
  <article id="vault-content" class="vault-modal"></article>
</dialog>`;

/** @typedef {(root?: HTMLElement | null) => Promise<void>} CharacterVault */

/**
 * @typedef {object} CharacterVaultConfig
 * @property {string} scriptUrl
 * @property {string} stylesUrl
 */

/** @type {Promise<CharacterVault> | null} */
let vaultPromise = null;

/**
 * Validates externally supplied vault URLs.
 *
 * @param {CharacterVaultConfig} config
 * @returns {CharacterVaultConfig}
 */
const validateConfig = (config) => {
  if (
    !config ||
    typeof config.scriptUrl !== "string" ||
    !config.scriptUrl.trim() ||
    typeof config.stylesUrl !== "string" ||
    !config.stylesUrl.trim()
  ) {
    throw new Error(
      "Character-vault config requires non-empty scriptUrl and stylesUrl"
    );
  }

  return config;
};

/**
 * Loads the vault stylesheet once.
 *
 * @param {string} href
 * @returns {Promise<void>}
 */
const loadStylesheet = (href) => {
  if (document.querySelector("link[data-character-vault-styles]")) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.characterVaultStyles = "";
    link.addEventListener("load", () => resolve(), { once: true });
    link.addEventListener(
      "error",
      () => {
        link.remove();
        reject(new Error(`Could not load ${href}`));
      },
      { once: true }
    );
    document.head.append(link);
  });
};

/**
 * Loads the character-vault script once.
 *
 * @param {string} src
 * @returns {Promise<void>}
 */
const loadScript = (src) => {
  if (typeof window.teh?.characterVault === "function") {
    return Promise.resolve();
  }

  const existingScript = document.querySelector(
    "script[data-character-vault-script]"
  );

  return new Promise((resolve, reject) => {
    const handleLoad = () => resolve();
    const handleError = () => {
      existingScript?.remove();
      reject(new Error(`Could not load ${src}`));
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });

      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.dataset.characterVaultScript = "";
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener(
      "error",
      () => {
        script.remove();
        handleError();
      },
      { once: true }
    );
    document.body.append(script);
  });
};

/**
 * Loads and returns the external character-vault initializer.
 *
 * @param {CharacterVaultConfig} config
 * @returns {Promise<CharacterVault>}
 */
const getCharacterVault = (config) => {
  const { scriptUrl, stylesUrl } = validateConfig(config);

  if (!vaultPromise) {
    vaultPromise = Promise.all([
      loadStylesheet(stylesUrl),
      loadScript(scriptUrl)
    ])
      .then(() => {
        const characterVault = window.teh?.characterVault;
        if (typeof characterVault !== "function") {
          document
            .querySelector("script[data-character-vault-script]")
            ?.remove();
          throw new Error(
            "teh.characterVault is unavailable after loading its script"
          );
        }

        return /** @type {CharacterVault} */ (characterVault);
      })
      .catch((error) => {
        vaultPromise = null;
        throw error;
      });
  }

  return vaultPromise;
};

/**
 * Loads the character-vault assets without initializing a page.
 *
 * @param {CharacterVaultConfig} config
 * @returns {Promise<void>}
 */
export const preloadCharacterVault = async (config) => {
  await getCharacterVault(config);
};

/**
 * Loads and initializes the character vault for a page root.
 *
 * @param {HTMLElement} root
 * @param {CharacterVaultConfig} config
 * @returns {Promise<void>}
 */
export const initializeCharacterVault = async (root, config) => {
  const characterVault = await getCharacterVault(config);
  await characterVault(root);
};

/**
 * Fetches vault content without the forum header.
 *
 * @param {string} url
 * @returns {Promise<HTMLElement>}
 */
export const fetchVault = async (url) => {
  const response = await fetch(`${url}&nohead`, {
    method: "GET",
    credentials: "same-origin"
  });

  if (!response.ok) {
    throw new Error(`Vault fetch failed: ${response.status}`);
  }

  const html = new TextDecoder("windows-1251").decode(
    await response.arrayBuffer()
  );
  const page = new DOMParser().parseFromString(html, "text/html");
  const main = page.getElementById("pun-main");

  if (!main) {
    throw new Error("Vault page does not contain #pun-main");
  }

  return main;
};
