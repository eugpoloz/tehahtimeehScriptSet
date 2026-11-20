"use strict";

import { setupGifts } from "./gifts";
import { escapeHtml } from "@teh/utils";
import {
  cartFieldMarkup,
  cartImageMarkup,
  cartRowMarkup,
  getStoreImageUrl,
  storeItemCountMarkup,
  storeMarkup,
  storeProfileOptionMarkup
} from "../helpers/markup";

/**
 * @typedef {object} StoreProfile
 * @property {number} [id]
 * @property {string} [main]
 *
 * @typedef {object} StoreField
 * @property {string} comment
 * @property {string} output
 * @property {string} templateValue
 * @property {"icon" | "plashka"} [profileType]
 *
 * @typedef {object} StoreCartItem
 * @property {string} cartItemId
 * @property {string} itemId
 * @property {string | undefined} type
 * @property {string} name
 * @property {number} price
 * @property {"coins" | "coupon"} payment
 * @property {string} [url]
 * @property {StoreField} [field]
 * @property {string} [fieldValue]
 * @property {boolean} [fieldEdited]
 *
 * @typedef {[string, number, string, StoreField | undefined]} StoreCatalogRecord
 *
 * @typedef {object} StoreCatalogItem
 * @property {string} [type]
 * @property {string} [url]
 * @property {number} [price]
 * @property {string} [label]
 *
 * @typedef {object} StoreCategory
 * @property {string} title
 * @property {string} comment
 * @property {Array<any>} items
 * @property {string} layout
 * @property {string} profileType
 * @property {number} unitPrice
 * @property {boolean} wide
 *
 * @typedef {object} StoreCatalogGroup
 * @property {string} title
 * @property {StoreCategory[]} categories
 *
 * @typedef {object} StoreGroup
 * @property {string} name
 * @property {StoreCartItem[]} items
 */

/**
 * Initializes the store catalog and cart controls on the current page.
 *
 * @returns {void}
 */
const store = () => {
  const source = document.querySelector("[data-store-source]");

  if (!(source instanceof HTMLElement)) {
    return;
  }

  if (source.dataset.storeInitialized === "true") {
    return;
  }

  let store = source.nextElementSibling;
  if (!(store instanceof HTMLElement) || !store.matches("[data-store]")) {
    source.insertAdjacentHTML("afterend", storeMarkup());
    store = source.nextElementSibling;
  }

  if (!(store instanceof HTMLElement)) {
    return;
  }

  const categoriesRoot = store.querySelector("[data-store-categories]");
  const cart = store.querySelector("[data-store-cart]");
  const cartList = store.querySelector("[data-store-cart-list]");
  const giftList = store.querySelector("[data-store-gift-list]");
  const giftSection = store.querySelector("[data-store-gift-group]");
  const cartEmpty = store.querySelector("[data-store-cart-empty]");
  const cartCount = store.querySelector("[data-store-cart-count]");
  const cartTotal = store.querySelector("[data-store-cart-total]");
  const checkoutButton = store.querySelector("[data-store-checkout]");
  const clearButton = store.querySelector("[data-store-clear]");
  const cartStatus = store.querySelector("#store-cart-status");
  const profileSelectors = /** @type {NodeListOf<HTMLFieldSetElement>} */ (
    store.querySelectorAll("[data-profile-picker]")
  );

  if (
    !(categoriesRoot instanceof HTMLElement) ||
    !(cart instanceof HTMLDialogElement) ||
    !(cartList instanceof HTMLElement) ||
    !(cartEmpty instanceof HTMLElement) ||
    !(cartCount instanceof HTMLElement) ||
    !(cartTotal instanceof HTMLElement) ||
    !(cartStatus instanceof HTMLElement)
  ) {
    return;
  }

  source.dataset.storeInitialized = "true";

  const cartCloseButton = cart.querySelector("[data-store-cart-toggle]");

  /** @type {StoreCartItem[]} */
  const cartItems = [];

  let recipientProfile = "";
  let payerProfile = "";
  let defaultProfile = "";

  /** @param {StoreProfile | undefined} character */
  const isMainProfile = (character) =>
    typeof character?.id === "number" &&
    Number.isFinite(character.id) &&
    !(typeof character.main === "string" && character.main !== "");

  const loadCharacters = async () => {
    const loadFromCore = window.teh?.loadCharacters;
    if (typeof loadFromCore !== "function") {
      throw new Error("Load @teh/core before store.");
    }

    return /** @type {Record<string, StoreProfile>} */ (await loadFromCore());
  };

  /** @param {string} message */
  const setProfileSelectorStatus = (message) => {
    profileSelectors?.forEach((selector) => {
      const status = selector.querySelector("[data-profile-picker-status]");
      const value = selector.querySelector("[data-profile-picker-value]");
      if (status) {
        status.textContent = message;
      }
      if (value) {
        value.textContent = message;
      }
    });
  };

  /** @param {string} profile */
  const updateRecipientProfile = (profile) => {
    recipientProfile = `@${profile}`;
    cartItems.forEach((item) => {
      if (item.field && !item.fieldEdited) {
        item.fieldValue = replaceTemplatePlaceholders(
          item.field.templateValue,
          recipientProfile
        );
      }
    });
    populateCartFields();
  };

  /** @param {string} profile */
  const getProfileLabel = (profile) =>
    profile === defaultProfile ? `Меня (${profile})` : profile;

  /**
   * @param {HTMLFieldSetElement} selector
   * @param {string} profile
   */
  const updateProfileSelector = (selector, profile) => {
    const value = selector.querySelector("[data-profile-picker-value]");
    if (value) {
      value.textContent = getProfileLabel(profile);
    }

    if (selector.dataset.profilePicker === "recipient") {
      updateRecipientProfile(profile);
      return;
    }

    payerProfile = `@${profile}`;
  };

  /** @param {Record<string, StoreProfile>} characters */
  const populateProfileSelectors = (characters) => {
    gifts?.setProfiles(characters);
    const entries = Object.entries(characters);
    const profiles = entries
      .filter(([, character]) => isMainProfile(character))
      .map(([name]) => name);
    if (!profiles.length) {
      setProfileSelectorStatus("Главные профили не найдены");
      return;
    }

    const currentLogin =
      typeof window.UserLogin === "string" ? window.UserLogin.trim() : "";
    const main = characters[currentLogin]?.main;
    const currentMain =
      typeof main === "string" && main !== "" ? main : currentLogin;
    defaultProfile = profiles.includes(currentMain) ? currentMain : "";
    const orderedProfiles = defaultProfile
      ? [
          defaultProfile,
          ...profiles.filter((profile) => profile !== defaultProfile)
        ]
      : profiles;

    /** @type {Map<string, string[]>} */
    const twinksByProfile = new Map(profiles.map((profile) => [profile, []]));
    entries.forEach(([name, character]) => {
      if (typeof character.main === "string") {
        twinksByProfile.get(character.main)?.push(name);
      }
    });

    profileSelectors?.forEach((selector) => {
      const type = selector.dataset.profilePicker;
      const options = selector.querySelector("[data-profile-picker-options]");
      const status = selector.querySelector("[data-profile-picker-status]");
      const value = selector.querySelector("[data-profile-picker-value]");
      if (!type || !options) {
        return;
      }

      options.innerHTML = orderedProfiles
        .map((profile) =>
          storeProfileOptionMarkup({
            name: `store-${type}-profile`,
            profile,
            label: getProfileLabel(profile),
            twinks: twinksByProfile.get(profile) ?? [],
            checked: profile === defaultProfile
          })
        )
        .join("");
      status?.remove();
      selector.disabled = false;
      if (defaultProfile) {
        updateProfileSelector(selector, defaultProfile);
      } else if (value) {
        value.textContent = "Выберите профиль";
      }
    });
  };

  /** @param {string} value */
  const normalizeTemplateValue = (value) => {
    const lines = value.replace(/\r\n?/g, "\n").split("\n");
    if (!lines[0].trim()) {
      lines.shift();
    }
    if (!lines[lines.length - 1]?.trim()) {
      lines.pop();
    }

    const indents = lines
      .filter((line) => line.trim())
      .map((line) => line.match(/^[\t ]*/)?.[0].length ?? 0);
    const commonIndent = indents.length ? Math.min(...indents) : 0;
    return lines.map((line) => line.slice(commonIndent)).join("\n");
  };

  const getDateOneMonthFromNow = () => {
    const today = new Date();
    const targetMonth = today.getMonth() + 1;
    const lastDayOfTargetMonth = new Date(
      today.getFullYear(),
      targetMonth + 1,
      0
    ).getDate();
    const date = new Date(
      today.getFullYear(),
      targetMonth,
      Math.min(today.getDate(), lastDayOfTargetMonth)
    );
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}`;
  };

  /** @param {string} value @param {string} profile */
  const replaceTemplatePlaceholders = (value, profile) => {
    let result = value.replace(/ДД\.ММ/g, getDateOneMonthFromNow());
    if (profile) {
      result = result.replace(/@Профиль/g, profile);
    }

    return result;
  };

  /** @param {HTMLElement} category */
  const parseCategoryItems = (category) => {
    const categoryContent = /** @type {HTMLElement} */ (
      category.cloneNode(true)
    );
    categoryContent.querySelector("[data-category-comment]")?.remove();
    /** @type {Map<string, StoreField>} */
    const templates = new Map();
    const templateElements = /** @type {NodeListOf<HTMLElement>} */ (
      categoryContent.querySelectorAll("pre[data-comment]")
    );
    templateElements.forEach((template, index) => {
      const marker = `__STORE_TEMPLATE_${index}__`;
      const { profileType } = template.dataset;
      templates.set(marker, {
        comment: template.dataset.comment ?? "",
        output: template.dataset.output ?? "text",
        templateValue: normalizeTemplateValue(template.textContent ?? ""),
        profileType:
          profileType === "icon" || profileType === "plashka"
            ? profileType
            : undefined
      });
      template.replaceWith(document.createTextNode(`\n${marker}\n`));
    });

    const records = categoryContent.innerHTML
      .replace(/<!--[\s\S]*?-->/g, "")
      .trim()
      .split(/\n\s*\n/)
      .map((record) =>
        record
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      )
      .filter((record) => record.length > 0);

    /** @type {StoreCatalogRecord[]} */
    const items = [];
    records.forEach((record, index) => {
      const templateMarker = record.find((line) => templates.has(line));
      const field = templateMarker ? templates.get(templateMarker) : undefined;
      const textLines = record.filter((line) => line !== templateMarker);
      const lastItem = items[items.length - 1];
      if (!textLines.length && field && lastItem) {
        lastItem[3] = field;
        return;
      }

      const [name, priceText, ...commentLines] = textLines;
      const price = Number(priceText);
      if (
        !name ||
        !/^(?:0|[1-9]\d*)$/.test(priceText ?? "") ||
        !Number.isSafeInteger(price)
      ) {
        console.warn(
          `Пропущена позиция ${index + 1} в категории «${category.dataset.categoryName}».`
        );
        return;
      }

      const comment = commentLines.join("\n");
      items.push([name, price, comment, field]);
    });

    return items;
  };

  /**
   * @param {HTMLElement} category
   * @param {string} sourceSelector
   * @param {string} itemType
   * @param {number} price
   * @returns {StoreCatalogItem[]}
   */
  const parseVisualItems = (category, sourceSelector, itemType, price) => {
    const categoryIsSource = category.matches(sourceSelector);
    const itemSource = categoryIsSource
      ? category.cloneNode(true)
      : category.querySelector(sourceSelector);
    if (!(itemSource instanceof HTMLElement)) {
      return [];
    }

    if (categoryIsSource) {
      itemSource.querySelector("[data-category-comment]")?.remove();
    }

    let followsBlankLine = false;
    /** @type {StoreCatalogItem[]} */
    const items = [];
    itemSource.innerHTML
      .replace(/<!--[\s\S]*?-->/g, "")
      .split("\n")
      .forEach((sourceLine) => {
        const line = sourceLine.trim();
        if (!line) {
          followsBlankLine = true;
          return;
        }

        if (/^https?:\/\/\S+$/i.test(line)) {
          followsBlankLine = false;
          items.push({ type: itemType, url: line, price });
          return;
        }

        if (followsBlankLine) {
          followsBlankLine = false;
          items.push({ type: "subheader", label: line });
        }
      });
    return items;
  };

  /** @type {Record<string, { sourceSelector: string, itemType: string }>} */
  const profileTypes = {
    icon: {
      sourceSelector: "[data-icon-source]",
      itemType: "icon"
    },
    plashka: {
      sourceSelector: "[data-plashka-source]",
      itemType: "plashka"
    }
  };

  const groupElements = /** @type {NodeListOf<HTMLElement>} */ (
    source.querySelectorAll("[data-group-name]")
  );
  const giftCategories = Array.from(
    source.querySelectorAll('[data-category-layout="gifts"]')
  );
  const giftSource = giftCategories.find(
    (category) =>
      category.hasAttribute("data-gifts-source") ||
      category.querySelector("[data-gifts-source]")
  );
  const giftGroup = giftSource?.closest("[data-group-name]");
  const customGiftCategory = Array.from(giftGroup?.children ?? []).find(
    (category) =>
      category !== giftSource &&
      category.matches("[data-category-name]") &&
      category.querySelector('pre[data-output="gift"]')
  );
  /** @type {StoreCatalogGroup[]} */
  const catalogGroups = Array.from(groupElements)
    .filter((group) => group !== giftGroup)
    .map((group) => ({
      title: group.dataset.groupName ?? "",
      categories: Array.from(group.children)
        .filter(
          (category) =>
            category instanceof HTMLElement &&
            category.matches("[data-category-name]")
        )
        .map((category) => {
          const categoryElement = /** @type {HTMLElement} */ (category);
          const layout = categoryElement.dataset.categoryLayout ?? "";
          const profileType = categoryElement.dataset.profileType ?? "";
          const unitPrice = Number(categoryElement.dataset.unitPrice);
          /** @type {Array<StoreCatalogRecord | StoreCatalogItem>} */
          let items = [];
          if (layout === "profile") {
            const profile = profileTypes[profileType];
            if (profile) {
              items = parseVisualItems(
                categoryElement,
                profile.sourceSelector,
                profile.itemType,
                unitPrice
              );
            }
          } else {
            items = parseCategoryItems(categoryElement);
          }

          return {
            title: categoryElement.dataset.categoryName ?? "",
            comment:
              categoryElement
                .querySelector("[data-category-comment]")
                ?.innerHTML.trim() ?? "",
            items,
            layout,
            profileType,
            unitPrice,
            wide: categoryElement.hasAttribute("data-category-wide")
          };
        })
    }));

  /** @param {number} price */
  const getPriceMarkup = (price) => {
    if (price === 0) {
      return "Бесплатно";
    }

    return `${price} <i class="mgc mgc-copper-coin-core-regular" aria-hidden="true"></i>`;
  };

  const couponForms = {
    one: "купон",
    few: "купона",
    many: "купонов"
  };

  /** @param {number} amount @param {{ one: string, few: string, many: string }} forms */
  const getRussianNounForm = (amount, forms) => {
    const lastTwoDigits = Math.abs(amount) % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return forms.many;
    }

    const lastDigit = Math.abs(amount) % 10;
    if (lastDigit === 1) {
      return forms.one;
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return forms.few;
    }

    return forms.many;
  };

  /** @param {string} profile */
  const getProfileName = (profile) => profile.replace(/^@/, "");

  const getCartGroups = () => {
    /** @type {Map<string, StoreGroup>} */
    const groups = new Map();
    cartItems.forEach((item) => {
      const key = `${item.type ?? "item"}\u0000${item.name}`;
      let group = groups.get(key);
      if (!group) {
        group = { name: item.name, items: [] };
        groups.set(key, group);
      }

      group.items.push(item);
    });

    return Array.from(groups.values());
  };

  /** @param {StoreGroup} group */
  const getGroupPaymentSummary = (group) => {
    const totals = group.items.reduce(
      (result, item) => {
        if (item.payment === "coupon") {
          result.coupons += 1;
        } else {
          result.coins += item.price;
        }

        return result;
      },
      { coins: 0, coupons: 0 }
    );
    const parts = [];
    if (totals.coins > 0) {
      parts.push(`${totals.coins} [coin]`);
    }
    if (totals.coupons > 0) {
      parts.push(
        `${totals.coupons} ${getRussianNounForm(totals.coupons, couponForms)}`
      );
    }

    return parts.join(" + ");
  };

  /** @param {StoreGroup} group @param {string} blockBreak */
  const getGroupPayload = (group, blockBreak) => {
    /** @type {string[]} */
    const textValues = [];
    /** @type {string[]} */
    const codeValues = [];
    group.items.forEach((item) => {
      if (item.url) {
        codeValues.push(item.url.trim());
        return;
      }
      if (!item.field) {
        return;
      }

      const value = item.fieldValue?.trim() ?? "";
      if (!value) {
        return;
      }
      if (item.field.output === "code") {
        codeValues.push(value);
        return;
      }

      textValues.push(value);
    });

    const parts = [];
    if (textValues.length) {
      parts.push(textValues.join("\n"));
    }
    if (codeValues.length) {
      parts.push(
        `[code]${blockBreak}${codeValues.join("\n")}${blockBreak}[/code]`
      );
    }

    return parts.join("\n\n");
  };

  /** @param {StoreGroup} group @param {string} blockBreak */
  const getGroupOrderBlock = (group, blockBreak) => {
    const quantity =
      group.items.length > 1 ? ` (${group.items.length} шт.)` : "";
    const title = `[b]${group.name}[/b]${quantity} — ${getGroupPaymentSummary(group) || "0 [coin]"}`;
    const payload = getGroupPayload(group, blockBreak);
    if (!payload) {
      return title;
    }

    const separator = payload.startsWith("[code]")
      ? blockBreak.repeat(2)
      : "\n\n";
    return title + separator + payload;
  };

  const buildCheckoutText = () => {
    if ((!cartItems.length && !giftCount()) || hasIncompleteOrder()) {
      return "";
    }

    const mainProfile = defaultProfile ? `@${defaultProfile}` : "";
    const recipientLine =
      recipientProfile === mainProfile
        ? "[b]Покупаю:[/b] для себя"
        : `[b]Покупаю:[/b] в подарок @${getProfileName(recipientProfile)}`;
    const payerLine =
      payerProfile && payerProfile !== mainProfile
        ? `[b]Платит:[/b] @${getProfileName(payerProfile)} (ждем подтверждения)`
        : "";
    const groups = getCartGroups();
    const deductionLines = [];
    const totalCoins = cartItems.reduce(
      (total, item) => total + (item.payment === "coins" ? item.price : 0),
      giftTotal()
    );
    if (totalCoins > 0) {
      deductionLines.push(`${totalCoins} [coin]`);
    }
    groups.forEach((group) => {
      const coupons = group.items.filter(
        (item) => item.payment === "coupon"
      ).length;
      if (coupons > 0) {
        deductionLines.push(
          `${coupons} ${getRussianNounForm(coupons, couponForms)} — ${group.name}`
        );
      }
    });

    const giftCoupons = gifts?.couponCount ?? 0;
    if (giftCoupons > 0) {
      deductionLines.push(
        `${giftCoupons} ${getRussianNounForm(giftCoupons, couponForms)}`
      );
    }

    const blockBreak = gifts?.count ? "" : "\n";
    const giftBlock = gifts?.count
      ? `[b]Подарки:[/b][block=tab]${gifts.order(blockBreak)}[/block]`
      : "";

    return [
      cartItems.length ? recipientLine : "",
      groups.length &&
        `[block=tab][quote]${blockBreak}${groups.map((group) => getGroupOrderBlock(group, blockBreak)).join(`${blockBreak.repeat(2)}[hr]${blockBreak.repeat(2)}`)}${blockBreak}[/quote][/block]`,
      giftBlock,
      `[b]Итого списать:[/b]${blockBreak}[ul]${blockBreak}${deductionLines.join("\n") || "0 [coin]"}${blockBreak}[/ul]`,
      payerLine
    ]
      .filter(Boolean)
      .join(blockBreak.repeat(2));
  };

  /** @param {string} message */
  const setCartStatus = (message) => {
    if (cartStatus.textContent !== message) {
      cartStatus.textContent = message;
    }
  };

  let nextItemId = 0;
  let nextCartItemId = 0;
  /** @type {Map<string, StoreField>} */
  const catalogItemFields = new Map();

  /** @param {{ type?: string, url?: string }} item */
  const renderProfileAsset = (item) => {
    if (item.type === "plashka") {
      return `<profile-plashka src="${escapeHtml(item.url ?? "")}"></profile-plashka>`;
    }

    return `<profile-icon src="${escapeHtml(item.url ?? "")}"></profile-icon>`;
  };

  /** @param {StoreCatalogRecord} item */
  const renderItem = (item) => {
    const [name, price, optionalComment, field] = item;
    const customGift = field?.output === "gift";
    const itemId = String(nextItemId++);
    if (field && !customGift) {
      catalogItemFields.set(itemId, field);
    }

    const comment = optionalComment
      ? `<span class="store__note col-span-full">${optionalComment}</span>`
      : "";

    return `
      <button
        class="button store__item store__card items-start w-full"
        ${customGift ? `data-custom-add data-gift-image-label="${escapeHtml(field?.comment ?? "")}"` : "data-store-add"}
        data-store-item-id="${itemId}"
        data-store-price="${price}"
        type="button"
      >
        <strong data-store-item-name>${name}</strong>
        <span class="store__price flex items-center">${getPriceMarkup(price)}</span>
        ${comment}
        ${storeItemCountMarkup}
      </button>`;
  };

  /** @param {StoreCatalogItem} item */
  const renderProfileItem = (item) => {
    if (item.type === "subheader") {
      return `<p class="catalog__subtitle col-span-full">${item.label}</p>`;
    }

    const itemId = String(nextItemId++);
    const assetMarkup = renderProfileAsset(item);
    let itemName = "Иконка из магазина";
    if (item.type === "plashka") {
      itemName = "Плашка из магазина";
    }

    return `
      <button
        class="button store__item store__asset flex items-center justify-center"
        data-store-add
        data-store-item-id="${itemId}"
        data-store-item-type="${item.type}"
        data-store-price="${item.price}"
        data-store-item-url="${item.url}"
        type="button"
        aria-pressed="false"
      >
        ${assetMarkup}
        <span class="sr-only" data-store-item-name>${itemName}</span>
        ${storeItemCountMarkup}
      </button>`;
  };

  /** @param {StoreCategory} category */
  const renderCategory = (category) => {
    /** @type {(item: any) => string} */
    let itemRenderer = renderItem;
    if (category.layout === "profile") {
      itemRenderer = renderProfileItem;
    }

    const renderedItems = category.items
      .map((item) => itemRenderer(item))
      .join("");
    const categoryComment = category.comment
      ? `<small class="catalog__note">${category.comment}</small>`
      : "";

    let categoryClass = "catalog relative";
    if (category.layout === "profile") {
      categoryClass += " catalog--assets";
    } else {
      categoryClass += " wrapper";
    }
    if (category.wide) {
      categoryClass += " col-span-full";
    }

    let itemsMarkup = `<div class="flex flex-col gap-sm">${renderedItems}</div>`;
    if (category.wide && category.layout !== "profile") {
      itemsMarkup = `<div class="grid-col-2">${renderedItems}</div>`;
    }

    if (category.layout === "profile") {
      let itemsClass = "catalog__items scrollable";
      if (category.profileType === "plashka") {
        itemsClass += " catalog__items--plashkas";
      } else {
        itemsClass += " gap-sm";
      }
      itemsMarkup = `
        <div class="wrapper relative catalog__frame">
          <div class="${itemsClass}">
            ${renderedItems}
          </div>
        </div>`;
    }

    let categoryTitle = category.title;
    if (category.layout === "profile") {
      categoryTitle = `${category.title} — ${getPriceMarkup(category.unitPrice)} за шт.`;
    }

    return `
      <article class="${categoryClass}">
        ${categoryTitle ? `<h5 class="catalog__title relative flex items-center">${categoryTitle}</h5>` : ""}
        ${categoryComment}

        ${itemsMarkup}
      </article>`;
  };

  /** @param {StoreCatalogGroup} group */
  const renderGroup = (group) => `
    <section>
      <h4 class="subtitle">${group.title}</h4>
      
      <div class="store__group">
      ${group.categories.map(renderCategory).join("")}
      </div>
    </section>`;

  categoriesRoot.innerHTML = catalogGroups.map(renderGroup).join("");

  const renderItemCounts = () => {
    const itemCounts = new Map();
    const itemIds = cartItems.map((item) => item.itemId);
    itemIds.push(...(gifts?.itemIds ?? []));
    for (const itemId of itemIds) {
      const count = itemCounts.get(itemId) ?? 0;
      itemCounts.set(itemId, count + 1);
    }

    store
      .querySelectorAll("[data-store-add], [data-gift-url], [data-custom-add]")
      .forEach((addButton) => {
        const itemCount = addButton.querySelector("[data-store-item-count]");
        const itemCountValue = addButton.querySelector(
          "[data-store-item-count-value]"
        );
        if (
          !(addButton instanceof HTMLButtonElement) ||
          !(itemCount instanceof HTMLElement) ||
          !(itemCountValue instanceof HTMLElement)
        ) {
          return;
        }

        const count = itemCounts.get(addButton.dataset.storeItemId) ?? 0;
        itemCountValue.textContent = String(count);
        itemCount.hidden = count === 0;
        addButton.classList.toggle("store__item--added", count > 0);
        const itemType = addButton.dataset.storeItemType;
        if (itemType === "icon" || itemType === "plashka") {
          addButton.setAttribute("aria-pressed", String(count > 0));
        }
      });
  };

  /** @param {HTMLInputElement | HTMLTextAreaElement} input @param {StoreCartItem} item */
  const populateCartField = (input, item) => {
    const value = item.fieldValue ?? "";
    if (input.value !== value) {
      input.value = value;
    }
    if (item.field?.output === "image") {
      const preview = input
        .closest(".cart__row")
        ?.querySelector("[data-store-image-preview]");
      const url = getStoreImageUrl(value.trim());
      input.setAttribute("aria-invalid", String(!url));
      if (
        preview &&
        (preview.firstElementChild?.getAttribute("src") ?? "") !== url
      ) {
        preview.innerHTML = "";
        if (url) {
          preview.innerHTML = item.field.profileType
            ? renderProfileAsset({ type: item.field.profileType, url })
            : cartImageMarkup(url);
        }
      }
    }
  };

  const populateCartFields = () => {
    cartList.querySelectorAll("[data-store-cart-field]").forEach((input) => {
      if (!(
        input instanceof HTMLInputElement ||
        input instanceof HTMLTextAreaElement
      )) {
        return;
      }

      const item = cartItems.find(
        (item) => item.cartItemId === input.dataset.storeCartItemId
      );
      if (item?.field) {
        populateCartField(input, item);
      }
    });
  };

  const hasInvalidImageField = () =>
    cartItems.some(
      (item) =>
        item.field?.output === "image" &&
        !getStoreImageUrl(item.fieldValue?.trim() ?? "")
    );

  const hasIncompleteOrder = () =>
    (cartItems.length > 0 && !recipientProfile) ||
    (giftCount() > 0 && !payerProfile) ||
    Boolean(gifts?.hasMissingRecipient || gifts?.hasInvalidImage) ||
    hasInvalidImageField();

  const renderCartTotal = () => {
    const totals = cartItems.reduce(
      (result, item) => {
        if (item.payment === "coupon") {
          result.coupons += 1;
        } else {
          result.coins += item.price;
        }

        return result;
      },
      { coins: giftTotal(), coupons: gifts?.couponCount ?? 0 }
    );
    const totalLines = [];
    if (totals.coins > 0 || (cartItems.length && !totals.coupons)) {
      totalLines.push(getPriceMarkup(totals.coins));
    }
    if (totals.coupons > 0) {
      totalLines.push(
        `${totals.coupons} ${getRussianNounForm(totals.coupons, couponForms)}`
      );
    }

    cartTotal.hidden = totalLines.length === 0;
    cartTotal.innerHTML = totalLines.length
      ? `<span>Итого:</span><span class="flex items-center gap-xs">${totalLines
          .map((line) => `<span class="flex items-center">${line}</span>`)
          .join(
            '<span class="flex items-center" aria-hidden="true">+</span>'
          )}</span>`
      : "";
  };

  const renderCartSummary = () => {
    const hasGifts = giftCount() > 0;
    const count = cartItems.length + giftCount();
    cartCount.textContent = String(count);
    cartEmpty.hidden = count > 0;
    const recipientPicker = cart.querySelector(
      '[data-profile-picker="recipient"]'
    );
    if (recipientPicker instanceof HTMLElement) {
      recipientPicker.hidden = hasGifts && !cartItems.length;
    }
    cartList.hidden = cartItems.length === 0;
    if (giftSection instanceof HTMLElement) {
      giftSection.hidden = !hasGifts;
    }
    if (!count) {
      hideCartConfirmations();
    }
    profileSelectors.forEach((picker) => {
      let invalid = hasGifts && !payerProfile;
      if (picker.dataset.profilePicker === "recipient") {
        invalid = cartItems.length > 0 && !recipientProfile;
      }
      picker
        .querySelector("[data-profile-picker-trigger]")
        ?.setAttribute("aria-invalid", String(invalid));
    });
    if (checkoutButton instanceof HTMLButtonElement) {
      checkoutButton.disabled = !count || hasIncompleteOrder();
    }
    if (clearButton instanceof HTMLButtonElement) {
      clearButton.disabled = !count;
    }
    renderCartTotal();
    renderItemCounts();
  };

  const renderCart = () => {
    renderCartSummary();
    cartList
      .querySelectorAll(".cart__row[data-store-cart-item-id]")
      .forEach((row) => row.remove());
    const rows = cartItems
      .map((item) => {
        let preview = "";
        let productClass = "cart__product flex items-center gap-sm";
        let productMarkup = `<strong class="cart__name">${item.name}</strong>`;
        if (item.url && item.type) {
          preview = renderProfileAsset(item);
          if (item.type === "plashka") {
            productClass = "cart__product flex flex-col gap-xs";
            productMarkup += preview;
          } else {
            productMarkup = `${preview}${productMarkup}`;
          }
        }

        let field = "";
        if (item.field) {
          const id = `hehe-store-cart-field-${item.cartItemId}`;
          const attrs = `class="cart__input" id="${id}" data-store-cart-field data-store-cart-item-id="${item.cartItemId}"`;
          let control = `<textarea ${attrs}></textarea>`;
          if (item.field.output === "image") {
            control = `<input type="url" aria-required="true" ${attrs}>`;
            const imagePreview = "<div data-store-image-preview></div>";
            if (item.field.profileType === "plashka") {
              productClass = "cart__product flex flex-col gap-xs";
              productMarkup += imagePreview;
            } else {
              productMarkup = `${imagePreview}${productMarkup}`;
            }
          }
          field = cartFieldMarkup(id, item.field.comment, control);
        }
        return cartRowMarkup({
          attributes: `data-store-cart-item-id="${item.cartItemId}"`,
          product: `<div class="${productClass}">${productMarkup}</div>`,
          price: getPriceMarkup(item.price),
          removeHook: "data-store-cart-remove",
          coupon: item.price > 0 ? item.payment === "coupon" : undefined,
          fields: field
        });
      })
      .join("");
    cartList.insertAdjacentHTML("afterbegin", rows);
    populateCartFields();
  };

  const hideCartConfirmations = () => {
    const popovers = /** @type {NodeListOf<HTMLElement>} */ (
      store.querySelectorAll("[data-store-confirmation]")
    );
    popovers.forEach((popover) => {
      if (popover.matches(":popover-open")) {
        /** @type {HTMLElement & { hidePopover: () => void }} */ (
          popover
        ).hidePopover();
      }
    });
  };

  const resetProfileSelectors = () => {
    recipientProfile = defaultProfile ? `@${defaultProfile}` : "";
    payerProfile = defaultProfile ? `@${defaultProfile}` : "";
    profileSelectors?.forEach((selector) => {
      const value = selector.querySelector("[data-profile-picker-value]");
      const options = /** @type {NodeListOf<HTMLInputElement>} */ (
        selector.querySelectorAll("[data-profile-picker-option]")
      );
      options.forEach((option) => {
        option.checked = option.value === defaultProfile;
      });
      if (value) {
        value.textContent = defaultProfile
          ? getProfileLabel(defaultProfile)
          : "Выберите профиль";
      }
    });
  };

  const resetCart = () => {
    cartItems.splice(0);
    gifts?.reset();
    nextCartItemId = 0;
    resetProfileSelectors();
    setCartStatus("");
    renderCart();
  };

  const checkoutCart = () => {
    const text = buildCheckoutText();
    if (!text) {
      return;
    }

    const mainReply = document.querySelector("#main-reply");
    if (!(mainReply instanceof HTMLTextAreaElement)) {
      setCartStatus("Не найдено поле для ответа.");
      return;
    }

    mainReply.value = text;
    mainReply.dispatchEvent(new Event("input", { bubbles: true }));
    resetCart();
    setCartOpen(false);
    mainReply.focus();
  };

  /** @param {boolean} open */
  const setCartOpen = (open) => {
    if (open && !cart.open) {
      cart.showModal();
    }

    if (!open && cart.open) {
      cart.close();
    }
  };

  cart.addEventListener("close", () => {
    hideCartConfirmations();
  });

  if (!("closedBy" in HTMLDialogElement.prototype)) {
    /** @param {PointerEvent} event */
    const isBackdropPress = (event) => {
      const bounds = cart.getBoundingClientRect();
      return (
        event.target === cart &&
        event.isPrimary &&
        event.button === 0 &&
        (event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom)
      );
    };
    let pressedOutside = false;
    cart.addEventListener("pointerdown", (event) => {
      pressedOutside = isBackdropPress(event);
    });
    cart.addEventListener("pointerup", (event) => {
      const dismiss = pressedOutside && isBackdropPress(event);
      pressedOutside = false;
      if (dismiss) {
        setCartOpen(false);
      }
    });
  }

  /** @param {HTMLInputElement} input */
  const closeProfilePicker = (input) => {
    const popover = input.closest("[popover]");
    if (popover instanceof HTMLElement && popover.matches(":popover-open")) {
      popover.hidePopover();
    }
  };

  store.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    // Native arrow navigation can synthesize a click with detail 0.
    if (
      event instanceof MouseEvent &&
      event.detail > 0 &&
      target instanceof HTMLInputElement &&
      target.matches("[data-profile-picker-option]")
    ) {
      closeProfilePicker(target);
      return;
    }

    const toggle = target?.closest("[data-store-cart-toggle]");
    if (toggle instanceof HTMLButtonElement) {
      setCartOpen(!cart.open);
      return;
    }

    const checkoutConfirm = target?.closest("[data-store-checkout-confirm]");
    if (checkoutConfirm instanceof HTMLButtonElement) {
      checkoutCart();
      return;
    }

    const clearConfirm = target?.closest("[data-store-clear-confirm]");
    if (clearConfirm instanceof HTMLButtonElement) {
      resetCart();
      if (cartCloseButton instanceof HTMLButtonElement) {
        cartCloseButton.focus();
      }
      return;
    }

    const removeButton = target?.closest("[data-store-cart-remove]");
    if (removeButton instanceof HTMLButtonElement) {
      const row = removeButton.closest("[data-store-cart-item-id]");
      const itemIndex = cartItems.findIndex(
        (item) =>
          item.cartItemId === row?.getAttribute("data-store-cart-item-id")
      );
      if (!row || itemIndex < 0) {
        return;
      }

      const adjacentRow = row.nextElementSibling ?? row.previousElementSibling;
      const focusTarget =
        adjacentRow?.querySelector("[data-store-cart-remove]") ??
        cartCloseButton;
      cartItems.splice(itemIndex, 1);
      row.remove();
      renderCartSummary();
      if (focusTarget instanceof HTMLButtonElement) {
        focusTarget.focus();
      }

      return;
    }

    if (target?.closest("a")) {
      return;
    }

    const addButton = target?.closest("[data-store-add]");
    if (!(addButton instanceof HTMLButtonElement)) {
      return;
    }

    const itemName = addButton
      .querySelector("[data-store-item-name]")
      ?.textContent.trim();
    const itemPrice = Number(addButton.dataset.storePrice);
    if (!itemName || !Number.isSafeInteger(itemPrice)) {
      return;
    }

    const itemUrl = addButton.dataset.storeItemUrl;
    const itemId = addButton.dataset.storeItemId;
    if (!itemId) {
      return;
    }

    const itemType = addButton.dataset.storeItemType;
    if (itemType === "icon" || itemType === "plashka") {
      const selectedIndex = cartItems.findIndex(
        (cartItem) => cartItem.itemId === itemId
      );
      if (selectedIndex !== -1) {
        cartItems.splice(selectedIndex, 1);
        renderCart();
        return;
      }
    }

    const field = catalogItemFields.get(itemId);
    /** @type {StoreCartItem} */
    const item = {
      cartItemId: String(nextCartItemId++),
      itemId,
      type: itemType,
      name: itemName,
      price: itemPrice,
      payment: "coins"
    };
    if (itemUrl) {
      item.url = itemUrl;
    }
    if (field) {
      item.field = { ...field };
      item.fieldValue = replaceTemplatePlaceholders(
        field.templateValue,
        recipientProfile
      );
      item.fieldEdited = false;
    }

    cartItems.push(item);
    renderCart();
  });

  store.addEventListener("keydown", (event) => {
    const input = event.target;
    if (
      !(event instanceof KeyboardEvent) ||
      (event.key !== "Enter" && event.key !== " ") ||
      !(input instanceof HTMLInputElement) ||
      !input.matches("[data-profile-picker-option]")
    ) {
      return;
    }

    event.preventDefault();
    input.click();
    closeProfilePicker(input);
  });

  store.addEventListener("input", (event) => {
    const input = event.target;
    if (
      !(
        input instanceof HTMLInputElement ||
        input instanceof HTMLTextAreaElement
      ) ||
      !input.matches("[data-store-cart-field]")
    ) {
      return;
    }

    const item = cartItems.find(
      (cartItem) => cartItem.cartItemId === input.dataset.storeCartItemId
    );
    if (item?.field) {
      item.fieldValue = input.value;
      item.fieldEdited = true;
      if (item.field.output === "image") {
        populateCartField(input, item);
        renderCartSummary();
      }
    }
  });

  store.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    if (input.matches("[data-store-cart-coupon]")) {
      const row = input.closest("[data-store-cart-item-id]");
      const item = cartItems.find(
        (item) =>
          item.cartItemId === row?.getAttribute("data-store-cart-item-id")
      );
      if (!row || !item) {
        return;
      }

      item.payment = input.checked ? "coupon" : "coins";
      row
        .querySelector("[data-store-cart-price]")
        ?.classList.toggle("store__price--coupon", input.checked);
      renderCartTotal();
      return;
    }

    if (!input.matches("[data-profile-picker-option]")) {
      return;
    }

    const selector = input.closest("[data-profile-picker]");
    if (
      !(selector instanceof HTMLFieldSetElement) ||
      selector.dataset.profilePicker === "gift-recipient"
    ) {
      return;
    }

    updateProfileSelector(selector, input.value);
    renderCartSummary();
  });

  const giftUnitPrice = Number(
    giftSource?.getAttribute("data-unit-price") ?? 1
  );
  let customGiftMarkup = "";
  if (customGiftCategory instanceof HTMLElement) {
    customGiftMarkup = renderCategory({
      title: customGiftCategory.dataset.categoryName ?? "",
      comment:
        customGiftCategory
          .querySelector("[data-category-comment]")
          ?.innerHTML.trim() ?? "",
      items: parseCategoryItems(customGiftCategory),
      layout: "",
      profileType: "",
      unitPrice: 0,
      wide: customGiftCategory.hasAttribute("data-category-wide")
    });
  }

  const gifts =
    giftSource instanceof HTMLElement &&
    giftList instanceof HTMLElement &&
    Number.isSafeInteger(giftUnitPrice) &&
    giftUnitPrice > 0
      ? setupGifts(
          giftSource,
          customGiftMarkup,
          giftUnitPrice,
          getPriceMarkup,
          categoriesRoot,
          giftList,
          parseVisualItems(
            giftSource,
            "[data-gifts-source]",
            "gift",
            giftUnitPrice
          ),
          renderCartSummary
        )
      : undefined;
  const giftCount = () => gifts?.count ?? 0;
  const giftTotal = () => gifts?.total ?? 0;
  renderCart();
  loadCharacters()
    .then((characters) => {
      populateProfileSelectors(characters);
      renderCartSummary();
    })
    .catch(() => setProfileSelectorStatus("Не удалось загрузить профили"));
};

export default store;
