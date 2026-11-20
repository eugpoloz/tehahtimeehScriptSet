import {
  escapeHtml,
  getProfilePickerMarkup,
  getProfilePickerOptionsMarkup
} from "@teh/utils";
import {
  cartFieldMarkup,
  cartImageMarkup,
  cartRowMarkup,
  getStoreImageUrl,
  storeItemCountMarkup
} from "../helpers/markup";
import { giftOrder, vaultAddress } from "../helpers/gift-order";

/** @param {HTMLElement} source @param {string} customGiftMarkup @param {number} unitPrice @param {(price:number)=>string} getPriceMarkup @param {HTMLElement} catalog @param {HTMLElement} list
 * @param {{url?:string,label?:string}[]} items @param {()=>void} update */
export const setupGifts = (
  source,
  customGiftMarkup,
  unitPrice,
  getPriceMarkup,
  catalog,
  list,
  items,
  update
) => {
  /** @type {(import("../helpers/gift-order").Gift & {itemId:string, price:number, coupon:boolean, custom:boolean, imageDraft:string, imageLabel:string})[]} */
  const gifts = [];
  /** @type {import("../helpers/gift-order").Profiles} */
  let profiles = {};
  const title = escapeHtml(source.dataset.categoryName ?? "Готовые подарки");
  const sectionTitle = escapeHtml(
    source.closest("[data-group-name]")?.getAttribute("data-group-name") ??
      "Подарки"
  );
  const comment = source
    .querySelector("[data-category-comment]")
    ?.innerHTML.trim();
  const note = comment ? `<small class="catalog__note">${comment}</small>` : "";
  const wide = source.hasAttribute("data-category-wide")
    ? " col-span-full"
    : "";
  const priceMarkup = getPriceMarkup(unitPrice);
  catalog.insertAdjacentHTML(
    "beforeend",
    `<section data-gift-catalog>
      <h4 class="subtitle">${sectionTitle}</h4>
      <div class="store__group">
        ${customGiftMarkup}
        <article class="catalog relative catalog--assets${wide}">
          <h5 class="catalog__title relative flex items-center">${title} — ${priceMarkup} за шт.</h5>
          ${note}
          <div class="wrapper relative catalog__frame">
            <div class="catalog__items scrollable gap-sm"
              style="--size-gift: 6rem; grid-template-columns: repeat(auto-fill, var(--size-gift))"
              data-gift-tiles></div>
          </div>
        </article>
      </div>
    </section>`
  );
  const editor = /** @type {HTMLElement} */ (
    catalog.querySelector("[data-gift-catalog]")
  );
  const tiles = /** @type {HTMLElement} */ (
    editor.querySelector("[data-gift-tiles]")
  );
  tiles.innerHTML = items
    .map((item, index) => {
      if (item.label) {
        return `<p class="catalog__subtitle col-span-full">${escapeHtml(item.label)}</p>`;
      }

      const url = getStoreImageUrl((item.url ?? "").replace(/&amp;/g, "&"));
      if (!url) {
        return "";
      }

      return `<button class="button store__item store__asset flex items-center justify-center"
        style="width: var(--size-gift); height: var(--size-gift); padding: var(--size-xs)"
        type="button" data-store-item-id="gift-${index}" data-gift-url="${escapeHtml(url)}">
        <img width="50" height="50" style="object-fit: contain"
          loading="lazy" src="${escapeHtml(url)}" alt="Добавить подарок ${index + 1}">
        ${storeItemCountMarkup}
      </button>`;
    })
    .join("");

  const render = () => {
    list.querySelectorAll("[data-gift-slot]").forEach((row) => row.remove());
    const names = Object.keys(profiles).filter((name) =>
      vaultAddress(profiles, name)
    );
    const rows = gifts
      .map((gift, index) => {
        const id = `store-gift-${index}`;
        const imageId = `${id}-image`;
        const imageField = gift.custom
          ? cartFieldMarkup(
              imageId,
              gift.imageLabel,
              `<input class="cart__input" type="url" id="${imageId}" data-gift-field="image" aria-required="true" aria-invalid="${!gift.url}" value="${escapeHtml(gift.imageDraft)}">`
            )
          : "";
        const image = gift.url ? cartImageMarkup(gift.url, 20) : "";
        const product = `<div class="cart__product flex items-center gap-sm">
          <div class="icon-28 flex items-center justify-center shrink-0" data-gift-preview>${image}</div>
          <strong class="cart__name">Подарок</strong>
        </div>`;
        const recipientPicker = getProfilePickerMarkup({
          id: `${id}-recipient`,
          key: "gift-recipient",
          label: "Кому",
          value: gift.recipient || "Выберите персонажа",
          disabled: !names.length
        });
        return cartRowMarkup({
          attributes: `data-gift-slot="${index}"`,
          product,
          price: getPriceMarkup(gift.price),
          removeHook: "data-drop",
          coupon: gift.coupon,
          fields: `${imageField}
          <div class="pickers col-span-full gap-sm">
            <div class="flex flex-col min-w-0 gap-xs">
              ${recipientPicker}
              <label class="cart__field flex flex-col gap-xs">
                <span class="cart__label">Подпись</span>
                <input class="cart__input min-w-0" type="text" data-gift-field="signature" value="${escapeHtml(gift.signature)}">
              </label>
            </div>
            <label class="cart__field flex flex-col min-w-0 gap-xs">
              <span class="cart__label">Сообщение</span>
              <textarea class="cart__input flex-1 min-w-0" data-gift-field="message">${escapeHtml(gift.message)}</textarea>
            </label>
          </div>`
        });
      })
      .join("");
    list.insertAdjacentHTML("beforeend", rows);
    list.querySelectorAll("[data-gift-slot]").forEach((row, index) => {
      row
        .querySelector("[data-profile-picker-trigger]")
        ?.setAttribute(
          "aria-invalid",
          String(!vaultAddress(profiles, gifts[index].recipient))
        );
      const options = row.querySelector("[data-profile-picker-options]");
      if (options) {
        options.innerHTML = getProfilePickerOptionsMarkup(
          names,
          `store-gift-${index}-recipient`,
          gifts[index].recipient
        );
      }
    });
  };
  editor.addEventListener("click", (e) => {
    const button = e.target instanceof Element && e.target.closest("button");
    if (!button || !button.matches("[data-gift-url],[data-custom-add]")) {
      return;
    }

    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const itemId = button.dataset.storeItemId;
    if (!itemId) {
      return;
    }

    const custom = button.hasAttribute("data-custom-add");
    const url = getStoreImageUrl(button.dataset.giftUrl ?? "");
    gifts.push({
      itemId,
      url,
      price: custom ? Number(button.dataset.storePrice) : unitPrice,
      coupon: false,
      custom,
      imageDraft: "",
      imageLabel: button.dataset.giftImageLabel || "Ссылка на картинку:",
      recipient: "",
      message: "",
      signature: window.UserLogin ?? ""
    });

    render();
    update();
  });
  list.addEventListener("input", (e) => {
    const field = e.target;
    if (!(
      field instanceof HTMLInputElement ||
      field instanceof HTMLSelectElement ||
      field instanceof HTMLTextAreaElement
    )) {
      return;
    }

    const row = field.closest("[data-gift-slot]");
    const slot = gifts[Number(row?.getAttribute("data-gift-slot"))];
    if (
      slot &&
      field instanceof HTMLInputElement &&
      field.matches("[data-store-cart-coupon]")
    ) {
      slot.coupon = field.checked;
      row
        ?.querySelector("[data-store-cart-price]")
        ?.classList.toggle("store__price--coupon", slot.coupon);
      update();
      return;
    }

    const key = field.dataset.giftField;
    if (slot && field.matches("[data-profile-picker-option]")) {
      slot.recipient = field.value;
      row
        ?.querySelector("[data-profile-picker-trigger]")
        ?.setAttribute(
          "aria-invalid",
          String(!vaultAddress(profiles, slot.recipient))
        );
      const value = row?.querySelector("[data-profile-picker-value]");
      if (value) {
        value.textContent = field.value;
      }
      update();
      return;
    }

    if (slot && key === "image") {
      slot.imageDraft = field.value;
      const url = getStoreImageUrl(field.value.trim());
      field.setAttribute("aria-invalid", String(!url));
      if (slot.url !== url) {
        slot.url = url;
        const image = row?.querySelector("[data-gift-preview]");
        if (image) {
          image.innerHTML = url ? cartImageMarkup(url, 20) : "";
        }
      }
      update();
      return;
    }

    if (slot && (key === "signature" || key === "message")) {
      slot[key] = field.value;
    }
  });
  list.addEventListener("click", (e) => {
    const button = e.target instanceof Element && e.target.closest("button");
    const row =
      button &&
      button.matches("[data-drop]") &&
      button.closest("[data-gift-slot]");
    if (!row) {
      return;
    }

    gifts.splice(Number(row.getAttribute("data-gift-slot")), 1);
    render();
    update();
  });
  list.addEventListener(
    "error",
    (e) => {
      if (
        e.target instanceof HTMLImageElement &&
        e.target.closest("[data-gift-slot]")
      ) {
        e.target.alt = "Не удалось загрузить изображение";
      }
    },
    true
  );
  render();
  return {
    get itemIds() {
      return gifts.map((gift) => gift.itemId);
    },
    get count() {
      return gifts.length;
    },
    get total() {
      return gifts.reduce(
        (total, gift) => total + (gift.coupon ? 0 : gift.price),
        0
      );
    },
    get couponCount() {
      return gifts.filter((gift) => gift.coupon).length;
    },
    get hasInvalidImage() {
      return gifts.some((gift) => !gift.url);
    },
    get hasMissingRecipient() {
      return gifts.some((gift) => !vaultAddress(profiles, gift.recipient));
    },
    /** @param {string} blockBreak */
    order: (blockBreak) => giftOrder(gifts, profiles, blockBreak),
    /** @param {typeof profiles} registry */
    setProfiles(registry) {
      profiles = registry;
      render();
    },
    reset() {
      gifts.length = 0;
      render();
    }
  };
};
