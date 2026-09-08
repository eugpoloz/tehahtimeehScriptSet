"use strict";

/**
 * @typedef {object} StoreProfile
 * @property {number} [id]
 * @property {string} [main]
 *
 * @typedef {object} StoreField
 * @property {string} comment
 * @property {string} output
 * @property {string} templateValue
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
 * @property {number} profileUnitPrice
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
  const store = document.querySelector("[data-store]");

  if (!(source instanceof HTMLElement) || !(store instanceof HTMLElement)) {
    return;
  }
  const categoriesRoot = store.querySelector("[data-store-categories]");
  const cart = store.querySelector("[data-store-cart]");
  const cartList = store.querySelector("[data-store-cart-list]");
  const cartEmpty = store.querySelector("[data-store-cart-empty]");
  const cartCount = store.querySelector("[data-store-cart-count]");
  const cartTotal = store.querySelector("[data-store-cart-total]");
  const checkoutButton = store.querySelector("[data-store-checkout]");
  const clearButton = store.querySelector("[data-store-clear]");
  const cartStatus = store.querySelector("[data-store-cart-status]");
  const profileSelectors = /** @type {NodeListOf<HTMLFieldSetElement>} */ (
    store.querySelectorAll("[data-store-profile-selector]")
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
  const CHARACTERS_SCRIPT_URL = "//forumstatic.ru/files/001c/ab/7e/10010.js";
  const forumWindow =
    /** @type {Window & { characters?: Record<string, StoreProfile> }} */ (
      window
    );

  /** @type {StoreCartItem[]} */
  const cartItems = [];

  let recipientProfile = "";
  let payerProfile = "";
  let currentMainProfile = "";
  let defaultProfile = "";

  /** @param {StoreProfile | undefined} character */
  const isMainProfile = (character) =>
    typeof character?.id === "number" &&
    Number.isFinite(character.id) &&
    !(typeof character.main === "string" && character.main !== "");

  const loadCharacters = async () => {
    if (forumWindow.characters) {
      return forumWindow.characters;
    }

    const existing = document.querySelector(
      "script[data-store-character-data], script[data-character-vault-data]"
    );
    await new Promise((resolve, reject) => {
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.charset = "windows-1251";
      script.src = `${CHARACTERS_SCRIPT_URL}?v=${Date.now()}`;
      script.dataset.storeCharacterData = "";
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", reject, { once: true });
      document.body.append(script);
    });

    if (!forumWindow.characters) {
      throw new Error(
        "Character data is unavailable after loading its script."
      );
    }

    return forumWindow.characters;
  };

  /** @param {string} message */
  const setProfileSelectorStatus = (message) => {
    profileSelectors?.forEach((selector) => {
      const status = selector.querySelector("[data-store-profile-status]");
      const value = selector.querySelector("[data-store-profile-value]");
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
    renderCart();
  };

  /**
   * @param {HTMLFieldSetElement} selector
   * @param {string} profile
   */
  const updateProfileSelector = (selector, profile) => {
    const value = selector.querySelector("[data-store-profile-value]");
    if (value) {
      value.textContent = profile;
    }

    if (selector.dataset.storeProfileSelector === "recipient") {
      updateRecipientProfile(profile);
      return;
    }

    payerProfile = `@${profile}`;
  };

  /** @param {Record<string, StoreProfile>} characters */
  const populateProfileSelectors = (characters) => {
    const profiles = Object.entries(characters)
      .filter(([, character]) => isMainProfile(character))
      .map(([name]) => name);
    if (!profiles.length) {
      setProfileSelectorStatus("Главные профили не найдены");
      return;
    }

    const currentLogin =
      typeof window.UserLogin === "string" ? window.UserLogin.trim() : "";
    const currentCharacter = characters[currentLogin];
    const currentMain =
      typeof currentCharacter?.main === "string" && currentCharacter.main !== ""
        ? currentCharacter.main
        : currentLogin;
    defaultProfile = profiles.includes(currentMain) ? currentMain : "";
    currentMainProfile = defaultProfile;

    profileSelectors?.forEach((selector) => {
      const type = selector.dataset.storeProfileSelector;
      const options = selector.querySelector("[data-store-profile-options]");
      const status = selector.querySelector("[data-store-profile-status]");
      const value = selector.querySelector("[data-store-profile-value]");
      if (!type || !options) {
        return;
      }

      options.innerHTML = profiles
        .map((profile, index) => {
          const optionId = `store-${type}-profile-${index}`;
          return `<label class="store-cart__profile-option" for="${optionId}">
            <input class="sr-only" data-store-profile-option type="radio" id="${optionId}" name="store-${type}-profile" value="${escapeHtml(profile)}"${profile === defaultProfile ? " checked" : ""}>
            <span>${escapeHtml(profile)}</span>
            <i class="material-symbols-sharp" aria-hidden="true">check</i>
          </label>`;
        })
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
      templates.set(marker, {
        comment: template.dataset.comment ?? "",
        output: template.dataset.output ?? "text",
        templateValue: normalizeTemplateValue(template.textContent ?? "")
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
        !/^[1-9]\d*$/.test(priceText ?? "") ||
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
    const itemSource = category.querySelector(sourceSelector);
    if (!(itemSource instanceof HTMLElement)) {
      return [];
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
  /** @type {StoreCatalogGroup[]} */
  const catalogGroups = Array.from(groupElements).map((group) => ({
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
        const profileUnitPrice = Number(
          categoryElement.dataset.profileUnitPrice
        );
        /** @type {Array<StoreCatalogRecord | StoreCatalogItem>} */
        let items = [];
        if (layout === "profile") {
          const profile = profileTypes[profileType];
          if (profile) {
            items = parseVisualItems(
              categoryElement,
              profile.sourceSelector,
              profile.itemType,
              profileUnitPrice
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
          profileUnitPrice,
          wide: categoryElement.hasAttribute("data-category-wide")
        };
      })
  }));

  /** @param {number} price */
  const getPriceMarkup = (price) =>
    `${price} <i class="mgc mgc-copper-coin-core-regular" aria-hidden="true"></i>`;

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

  /** @param {unknown} value */
  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        })[character] ?? character
    );

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

  /** @param {StoreGroup} group */
  const getGroupPayload = (group) => {
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
      parts.push("[" + "code]\n" + codeValues.join("\n") + "\n[/" + "code]");
    }

    return parts.join("\n\n");
  };

  /** @param {StoreGroup} group */
  const getGroupOrderBlock = (group) => {
    const quantity =
      group.items.length > 1 ? ` (${group.items.length} шт.)` : "";
    const parts = [
      `[b]${group.name}[/b]${quantity} — ${getGroupPaymentSummary(group)}`,
      getGroupPayload(group)
    ].filter(Boolean);
    return parts.join("\n\n");
  };

  const buildCheckoutText = () => {
    if (!cartItems.length) {
      return "";
    }
    if (!recipientProfile) {
      return "";
    }

    const mainProfile = currentMainProfile ? `@${currentMainProfile}` : "";
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
      0
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

    return [
      recipientLine,
      `[block=tab][quote]\n${groups.map(getGroupOrderBlock).join("\n\n[hr]\n\n")}\n[/quote][/block]`,
      `[b]Итого списать:[/b]\n[ul]\n${deductionLines.join("\n")}\n[/ul]`,
      payerLine
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  /** @param {string} message */
  const setCartStatus = (message) => {
    if (cartStatus) {
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
      return `<profile-plashka src="${item.url}"></profile-plashka>`;
    }

    return `<profile-icon src="${item.url}"></profile-icon>`;
  };

  /** @param {StoreCatalogRecord} item */
  const renderItem = (item) => {
    const [name, price, optionalComment, field] = item;
    const itemId = String(nextItemId++);
    if (field) {
      catalogItemFields.set(itemId, field);
    }

    const comment = optionalComment
      ? `<span class="store-card__comment">${optionalComment}</span>`
      : "";

    return `
      <button
        class="button store-card"
        data-store-add
        data-store-item-id="${itemId}"
        data-store-price="${price}"
        type="button"
      >
        <strong data-store-item-name>${name}</strong>
        <span class="price">${getPriceMarkup(price)}</span>
        ${comment}
        <span class="store-count-badge" data-store-item-count hidden><span class="sr-only">В корзине: </span><span data-store-item-count-value>0</span></span>
      </button>`;
  };

  /** @param {StoreCatalogItem} item */
  const renderProfileItem = (item) => {
    if (item.type === "subheader") {
      return `<p class="sticky">${item.label}</p>`;
    }

    const itemId = String(nextItemId++);
    const assetMarkup = renderProfileAsset(item);
    let addButtonClass = "button store-profile__add";
    let itemName = "Иконка из магазина";
    if (item.type === "plashka") {
      addButtonClass += " store-profile__add--plashka";
      itemName = "Плашка из магазина";
    }

    return `
      <button
        class="${addButtonClass}"
        data-store-add
        data-store-item-id="${itemId}"
        data-store-item-type="${item.type}"
        data-store-price="${item.price}"
        data-store-item-url="${item.url}"
        type="button"
      >
        ${assetMarkup}
        <span class="sr-only" data-store-item-name>${itemName}</span>
        <span class="store-count-badge" data-store-item-count hidden><span class="sr-only">В корзине: </span><span data-store-item-count-value>0</span></span>
      </button>`;
  };

  /** @param {StoreCategory} category */
  const renderCategory = (category) => {
    /** @type {(item: any) => string} */
    let itemRenderer = renderItem;
    if (category.layout === "profile") {
      itemRenderer = renderProfileItem;
    }

    const renderedItems = category.items.map(itemRenderer).join("");
    const categoryComment = category.comment
      ? `<small class="store-category__comment">${category.comment}</small>`
      : "";

    let categoryClass = "store-category";
    if (category.layout !== "profile") {
      categoryClass += " wrapper";
    }
    if (category.wide) {
      categoryClass += " store-category--wide";
    }

    let itemsMarkup = `<div>${renderedItems}</div>`;
    if (category.wide && category.layout !== "profile") {
      itemsMarkup = `<div class="grid-col-2">${renderedItems}</div>`;
    }

    if (category.layout === "profile") {
      const layoutClass =
        category.profileType === "plashka"
          ? " store-profile-items--plashkas"
          : "";
      itemsMarkup = `
        <div class="wrapper relative store-profile-items-wrapper">
          <div class="store-profile-items${layoutClass} scrollable">
            ${renderedItems}
          </div>
        </div>`;
    }

    const categoryTitle =
      category.layout === "profile"
        ? `${category.title} — ${getPriceMarkup(category.profileUnitPrice)} за шт.`
        : category.title;

    return `
      <article class="${categoryClass}">
        <h5 class="store-category__title">${categoryTitle}</h5>
        ${categoryComment}

        ${itemsMarkup}
      </article>`;
  };

  /** @param {StoreCatalogGroup} group */
  const renderGroup = (group) => `
    <section>
      <h4 class="subtitle">${group.title}</h4>
      
      <div class="store-group grid-col-2">
      ${group.categories.map(renderCategory).join("")}
      </div>
    </section>`;

  categoriesRoot.innerHTML = catalogGroups.map(renderGroup).join("");

  const renderItemCounts = () => {
    const itemCounts = new Map();
    cartItems.forEach((item) => {
      const count = itemCounts.get(item.itemId) ?? 0;
      itemCounts.set(item.itemId, count + 1);
    });

    store.querySelectorAll("[data-store-add]").forEach((addButton) => {
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
      addButton.toggleAttribute("data-store-added", count > 0);
    });
  };

  const replaceCartTextareaPlaceholders = () => {
    const placeholders = /** @type {NodeListOf<HTMLElement>} */ (
      cartList.querySelectorAll("[data-store-cart-field]")
    );
    placeholders.forEach((placeholder) => {
      const cartItemId = placeholder.dataset.storeCartItemId;
      const item = cartItems.find(
        (cartItem) => cartItem.cartItemId === cartItemId
      );
      if (!item?.field) {
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.className = "store-cart__field-input";
      textarea.id = `hehe-store-cart-field-${cartItemId}`;
      textarea.dataset.storeCartField = "";
      if (!cartItemId) {
        return;
      }
      textarea.dataset.storeCartItemId = cartItemId;
      textarea.value = item.fieldValue ?? "";
      placeholder.replaceWith(textarea);
    });
  };

  const renderCart = () => {
    cartCount.textContent = String(cartItems.length);
    cartEmpty.hidden = cartItems.length > 0;
    cartList.hidden = cartItems.length === 0;
    if (checkoutButton instanceof HTMLButtonElement) {
      checkoutButton.disabled = cartItems.length === 0;
    }
    if (clearButton instanceof HTMLButtonElement) {
      clearButton.disabled = cartItems.length === 0;
    }
    if (!cartItems.length) {
      hideCartConfirmations();
    }
    const totals = cartItems.reduce(
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
    const totalLines = [];
    if (totals.coins > 0) {
      totalLines.push(getPriceMarkup(totals.coins));
    }
    if (totals.coupons > 0) {
      totalLines.push(
        `${totals.coupons} ${getRussianNounForm(totals.coupons, couponForms)}`
      );
    }

    cartTotal.hidden = totalLines.length === 0;
    cartTotal.innerHTML = totalLines.length
      ? `<span>Итого:</span><span class="store-cart__total-values">${totalLines
          .map((line) => `<span>${line}</span>`)
          .join('<span aria-hidden="true">+</span>')}</span>`
      : "";
    cartList.innerHTML = cartItems
      .map((item, index) => {
        let preview = "";
        let productClass = "store-cart__product";
        let productMarkup = `<span class="store-cart__name">${item.name}</span>`;
        if (item.url && item.type) {
          preview = renderProfileAsset(item);
          if (item.type === "plashka") {
            productClass += " store-cart__product--plashka";
            productMarkup += preview;
          } else {
            productMarkup = `${preview}${productMarkup}`;
          }
        }

        const field = item.field
          ? `<div class="store-cart__field">
                <label class="store-cart__field-label" for="hehe-store-cart-field-${item.cartItemId}">${escapeHtml(item.field.comment)}</label>
                <div data-store-cart-field data-store-cart-item-id="${item.cartItemId}"></div>
              </div>`
          : "";
        const priceHidden =
          item.payment === "coupon"
            ? ' data-store-price-hidden aria-hidden="true"'
            : "";

        return `
          <li class="store-cart__row">
            <div class="${productClass}">
              ${productMarkup}
            </div>
            <span class="price"${priceHidden}>${getPriceMarkup(item.price)}</span>
            <button
              class="button store-cart__remove"
              data-store-cart-remove
              data-store-cart-index="${index}"
              type="button"
            >
              <i class="material-symbols-sharp" aria-hidden="true">delete</i>
              <span class="sr-only">Удалить позицию</span>
            </button>
            <label class="store-cart__coupon">
              <input
                data-store-cart-coupon
                data-store-cart-index="${index}"
                type="checkbox"
                ${item.payment === "coupon" ? "checked" : ""}
              >
              <span>Плачу купоном</span>
            </label>
            ${field}
          </li>`;
      })
      .join("");
    replaceCartTextareaPlaceholders();
    renderItemCounts();
  };

  const hideCartConfirmations = () => {
    const popovers = /** @type {NodeListOf<HTMLElement>} */ (
      store.querySelectorAll(".store-cart__confirmation")
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
      const value = selector.querySelector("[data-store-profile-value]");
      const options = /** @type {NodeListOf<HTMLInputElement>} */ (
        selector.querySelectorAll("[data-store-profile-option]")
      );
      options.forEach((option) => {
        option.checked = option.value === defaultProfile;
      });
      if (value) {
        value.textContent = defaultProfile || "Выберите профиль";
      }
    });
  };

  const resetCart = () => {
    cartItems.splice(0);
    nextCartItemId = 0;
    resetProfileSelectors();
    setCartStatus("");
    hideCartConfirmations();
    renderCart();
  };

  const checkoutCart = () => {
    const text = buildCheckoutText();
    if (!text) {
      setCartStatus("Выберите профиль, для которого оформляется заказ.");
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

    cart.dataset.open = String(open);
    store.querySelectorAll("[data-store-cart-toggle]").forEach((toggle) => {
      toggle.setAttribute("aria-expanded", String(open));
    });
  };

  cart.addEventListener("close", () => {
    hideCartConfirmations();
    cart.dataset.open = "false";
    store.querySelectorAll("[data-store-cart-toggle]").forEach((toggle) => {
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  store.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target === cart) {
      setCartOpen(false);
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
      return;
    }

    const removeButton = target?.closest("[data-store-cart-remove]");
    if (removeButton instanceof HTMLButtonElement) {
      const itemIndex = Number(removeButton.dataset.storeCartIndex);
      if (Number.isInteger(itemIndex) && itemIndex >= 0) {
        cartItems.splice(itemIndex, 1);
        renderCart();
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
    const field = catalogItemFields.get(itemId);
    /** @type {StoreCartItem} */
    const item = {
      cartItemId: String(nextCartItemId++),
      itemId,
      type: addButton.dataset.storeItemType,
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

  store.addEventListener("input", (event) => {
    const input = event.target;
    const textarea = input;
    if (
      !(textarea instanceof HTMLTextAreaElement) ||
      !textarea.matches("[data-store-cart-field]")
    ) {
      return;
    }

    const item = cartItems.find(
      (cartItem) => cartItem.cartItemId === textarea.dataset.storeCartItemId
    );
    if (item?.field) {
      item.fieldValue = textarea.value;
      item.fieldEdited = true;
    }
  });

  store.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    if (input.matches("[data-store-cart-coupon]")) {
      const itemIndex = Number(input.dataset.storeCartIndex);
      const item = cartItems[itemIndex];
      if (item) {
        item.payment = input.checked ? "coupon" : "coins";
        renderCart();
      }

      return;
    }

    if (!input.matches("[data-store-profile-option]")) {
      return;
    }

    const selector = input.closest("[data-store-profile-selector]");
    if (!(selector instanceof HTMLFieldSetElement)) {
      return;
    }

    updateProfileSelector(selector, input.value);
    const popover = input.closest("[popover]");
    if (popover?.matches(":popover-open")) {
      /** @type {HTMLElement & { hidePopover: () => void }} */ (
        popover
      ).hidePopover();
    }
  });

  renderCart();
  loadCharacters()
    .then(populateProfileSelectors)
    .catch(() => setProfileSelectorStatus("Не удалось загрузить профили"));
};

export default store;
