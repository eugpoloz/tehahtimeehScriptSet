export const storeMarkup = () => `<section class="store relative" data-store>
  <h3 class="sr-only">Магазин</h3>
  <div class="toolbar">
    <button
      class="button store-cart-toggle items-center justify-center"
      data-store-cart-toggle
      type="button"
      aria-controls="store-cart"
      aria-expanded="false"
    >
      <i class="material-symbols-sharp" aria-hidden="true">shopping_cart</i>
      <span class="sr-only">Корзина</span>
      <span class="store-count-badge" data-store-cart-count>0</span>
    </button>
  </div>
  <div class="store-categories flex flex-col flex-nowrap" data-store-categories></div>
  <dialog
    class="store-cart"
    data-store-cart
    id="store-cart"
    closedby="any"
  >
    <div class="store-cart__panel flex flex-col flex-nowrap w-full">
      <div class="store-cart__header flex flex-col flex-nowrap">
        <div class="store-cart__toolbar flex items-center justify-between">
          <h4>Корзина</h4>
          <button
            class="button store-cart__close items-center justify-center"
            data-store-cart-toggle
            type="button"
            aria-controls="store-cart"
            aria-expanded="false"
          >
            <i class="material-symbols-sharp" aria-hidden="true">close</i>
            <span class="sr-only">Закрыть корзину</span>
          </button>
        </div>
        <div class="store-cart__profiles">
          <fieldset class="store-cart__profile" data-store-profile-selector="recipient" disabled>
            <legend id="store-recipient-label">Покупаю для</legend>
            <button
              class="store-cart__profile-trigger flex items-center justify-between gap-xs w-full"
              data-store-profile-trigger
              type="button"
              popovertarget="store-recipient-popover"
              aria-haspopup="dialog"
            >
              <span data-store-profile-value>Загрузка...</span>
              <i class="material-symbols-sharp" aria-hidden="true">keyboard_arrow_down</i>
            </button>
            <div
              class="store-cart__profile-menu popover-custom"
              id="store-recipient-popover"
              popover="auto"
              role="dialog"
              aria-labelledby="store-recipient-label"
            >
              <div class="relative flex flex-col w-full">
                <div class="scrollable flex flex-col w-full">
                  <p class="store-cart__profile-status" data-store-profile-status>Загрузка профилей...</p>
                  <div data-store-profile-options></div>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset class="store-cart__profile" data-store-profile-selector="payer" disabled>
            <legend id="store-payer-label">Платит</legend>
            <button
              class="store-cart__profile-trigger flex items-center justify-between gap-xs w-full"
              data-store-profile-trigger
              type="button"
              popovertarget="store-payer-popover"
              aria-haspopup="dialog"
            >
              <span data-store-profile-value>Загрузка...</span>
              <i class="material-symbols-sharp" aria-hidden="true">keyboard_arrow_down</i>
            </button>
            <div
              class="store-cart__profile-menu popover-custom"
              id="store-payer-popover"
              popover="auto"
              role="dialog"
              aria-labelledby="store-payer-label"
            >
              <div class="relative flex flex-col w-full">
                <div class="scrollable flex flex-col w-full">
                  <p class="store-cart__profile-status" data-store-profile-status>Загрузка профилей...</p>
                  <div data-store-profile-options></div>
                </div>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
      <div class="relative flex flex-col w-full">
        <div class="scrollable flex flex-col w-full">
          <p class="store-cart__empty w-full" data-store-cart-empty>Корзина пуста.</p>
          <ol class="store-cart__list" data-store-cart-list hidden></ol>
        </div>
      </div>
      <div class="store-cart__footer items-center">
        <p class="store-cart__total flex items-center gap-xs" data-store-cart-total hidden></p>
        <div class="store-cart__actions flex justify-center">
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
              class="store-cart__confirmation flex-col flex-nowrap"
              id="store-clear-confirmation"
              popover="auto"
              role="dialog"
              aria-label="Подтвердить очистку корзины"
            >
              <p>Все позиции будут удалены.</p>
              <div class="store-cart__actions flex justify-center">
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
              class="store-cart__confirmation flex-col flex-nowrap"
              id="store-checkout-confirmation"
              popover="auto"
              role="dialog"
              aria-label="Подтвердить оформление заказа"
            >
              <p>Заказ заменит весь имеющийся текст в форме ответа, после чего корзина очистится. Оформляем?</p>
              <div class="store-cart__actions flex justify-center">
                <button class="button" data-store-checkout-confirm type="button">Оформляем</button>

                <button class="button" popovertarget="store-checkout-confirmation" popovertargetaction="hide" type="button">Пока нет</button>
              </div>
            </div>
          </div>
        </div>
        <p class="store-cart__status col-span-full" data-store-cart-status aria-live="polite"></p>
      </div>
    </div>
  </dialog>
</section>`;
