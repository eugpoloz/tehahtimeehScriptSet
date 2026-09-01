/** @typedef {import("../types.js").Character} Character */
/** @typedef {import("../types.js").Profile} Profile */

import { ALL_FILTER } from "../constants.js";
import { parseCoupon } from "./character-vault.js";
import { IMAGE_PROXY } from "@teh/utils";

/** @param {boolean} isDirectPage */
export const vaultMarkup = (isDirectPage) => `
  <article class="vault-toolbar sticky">
    <div class="motherlode">
      <i class="material-symbols-sharp" aria-hidden="true">savings</i>
      <strong class="subtitle" data-vault="motherlode"></strong>
      <span class="sr-only">тугриков</span>
    </div>
    <fieldset class="char-select">
      <legend class="sr-only">Выберите персонажа:</legend>
      <button class="char-select__btn" type="button" popovertarget="character-filter-popover">
        <span class="char-select__value" data-vault="selected-char"></span>
        <i class="material-symbols-sharp" aria-hidden="true">keyboard_arrow_down</i>
      </button>
      <div class="char-select__menu popover-custom" id="character-filter-popover" popover="auto">
        <div data-vault="all-chars"></div>
      </div>
    </fieldset>
    <div class="actions">
      <div class="ams-only" data-vault="actions"></div>
      ${isDirectPage ? "" : '<button commandfor="vault-modal" command="close" class="vault-modal__close"><span class="sr-only">Закрыть</span><i class="material-symbols-sharp" aria-hidden="true">close</i></button>'}
    </div>
  </article>
  <article class="vault-header">
    <div class="vault-cover" aria-hidden="true"></div>
    <div class="vault-overview">
      <section class="character" data-vault="character"></section>
    </div>
  </article>
  <article class="content">
    <section class="wallet relative" hidden>
      <div class="sticky"><small><strong>купоны</strong></small></div>
      <ul class="collection scrollable coupons" data-vault="coupon"></ul>
    </section>
    <section class="plashkas relative" hidden>
      <div class="sticky"><small><strong>плашки</strong></small></div>
      <div class="collection scrollable plashkas" data-vault="plashka"></div>
    </section>
    <section class="icons relative" hidden>
      <div class="sticky"><small><strong>иконки</strong></small></div>
      <div class="collection scrollable icons" data-vault="icon"></div>
    </section>
    <section class="gifts relative" hidden>
      <div class="sticky"><small><strong>подарки</strong></small></div>
      <ul class="collection scrollable gifts" data-vault="gift"></ul>
    </section>
    <section class="achievements relative" hidden>
      <div class="sticky"><small><strong>ачивки?</strong></small></div>
      <ul class="collection scrollable achievements" data-vault="achievement"></ul>
    </section>
  </article>
`;

/** @param {string} handle */
export const adminActionMarkup = (
  handle
) => `<a href="/admin_pages.php?edit_page=${handle}" target="_blank" rel="noopener noreferrer">
  <span class="sr-only">Редактировать страницу</span>
  <i class="material-symbols-sharp" aria-hidden="true">edit</i>
</a>`;

/** @param {string} icon */
export const iconMarkup = (icon) => `<div data-custom-fld="icon"><i>
  <img src="${IMAGE_PROXY + icon}" alt="Кастомная иконка">
</i></div>`;

/** @param {string} plashka */
export const plashkaMarkup = (plashka) => `<div data-custom-fld="plashka">
  <img src="${IMAGE_PROXY + plashka}" alt="Кастомная плашка">
</div>`;

/** @param {string} coupon */
export const couponMarkup = (coupon) => {
  const { content, quantity, reusable } = parseCoupon(coupon);

  const quantityMarkup =
    quantity > 1
      ? `<span class="coupon__quantity">${quantity}<em class="sr-only"> шт.</em></span>`
      : "";

  return `<li class="coupon${reusable ? " coupon--reusable" : ""}">
    ${quantityMarkup}
    <span class="coupon__content">${content}</span>
    ${reusable ? '<span class="sr-only">Несгораемый купон</span>' : ""}
  </li>`;
};

/**
 * @param {string} label
 * @param {string} value
 * @param {boolean} checked
 * @param {string} [avatar]
 * @param {boolean} [isAllFilter]
 */
const filterMarkup = (label, value, checked, avatar, isAllFilter = false) => {
  const avatarHTML = avatar ? `<img src="${avatar}" alt="">` : "";

  return `<div class="char-filter${isAllFilter ? " char-filter--all" : ""}">
    <label>
      <input class="sr-only" type="radio" name="character" value="${value}" ${checked ? "checked" : ""}>
      <span class="char-filter__avatar">${avatarHTML}</span>
      <span>${label}</span>

      <span class="char-filter__check material-symbols-sharp" aria-hidden="true">check</span>
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
    !selectedChar,
    undefined,
    true
  );
  const characterFilters = keys
    .map((key) =>
      filterMarkup(key, key, selectedChar === key, profiles[key]?.avatar)
    )
    .join("");

  return allCharacters + characterFilters;
};

/**
 * @param {Character} character
 * @param {Profile | undefined} profile
 * @param {string} details
 */
export const characterMarkup = (character, profile, details) => {
  const description = character.desc ?? "";
  const content = [description, details].filter(Boolean).join(" • ");
  const avatar = profile?.avatar ? `<img src="${profile.avatar}" alt="">` : "";

  return `<article class="char-card">
  <div class="char-avatar">${avatar}</div>
  <div class="char-info">
    <h3 class="title">
      <span class="char-name">${character.ru}</span>, <age-from-dob>${character.dob}</age-from-dob>
    </h3>
    <div class="meta">
      <a href="/profile.php?id=${character.id}" rel="noopener noreferrer" target="_blank">@${character.en}</a>
      <span aria-hidden="true">·</span>
      <a href="/viewtopic.php?id=${encodeURIComponent(character.anketa)}" rel="noopener noreferrer" target="_blank">Анкета</a>
    </div>
    ${content ? `<p class="desc">${content}</p>` : ""}
  </div>
</article>`;
};

/** @param {string} gift @param {number} index @param {string} profile */
export const giftMarkup = (gift, index, profile) => {
  const [image, comment, sign] = gift.split("|");

  const id = `gift_${profile.split(" ").join("_").toLowerCase()}_${index + 1}`;
  const signature = sign ? `<br><em>от</em> ${sign}` : "";

  return `
    <li class="gift">
      <button type="button" popovertarget="${id}">
        <img src="${IMAGE_PROXY + image}" alt="">
        <span class="sr-only">Подарок #${index + 1}</span>
      </button>
      <div class="tooltip gift__info" popover="hint" id="${id}">
        ${comment}
        <br>
        <small><em>для</em> ${profile}${signature}</small>
      </div>
    </li>
  `;
};
