import describeCharacter from "./describe-character.js";
import loadCharacters from "./load-characters.js";
import {
  enableAvatarFallbacks,
  parseCollection,
  parseDataFromElement,
  sortCharacterKeys
} from "../helpers/character-vault.js";
import {
  initCollectionPreview,
  initCouponScroll
} from "../helpers/collection-preview.js";
import getBlogTopics from "../helpers/get-blog-topics.js";
import getProfile from "../helpers/get-profile.js";
import {
  adminActionMarkup,
  blogTopicsMarkup,
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

/** @param {HTMLElement} target */
const updateCollectionVisibility = (target) => {
  const section = target.closest("section");
  if (!section) {
    return;
  }

  const empty = target.childElementCount === 0;
  section.toggleAttribute("hidden", empty);
  section.classList.toggle("empty", empty);
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
  let characters;
  try {
    characters = await loadCharacters();
  } catch (error) {
    console.error("characterVault", error);

    return;
  }

  const mainCharacter = root.querySelector("h1")?.textContent?.trim() ?? "";
  const filteredCharacters = Object.fromEntries(
    Object.entries(characters).filter(
      ([key, character]) =>
        key === mainCharacter || character.main === mainCharacter
    )
  );
  const keys = sortCharacterKeys(filteredCharacters);

  const vaultPath = pageHref.split(/[?#]/, 1)[0] || window.location.pathname;
  const surface = pageHref ? "modal" : "page";
  const id = `character-vault-${surface}-${encodeURIComponent(vaultPath)}`;
  content.classList.add("vault");
  content.insertAdjacentHTML(
    "beforeend",
    vaultMarkup(isDirectPage, keys.length !== 1, id)
  );

  const filters = getTarget(root, "all-chars");
  const selectedCharTarget = getTarget(root, "selected-char");
  const characterTarget = getTarget(root, "character");
  const giftTarget = getTarget(root, "gift");
  const actionsTarget = getTarget(root, "actions");
  if (!characterTarget || !giftTarget || !actionsTarget) {
    return;
  }

  const filterPopover = getTarget(root, "character-filter");
  let handle = pageHref.split("?")[0];
  if (isDirectPage) {
    handle = window.location.pathname.split("/pages/").filter(Boolean)[0];
  }

  if (handle) {
    actionsTarget.insertAdjacentHTML("beforeend", adminActionMarkup(handle));
  }

  /**
   * @param {string} key
   * @param {HTMLElement} target
   * @param {number} rows
   */
  const initPreview = (key, target, rows) => {
    const count = root.querySelector(`[data-vault-count="${key}"]`);
    const button = root.querySelector(`[data-vault-toggle="${key}"]`);
    if (
      !(count instanceof HTMLElement) ||
      !(button instanceof HTMLButtonElement)
    ) {
      return;
    }

    return initCollectionPreview(target, count, button, rows);
  };

  const couponTarget = getTarget(root, "coupon");
  const couponCount = root.querySelector('[data-vault-count="coupon"]');
  if (couponTarget && couponCount) {
    couponTarget.innerHTML = parseCollection(root, "coupon")
      .map(couponMarkup)
      .join("");
    couponCount.textContent = String(couponTarget.childElementCount);
    updateCollectionVisibility(couponTarget);
    initCouponScroll(couponTarget);
  }

  const sharedGrids = [
    { key: "icon", markup: iconMarkup },
    { key: "plashka", markup: plashkaMarkup }
  ];
  for (const { key, markup } of sharedGrids) {
    const target = getTarget(root, key);
    if (!target) {
      continue;
    }

    target.innerHTML = parseCollection(root, key).map(markup).join("");
    updateCollectionVisibility(target);
    initPreview(key, target, 2)?.();
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
    const mainKey = keys.find((key) => key === mainCharacter) ?? keys[0];
    let selectedChar = keys.includes(readCharParam()) ? readCharParam() : "";
    /** @type {Record<string, import("../types.js").Profile | undefined>} */
    let profiles = {};
    /** @type {Map<string, import("../types.js").BlogTopic[]>} */
    const blogTopics = new Map();
    const requestedBlogTopics = new Set();
    /** @type {Map<string, HTMLElement>} */
    const characterCards = new Map();
    const updateGiftPreview = initPreview("gift", giftTarget, 1);
    /** @type {Map<string, number>} */
    const giftNumbers = new Map();
    const gifts = Array.from(
      /** @type {NodeListOf<HTMLElement>} */ (
        root.querySelectorAll('[data-collection="gift"]')
      )
    )
      .flatMap((group) =>
        parseDataFromElement(group).map((gift) => ({
          gift,
          profile: group.dataset.profile || mainKey || mainCharacter
        }))
      )
      .flatMap(({ gift, profile }) => {
        const number = (giftNumbers.get(profile) ?? 0) + 1;
        const single = giftMarkup(gift, number, profile, false, id);
        if (!single) {
          return [];
        }

        giftNumbers.set(profile, number);
        return [
          {
            profile,
            single,
            all:
              keys.length > 1
                ? giftMarkup(gift, number, profile, true, id)
                : single
          }
        ];
      });

    const renderFilters = () => {
      if (!filters || !selectedCharTarget) {
        return;
      }

      selectedCharTarget.textContent = selectedChar || "Вся коллекция";
      filters.innerHTML = filtersMarkup(keys, selectedChar, profiles);
      enableAvatarFallbacks(filters);
    };

    const showCharacter = () => {
      const activeKey = selectedChar || mainKey;
      for (const [key, card] of characterCards) {
        const inactive = key !== activeKey;
        card.classList.toggle("inactive", inactive);
        card.inert = inactive;
      }
    };

    const renderCharacters = () => {
      characterTarget.innerHTML = keys
        .map((key) => {
          const character = filteredCharacters[key];
          return characterMarkup(
            {
              en: key,
              ...character
            },
            profiles[key],
            describeCharacter(character)
          );
        })
        .join("");
      Array.from(characterTarget.children).forEach((card, index) => {
        if (card instanceof HTMLElement) {
          const key = keys[index];
          characterCards.set(key, card);
          card
            .querySelector(".char-info > .meta")
            ?.insertAdjacentHTML(
              "beforeend",
              blogTopicsMarkup(blogTopics.get(key) ?? [])
            );
        }
      });
      showCharacter();
      enableAvatarFallbacks(characterTarget);
    };

    const renderGifts = () => {
      giftTarget.innerHTML = gifts
        .filter(({ profile }) => !selectedChar || selectedChar === profile)
        .map(({ single, all }) => (selectedChar ? single : all))
        .join("");
      updateCollectionVisibility(giftTarget);
      updateGiftPreview?.(true);
    };

    /** @param {string | undefined} key */
    const loadBlogTopics = (key) => {
      if (!key || requestedBlogTopics.has(key)) {
        return;
      }

      requestedBlogTopics.add(key);
      void getBlogTopics(key).then((topics) => {
        blogTopics.set(key, topics);
        characterCards
          .get(key)
          ?.querySelector(".char-info > .meta")
          ?.insertAdjacentHTML("beforeend", blogTopicsMarkup(topics));
      });
    };

    const applySelection = (/** @type {string} */ nextChar) => {
      selectedChar = nextChar;
      syncCharParam(selectedChar);
      renderFilters();
      showCharacter();
      renderGifts();
      loadBlogTopics(selectedChar || mainKey);
    };

    filters?.addEventListener("change", (event) => {
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

    renderCharacters();
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
    renderCharacters();

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
