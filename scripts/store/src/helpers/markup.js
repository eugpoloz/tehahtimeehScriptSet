export const storeMarkup = () => `<section class="store" data-store>
  <h3 class="sr-only">Магазин</h3>
  <div class="store-toolbar">
    <button
      class="button store-cart-toggle"
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
  <div class="store-categories" data-store-categories></div>
  <dialog
    class="store-cart"
    data-store-cart
    id="store-cart"
    closedby="any"
  >
    <div class="store-cart__panel">
      <div class="store-cart__header">
        <div class="store-cart__toolbar">
          <h4>Корзина</h4>
          <button
            class="button store-cart__close"
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
              class="store-cart__profile-trigger"
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
              <div class="relative">
                <div class="scrollable">
                  <p class="store-cart__profile-status" data-store-profile-status>Загрузка профилей...</p>
                  <div data-store-profile-options></div>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset class="store-cart__profile" data-store-profile-selector="payer" disabled>
            <legend id="store-payer-label">Платит</legend>
            <button
              class="store-cart__profile-trigger"
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
              <div class="relative">
                <div class="scrollable">
                  <p class="store-cart__profile-status" data-store-profile-status>Загрузка профилей...</p>
                  <div data-store-profile-options></div>
                </div>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
      <div class="relative">
        <div class="scrollable">
          <p class="store-cart__empty" data-store-cart-empty>Корзина пуста.</p>
          <ol class="store-cart__list" data-store-cart-list hidden></ol>
        </div>
      </div>
      <div class="store-cart__footer">
        <p class="store-cart__total" data-store-cart-total hidden></p>
        <div class="store-cart__actions">
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
              class="store-cart__confirmation"
              id="store-clear-confirmation"
              popover="auto"
              role="dialog"
              aria-label="Подтвердить очистку корзины"
            >
              <p>Все позиции будут удалены.</p>
              <div class="store-cart__actions">
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
              class="store-cart__confirmation"
              id="store-checkout-confirmation"
              popover="auto"
              role="dialog"
              aria-label="Подтвердить оформление заказа"
            >
              <p>Заказ заменит весь имеющийся текст в форме ответа, после чего корзина очистится. Оформляем?</p>
              <div class="store-cart__actions">
                <button class="button" data-store-checkout-confirm type="button">Оформляем</button>

                <button class="button" popovertarget="store-checkout-confirmation" popovertargetaction="hide" type="button">Пока нет</button>
              </div>
            </div>
          </div>
        </div>
        <p class="store-cart__status" data-store-cart-status aria-live="polite"></p>
      </div>
    </div>
  </dialog>
</section>`;
