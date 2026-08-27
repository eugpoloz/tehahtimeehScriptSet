/** @typedef {import("../types.js").Character} Character */

import { CHARACTERS_SCRIPT_URL } from "../constants.js";

/** @returns {Window & { characters?: Record<string, Character> }} */
const getCharacterWindow = () =>
  /** @type {Window & { characters?: Record<string, Character> }} */ (window);

/** @returns {Promise<Record<string, Character>>} */
const loadCharacters = async () => {
  const characterWindow = getCharacterWindow();
  if (characterWindow.characters) {
    return characterWindow.characters;
  }

  const existing = document.querySelector("script[data-character-vault-data]");
  if (existing) {
    await new Promise((resolve, reject) => {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
    });
  } else {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.charset = "windows-1251";
      script.src = `${CHARACTERS_SCRIPT_URL}?v=${Date.now()}`;
      script.dataset.characterVaultData = "";
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", reject, { once: true });
      document.body.append(script);
    });
  }

  if (!characterWindow.characters) {
    throw new Error("Character data is unavailable after loading its script.");
  }

  return characterWindow.characters;
};

export default loadCharacters;
