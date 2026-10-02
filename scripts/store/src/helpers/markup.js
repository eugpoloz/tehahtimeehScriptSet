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
      <i class="material-symbols-sharp icon-20" aria-hidden="true">shopping_cart</i>
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
            <i class="material-symbols-sharp icon-20" aria-hidden="true">close</i>
            <span class="sr-only">Закрыть корзину</span>
          </button>
        </div>
        <div class="cart__profiles gap-sm">
          <fieldset class="picker" data-store-profile-selector="recipient" disabled>
            <legend class="picker__label" id="store-recipient-label">Покупаю для</legend>
            <button
              class="button picker__trigger flex items-center justify-between gap-xs w-full"
              data-store-profile-trigger
              type="button"
              popovertarget="store-recipient-popover"
              aria-haspopup="dialog"
            >
              <span class="picker__value" data-store-profile-value>Загрузка...</span>
              <i class="material-symbols-sharp icon-16 shrink-0" aria-hidden="true">keyboard_arrow_down</i>
            </button>
            <div
              class="picker__menu popover-custom"
              id="store-recipient-popover"
              popover="auto"
              role="dialog"
              aria-labelledby="store-recipient-label"
            >
              <div class="picker__body relative flex flex-col w-full">
                <div class="picker__scroll scrollable flex flex-col flex-1 w-full">
                  <p class="picker__status" data-store-profile-status>Загрузка профилей...</p>
                  <div class="picker__options flex flex-col" data-store-profile-options></div>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset class="picker" data-store-profile-selector="payer" disabled>
            <legend class="picker__label" id="store-payer-label">Платит</legend>
            <button
              class="button picker__trigger flex items-center justify-between gap-xs w-full"
              data-store-profile-trigger
              type="button"
              popovertarget="store-payer-popover"
              aria-haspopup="dialog"
            >
              <span class="picker__value" data-store-profile-value>Загрузка...</span>
              <i class="material-symbols-sharp icon-16 shrink-0" aria-hidden="true">keyboard_arrow_down</i>
            </button>
            <div
              class="picker__menu popover-custom"
              id="store-payer-popover"
              popover="auto"
              role="dialog"
              aria-labelledby="store-payer-label"
            >
              <div class="picker__body relative flex flex-col w-full">
                <div class="picker__scroll scrollable flex flex-col flex-1 w-full">
                  <p class="picker__status" data-store-profile-status>Загрузка профилей...</p>
                  <div class="picker__options flex flex-col" data-store-profile-options></div>
                </div>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
      <div class="cart__scroll relative flex flex-col flex-1 w-full">
        <div class="cart__scroll scrollable flex flex-col flex-1 w-full">
          <p class="cart__empty w-full" data-store-cart-empty>Корзина пуста.</p>
          <ol class="cart__list" data-store-cart-list hidden></ol>
        </div>
      </div>
      <div class="cart__footer items-center gap-sm shrink-0">
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
        <p class="cart__status col-span-full" data-store-cart-status aria-live="polite"></p>
      </div>
    </div>
  </dialog>
</section>`;
