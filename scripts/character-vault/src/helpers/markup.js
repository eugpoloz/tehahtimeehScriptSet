/** @typedef {import("../types.js").Character} Character */
/** @typedef {import("../types.js").BlogTopic} BlogTopic */
/** @typedef {import("../types.js").Profile} Profile */

import { ALL_FILTER } from "../constants.js";
import { escapeHtml, getImageUrl } from "@teh/utils";

const META_SEPARATOR_MARKUP = '<span aria-hidden="true">·</span>';

/** @param {string} id */
const characterSelectorMarkup = (
  id
) => `<div class="char-select" role="group" aria-labelledby="${id}-label">
  <span class="sr-only" id="${id}-label">Выберите персонажа:</span>
  <button class="char-select-button items-center w-full" type="button" popovertarget="${id}">
    <span class="min-w-0 flex items-center gap-xs" data-vault="selected-char"></span>
    <i class="mgc mgc-down-core-regular icon-16 ms-auto" aria-hidden="true"></i>
  </button>
  <div class="char-select-menu popover-custom popover-panel" id="${id}" data-vault="character-filter" popover="auto">
    <div class="picker__options flex flex-col flex-nowrap" data-vault="all-chars"></div>
  </div>
</div>`;

/**
 * @param {string} id
 * @param {string} label
 * @param {string} key
 * @param {boolean} [expandable]
 */
const collectionHeading = (id, label, key, expandable = true) => `
  <div class="collection-header">
    <h3 class="collection-label" id="${id}-heading">${label} <span class="count" data-vault-count="${key}"></span></h3>
    ${expandable ? `<button type="button" class="link" aria-expanded="false" aria-controls="${id}" data-vault-toggle="${key}" hidden>Показать&nbsp;все</button>` : ""}
  </div>
`;

/**
 * @param {boolean} isDirectPage
 * @param {boolean} showCharacterSelector
 * @param {string} id
 */
export const vaultMarkup = (isDirectPage, showCharacterSelector, id) => `
  <article class="toolbar sticky">
    <div class="motherlode relative flex flex-nowrap items-center justify-center gap-xs">
      <i class="mgc mgc-copper-coin-core-regular" aria-hidden="true"></i>
      <strong class="subtitle relative flex flex-nowrap items-center justify-center" data-vault="motherlode"></strong>
      <span class="sr-only">тугриков</span>
    </div>
    ${showCharacterSelector ? characterSelectorMarkup(`${id}-filter`) : ""}
    <div class="actions">
      <div class="ams-only" data-vault="actions"></div>
      ${isDirectPage ? "" : '<button commandfor="vault-modal" command="close" class="button-icon"><span class="sr-only">Закрыть</span><i class="mgc mgc-close-core-regular icon-20" aria-hidden="true"></i></button>'}
    </div>
  </article>
  <article class="vault-header">
    <div class="vault-cover" aria-hidden="true"></div>
    <div class="vault-overview min-w-0">
      <section class="character min-w-0" data-vault="character"></section>
    </div>
  </article>
  <article class="vault-content" aria-label="Общая коллекция">
    <section class="wallet empty" hidden>
      ${collectionHeading(`${id}-coupons`, "купоны", "coupon", false)}
      <div id="${id}-coupons" class="coupons flex flex-wrap content-start items-start gap-xs" data-vault="coupon" role="region" aria-labelledby="${id}-coupons-heading"></div>
    </section>
    <div class="showcase">
      <section class="plashkas min-w-0 empty" hidden>
        ${collectionHeading(`${id}-plashkas`, "плашки", "plashka")}
        <ul id="${id}-plashkas" class="collection" data-vault="plashka"></ul>
      </section>
      <section class="icons min-w-0 empty" hidden>
        ${collectionHeading(`${id}-icons`, "иконки", "icon")}
        <ul id="${id}-icons" class="collection" data-vault="icon"></ul>
      </section>
    </div>
  </article>
  <section class="gifts empty" aria-labelledby="${id}-gifts-heading" hidden>
    ${collectionHeading(`${id}-gifts`, "подарки", "gift")}
    <ul id="${id}-gifts" class="collection" data-vault="gift"></ul>
  </section>
`;

/** @param {string} handle */
export const adminActionMarkup = (
  handle
) => `<a class="button-icon" href="/admin_pages.php?edit_page=${handle}" target="_blank" rel="noopener noreferrer">
  <span class="sr-only">Редактировать страницу</span>
  <i class="mgc mgc-pencil-core-regular icon-16" aria-hidden="true"></i>
</a>`;

/** @param {string} icon */
export const iconMarkup = (icon) =>
  getImageUrl(icon)
    ? `<li class="min-w-0"><profile-icon src="${escapeHtml(icon)}"></profile-icon></li>`
    : "";

/** @param {string} plashka */
export const plashkaMarkup = (plashka) =>
  getImageUrl(plashka)
    ? `<li class="min-w-0"><profile-plashka class="plashka" src="${escapeHtml(plashka)}"></profile-plashka></li>`
    : "";

/** @param {string} coupon */
export const couponMarkup = (coupon) =>
  `<coupon-card class="coupon min-w-0">${coupon}</coupon-card>`;

/**
 * @param {string} label
 * @param {string} value
 * @param {boolean} checked
 * @param {string} [avatar]
 */
const filterMarkup = (label, value, checked, avatar) => {
  const avatarHTML = avatar
    ? `<img class="w-full" src="${avatar}" alt="">`
    : "";

  return `<div class="char-filter relative w-full">
    <label class="char-filter-label flex items-center gap-xs w-full">
      <input class="sr-only" type="radio" name="character" value="${value}" ${checked ? "checked" : ""}>
      <span class="char-filter-avatar flex items-center justify-center">${avatarHTML}</span>
      <span>${label}</span>

      <span class="char-filter-check mgc mgc-check-core-regular ms-auto" aria-hidden="true"></span>
    </label>
  </div>`;
};

/**
 * @param {string[]} keys
 * @param {string} selectedChar
 * @param {Record<string, Profile | undefined>} profiles
 */
export const filtersMarkup = (keys, selectedChar, profiles) => {
  const allCharacters = filterMarkup(
    "Вся коллекция",
    ALL_FILTER,
    !selectedChar
  );
  const characterFilters = keys
    .map((key) =>
      filterMarkup(key, key, selectedChar === key, profiles[key]?.avatar)
    )
    .join("");

  return allCharacters + characterFilters;
};

/** @param {BlogTopic[]} blogs */
export const blogTopicsMarkup = (blogs) => {
  const links = blogs
    .map(
      (blog) =>
        `<a href="${blog.url}" rel="noopener noreferrer" target="_blank">${escapeHtml(blog.title)}</a>`
    )
    .join(META_SEPARATOR_MARKUP);

  return links ? `${META_SEPARATOR_MARKUP}${links}` : "";
};

/**
 * @param {Character} character
 * @param {Profile | undefined} profile
 * @param {string} details
 */
export const characterMarkup = (character, profile, details) => {
  const description = character.desc ?? "";
  const content = [description, details].filter(Boolean).join(" • ");
  const avatar = profile?.avatar
    ? `<img class="w-full" src="${profile.avatar}" alt="">`
    : "";

  return `<article class="char-card flex flex-nowrap items-start w-full min-w-0">
  <div class="char-avatar relative">${avatar}</div>
  <div class="char-info flex flex-col flex-nowrap gap-sm min-w-0">
    <h3 class="title">
      <span class="char-name">${character.ru}</span>, <age-from-dob>${character.dob}</age-from-dob>
    </h3>
    <div class="meta flex flex-wrap gap-xs">
      <a href="/profile.php?id=${character.id}" rel="noopener noreferrer" target="_blank">@${character.en}</a>
      ${META_SEPARATOR_MARKUP}
      <a href="/viewtopic.php?id=${encodeURIComponent(character.anketa)}" rel="noopener noreferrer" target="_blank">Анкета</a>
    </div>
    ${content ? `<p class="desc">${content}</p>` : ""}
  </div>
</article>`;
};

/** Decode gift text once, after splitting the record. @param {string} text */
const decodeGiftText = (text) =>
  text.replace(/%7C|%25/g, (code) => (code === "%7C" ? "|" : "%"));

/**
 * @param {string} gift
 * @param {number} number
 * @param {string} profile
 * @param {boolean} showRecipient
 * @param {string} idPrefix
 */
export const giftMarkup = (gift, number, profile, showRecipient, idPrefix) => {
  const [image, comment = "", sign] = gift.split("|");
  const imageUrl = getImageUrl(image.replace(/&amp;/g, "&"));
  if (!imageUrl) {
    return "";
  }

  const id = `${idPrefix}-gift-${encodeURIComponent(profile)}-${number}`;
  const name = showRecipient ? escapeHtml(profile) : "";
  const label = `Подарок #${number}${name ? ` для ${name}` : ""}`;
  const recipient = name ? `<em>для</em> ${name}` : "";
  const signature = sign
    ? `${recipient ? "<br>" : ""}— ${decodeGiftText(sign)}`
    : "";

  return `
    <li class="gift relative flex flex-col items-center min-w-0">
      <button type="button" class="gift-card" popovertarget="${id}">
        <img src="${escapeHtml(imageUrl)}" alt="" loading="lazy">
        <span class="sr-only">${label}</span>
      </button>
      <div class="tooltip" popover="hint" id="${id}">
        ${decodeGiftText(comment)}
        ${recipient || signature ? `${comment ? "<br>" : ""}<small class="gift-meta">${recipient}${signature}</small>` : ""}
      </div>
    </li>
  `;
};
