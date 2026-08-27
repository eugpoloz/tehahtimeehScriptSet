import describeCharacter from "./describe-character.js";
import loadCharacters from "./load-characters.js";
import {
  enableAvatarFallbacks,
  parseCollection,
  parseDataFromElement,
  sortCharacterKeys
} from "../helpers/character-vault.js";
import getProfile from "../helpers/get-profile.js";
import {
  adminActionMarkup,
  characterMarkup,
  couponMarkup,
  filtersMarkup,
  giftMarkup,
  iconMarkup,
  plashkaMarkup,
  vaultMarkup
} from "../helpers/markup.js";
import { ALL_FILTER, CHAR_PARAM } from "../constants.js";

/**
 * @param {HTMLElement} root
 * @param {string} name
 * @returns {HTMLElement | null}
 */
const getTarget = (root, name) => {
  const target = root.querySelector(`[data-vault="${name}"]`);
  return target instanceof HTMLElement ? target : null;
};

/**
 * Initializes a character collection page or its content inside the vault modal.
 *
 * @param {HTMLElement | null} [root]
 * @returns {Promise<void>}
 */
const characterVault = async (root = null) => {
  root ??= /** @type {HTMLElement | null} */ (
    document.querySelector(".main.pages")
  );
  if (!root || root.dataset.characterVaultReady !== undefined) {
    return;
  }

  const content = root.querySelector(".section .container");
  if (!content) {
    return;
  }

  root.dataset.characterVaultReady = "";
  const isDirectPage = window.location.pathname.startsWith("/pages/");
  const pageHref = root.dataset.href ?? "";

  content.insertAdjacentHTML("beforeend", vaultMarkup(isDirectPage));

  const filters = getTarget(root, "all-chars");
  const selectedCharTarget = getTarget(root, "selected-char");
  const characterTarget = getTarget(root, "character");
  const giftTarget = getTarget(root, "gift");
  const actionsTarget = getTarget(root, "actions");
  if (
    !filters ||
    !selectedCharTarget ||
    !characterTarget ||
    !giftTarget ||
    !actionsTarget
  ) {
    return;
  }

  const filterPopover =
    /** @type {(HTMLElement & { hidePopover: () => void }) | null} */ (
      root.querySelector("#character-filter-popover")
    );
  let handle = pageHref.split("?")[0];
  if (isDirectPage) {
    handle = window.location.pathname.split("/pages/").filter(Boolean)[0];
  }

  if (handle) {
    actionsTarget.insertAdjacentHTML("beforeend", adminActionMarkup(handle));
  }

  const collectionMarkup = {
    icon: iconMarkup,
    plashka: plashkaMarkup,
    coupon: couponMarkup
  };
  for (const [key, markup] of Object.entries(collectionMarkup)) {
    const target = getTarget(root, key);
    if (!target) {
      return;
    }

    parseCollection(root, key).forEach((item) => {
      target.insertAdjacentHTML("beforeend", markup(item));
    });
  }

  const readCharParam = () => {
    let search = `?${pageHref.split("?")[1] ?? ""}`;
    if (isDirectPage) {
      search = window.location.search;
    }

    return new URLSearchParams(search).get(CHAR_PARAM)?.trim() ?? "";
  };

  const syncCharParam = (/** @type {string} */ selectedChar) => {
    if (!isDirectPage) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (selectedChar) {
      params.set(CHAR_PARAM, selectedChar);
    } else {
      params.delete(CHAR_PARAM);
    }

    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
    );
  };

  try {
    const characters = await loadCharacters();
    const mainCharacter = root.querySelector("h1")?.textContent?.trim() ?? "";
    const filteredCharacters = Object.fromEntries(
      Object.entries(characters).filter(
        ([key, character]) =>
          key === mainCharacter || character.main === mainCharacter
      )
    );
    const keys = sortCharacterKeys(filteredCharacters);
    const mainKey = keys.find((key) => key === mainCharacter) ?? keys[0];
    let selectedChar = keys.includes(readCharParam()) ? readCharParam() : "";
    /** @type {Record<string, import("../types.js").Profile | undefined>} */
    let profiles = {};

    const renderFilters = () => {
      selectedCharTarget.textContent = selectedChar || "Вся коллекция";
      filters.innerHTML = filtersMarkup(keys, selectedChar, profiles);
      enableAvatarFallbacks(filters);
    };
    const renderCharacter = () => {
      const key = selectedChar || mainKey;
      const character = filteredCharacters[key];
      if (!character) {
        return;
      }

      characterTarget.innerHTML = characterMarkup(
        character,
        profiles[key],
        describeCharacter(character)
      );
      enableAvatarFallbacks(characterTarget);
    };
    const renderGifts = () => {
      giftTarget.replaceChildren();
      Array.from(
        /** @type {NodeListOf<HTMLElement>} */ (
          root.querySelectorAll('[data-collection="gift"][data-profile]')
        )
      )
        .filter(
          (group) => !selectedChar || group.dataset.profile === selectedChar
        )
        .forEach((group) => {
          const profile = group.dataset.profile ?? "";
          parseDataFromElement(group).forEach((gift, index) => {
            giftTarget.insertAdjacentHTML(
              "beforeend",
              giftMarkup(gift, index, profile)
            );
          });
        });
    };
    const applySelection = (/** @type {string} */ nextChar) => {
      selectedChar = nextChar;
      syncCharParam(selectedChar);
      renderFilters();
      renderCharacter();
      renderGifts();
    };

    filters.addEventListener("change", (event) => {
      /** @type {HTMLInputElement | null} */
      let input = null;
      if (event.target instanceof Element) {
        input = event.target.closest('input[name="character"]');
      }

      if (!input) {
        return;
      }

      applySelection(input.value === ALL_FILTER ? "" : input.value);

      if (filterPopover?.matches(":popover-open")) {
        filterPopover.hidePopover();
      }
    });

    window.addEventListener("popstate", () => {
      const charFromUrl = readCharParam();
      applySelection(keys.includes(charFromUrl) ? charFromUrl : "");
    });

    applySelection(selectedChar);
    profiles = Object.fromEntries(
      await Promise.all(
        keys.map(async (key) => [
          key,
          await getProfile(filteredCharacters[key].id)
        ])
      )
    );
    renderFilters();
    renderCharacter();

    const coins = root.querySelector("#coins");
    if (!coins) {
      return;
    }

    const balance = Object.values(profiles).reduce(
      (total, profile) =>
        total +
        Math.trunc(Number(profile?.fld4 ?? 0)) +
        Math.trunc(Number(profile?.posts ?? 0) / 1000),
      Number(coins.textContent ?? 0)
    );
    const motherlode = getTarget(root, "motherlode");
    if (!motherlode) {
      return;
    }

    motherlode.dataset.ready = "";
    motherlode.textContent = String(balance);
  } catch (error) {
    console.error("characterVault", error);
  }
};

export default characterVault;
