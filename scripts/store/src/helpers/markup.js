import { escapeHtml, getProfilePickerMarkup } from "@teh/utils";

/**
 * @param {{ name: string, profile: string, label: string, twinks: string[], checked: boolean }} option
 */
export const storeProfileOptionMarkup = ({
  name,
  profile,
  label,
  twinks,
  checked
}) =>
  /* HTML */ `<label
    class="picker__option flex items-center justify-between gap-sm"
  >
    <input
      class="picker__radio sr-only"
      data-profile-picker-option
      type="radio"
      name="${escapeHtml(name)}"
      value="${escapeHtml(profile)}"
      ${checked ? "checked" : ""}
    />
    <span class="flex flex-col min-w-0">
      <strong>${escapeHtml(label)}</strong>
      ${twinks.length ? `<small>${escapeHtml(twinks.join(", "))}</small>` : ""}
    </span>
    <i
      class="mgc mgc-check-core-regular picker__check shrink-0"
      aria-hidden="true"
    ></i>
  </label>`;

/**
 * Returns the store shell with separate CSS classes and JavaScript hooks.
 *
 * @returns {string}
 */
export const storeMarkup = () => `<section class="store relative" data-store>
  <h3 class="sr-only">Магазин</h3>
  <div class="toolbar store__bar">
    <button
      class="button-icon relative"
      data-store-cart-toggle
      type="button"
      aria-haspopup="dialog"
    >
      <i class="mgc mgc-shopping-cart-1-core-regular icon-20" aria-hidden="true"></i>
      <span class="sr-only">Корзина</span>
      <span class="store__count" data-store-cart-count>0</span>
    </button>
  </div>
  <div class="store__catalog flex flex-col flex-nowrap" data-store-categories></div>
  <dialog
    class="cart"
    data-store-cart
    aria-labelledby="store-cart-title"
    closedby="any"
  >
    <div class="cart__panel flex flex-col flex-nowrap w-full">
      <div class="cart__header flex flex-col flex-nowrap gap-sm">
        <div class="cart__bar flex items-center justify-between">
          <h4 class="cart__title" id="store-cart-title">Корзина</h4>
          <button
            class="button-icon"
            data-store-cart-toggle
            type="button"
          >
            <i class="mgc mgc-close-core-regular icon-20" aria-hidden="true"></i>
            <span class="sr-only">Закрыть корзину</span>
          </button>
        </div>
        <div class="pickers gap-sm">
          ${getProfilePickerMarkup({
            id: "store-recipient",
            key: "recipient",
            label: "Покупка для:",
            value: "Загрузка...",
            status: "Загрузка профилей...",
            disabled: true
          })}
          ${getProfilePickerMarkup({
            id: "store-payer",
            key: "payer",
            label: "Списать с:",
            value: "Загрузка...",
            status: "Загрузка профилей...",
            disabled: true
          })}
        </div>
      </div>
      <div class="cart__scroll relative flex flex-col flex-1 w-full">
        <div class="cart__scroll scrollable flex flex-col flex-1 w-full">
          <p class="cart__empty w-full" data-store-cart-empty>Корзина пуста.</p>
          <ol class="cart__list" data-store-cart-list hidden></ol>
          <section aria-labelledby="store-gift-cart-title" data-store-gift-group hidden>
            <h5 class="cart__subtitle" id="store-gift-cart-title">Подарки</h5>
            <ol class="cart__list" data-store-gift-list></ol>
          </section>
        </div>
      </div>
      <div class="cart__footer sticky--bottom items-center gap-sm shrink-0">
        <p class="cart__total flex items-center gap-xs" data-store-cart-total hidden></p>
        <div class="cart__actions cart__actions--footer flex justify-center gap-sm">
          <div>
            <button
              class="button"
              data-store-clear
              type="button"
              popovertarget="store-clear-confirmation"
              aria-haspopup="dialog"
              disabled
            >
              Очистить корзину
            </button>
            <div
              class="cart__confirm flex-col flex-nowrap"
              data-store-confirmation
              id="store-clear-confirmation"
              popover="auto"
              role="dialog"
              aria-label="Подтвердить очистку корзины"
            >
              <p>Все позиции будут удалены.</p>
              <div class="cart__actions flex justify-center gap-sm">
                <button class="button" data-store-clear-confirm type="button">Очистить</button>
                <button class="button" popovertarget="store-clear-confirmation" popovertargetaction="hide" type="button">Отмена</button>
              </div>
            </div>
          </div>
          <div>
            <button
              class="button button--primary"
              data-store-checkout
              type="button"
              popovertarget="store-checkout-confirmation"
              aria-haspopup="dialog"
              aria-describedby="store-cart-status"
              disabled
            >
              Оформить заказ
            </button>
            <div
              class="cart__confirm flex-col flex-nowrap"
              data-store-confirmation
              id="store-checkout-confirmation"
              popover="auto"
              role="dialog"
              aria-label="Подтвердить оформление заказа"
            >
              <p>Заказ заменит весь имеющийся текст в форме ответа, после чего корзина очистится. Оформляем?</p>
              <div class="cart__actions flex justify-center gap-sm">
                <button class="button" data-store-checkout-confirm type="button">Оформляем</button>

                <button class="button" popovertarget="store-checkout-confirmation" popovertargetaction="hide" type="button">Пока нет</button>
              </div>
            </div>
          </div>
        </div>
        <p class="cart__status col-span-full" id="store-cart-status" aria-live="polite"></p>
      </div>
    </div>
  </dialog>
</section>`;

/**
 * @param {{attributes: string, product: string, price: string, fields: string, removeHook: string, coupon?: boolean}} row
 */
export const cartRowMarkup = ({
  attributes,
  product,
  price,
  fields,
  removeHook,
  coupon
}) => `
  <li class="cart__row items-center" ${attributes}>
    ${product}
    <span class="store__price flex items-center${coupon ? " store__price--coupon" : ""}" data-store-cart-price>${price}</span>
    ${
      coupon === undefined
        ? ""
        : `<label class="cart__coupon flex items-center gap-xs"><input data-store-cart-coupon type="checkbox" ${coupon ? "checked" : ""}><small>Плачу купоном</small></label>`
    }
    <button class="button-icon shrink-0" ${removeHook} type="button">
      <i class="mgc mgc-delete-2-core-regular icon-16" aria-hidden="true"></i>
      <span class="sr-only">Удалить позицию</span>
    </button>
    ${fields ? `<div class="cart__details">${fields}</div>` : ""}
  </li>`;

export const storeItemCountMarkup = `<span class="store__count" data-store-item-count hidden><span class="sr-only">В корзине: </span><span data-store-item-count-value>0</span></span>`;

/** @param {string} text */
export const getStoreImageUrl = (text) => {
  try {
    if (!/^(https?:)?\/\/[^\s]+$/i.test(text)) {
      return "";
    }

    return new URL(text, location.href).href;
  } catch {
    return "";
  }
};

/** @param {string} url @param {number} [size] */
export const cartImageMarkup = (url, size = 50) =>
  `<img width="${size}" height="${size}" style="object-fit: contain" loading="lazy" src="${escapeHtml(url)}" alt="">`;

/** @param {string} id @param {string} label @param {string} control */
export const cartFieldMarkup = (id, label, control) => `
  <div class="cart__field flex flex-col col-span-full gap-xs">
    <label class="cart__label" for="${escapeHtml(id)}">${escapeHtml(label)}</label>
    ${control}
  </div>`;
