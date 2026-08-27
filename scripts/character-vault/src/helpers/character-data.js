/** @typedef {import("../types.js").Character} Character */
/** @typedef {import("../types.js").Profile} Profile */
import { CHARACTERS_SCRIPT_URL } from "../constants.js";

/** @returns {Window & { characters?: Record<string, Character> }} */
const getCharacterWindow = () =>
  /** @type {Window & { characters?: Record<string, Character> }} */ (window);

/** @returns {Promise<Record<string, Character>>} */
export const loadCharacters = async () => {
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

/** @param {string | number} id @returns {Promise<Profile | undefined>} */
export const getProfile = async (id) => {
  try {
    const response = await fetch(`/profile.php?id=${id}&nohead`, {
      credentials: "include"
    });
    const html = new TextDecoder("windows-1251").decode(
      await response.arrayBuffer()
    );
    const profile = new DOMParser().parseFromString(html, "text/html");
    const fields = Array.from(
      profile.querySelectorAll("#profile-right li")
    ).reduce((result, item) => {
      const key = item.id.substring(3);
      const value = item.querySelector("strong")?.innerHTML ?? "";
      result[key] = key === "posts" ? value.split(" - ")[0] : value;
      return result;
    }, /** @type {Record<string, string>} */ ({}));
    return {
      ...fields,
      avatar:
        profile
          .querySelector(
            "#profile-avatar img, .pa-avatar img, #profile-left img"
          )
          ?.getAttribute("src") ?? undefined
    };
  } catch (error) {
    console.error(`Could not fetch profile ${id}`, error);
  }
};

/** @param {Record<string, Character>} characters @returns {string[]} */
export const sortCharacterKeys = (characters) =>
  Object.keys(characters).sort((first, second) => {
    if (first === characters[second]?.main) {
      return -1;
    }

    if (second === characters[first]?.main) {
      return 1;
    }

    return 0;
  });

/** @param {Character} character @returns {string} */
export const describeCharacter = (character) => {
  const labels = /** @type {Record<string, string>} */ ({
    magician: character.gender === "f" ? "волшебница" : "волшебник",
    hedgewitch: "хедж-ведьма",
    hybrid: "полукровка",
    creature: "существо",
    human: "человек",
    other: "???"
  });

  const who =
    character.who?.map((value) => labels[value] ?? value).join(", ") ?? "";

  const cursed = character.cursed
    ? `; проклят${character.gender === "f" ? "а" : ""}`
    : "";

  return `${who}${cursed}`;
};
