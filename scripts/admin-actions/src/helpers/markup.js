import { getProfilePickerMarkup } from "@teh/utils";

const externalLinkIcon = /* HTML */ `<svg
  class="icon-16"
  viewBox="0 0 24 24"
  aria-hidden="true"
>
  <path
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    d="M17 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h6m9 2V4h-5m-5 10 9.5-9.5"
  />
</svg>`;

/** @param {string} [collectionMarkup] @returns {string} */
const getCharacterFieldsMarkup = (collectionMarkup = "") =>
  /* HTML */ `<fieldset class="char-form__fields" id="char-form-fields">
    <div class="char-form__flags flex items-center gap-sm col-span-full">
      <label class="char-form__toggle flex items-center gap-sm">
        <input
          type="checkbox"
          id="char-form-npc"
          aria-controls="char-form-id-field char-form-main-optional"
        />
        <span>NPC</span>
      </label>
    </div>
    <div
      class="char-form__field char-form__field--application subgrid min-w-0"
      id="char-form-anketa-field"
    >
      <div class="char-form__control subgrid col-span-full min-w-0 row-gap-xs">
        <label
          class="char-form__label flex items-center gap-sm col-span-full flex-wrap"
          for="char-form-anketa"
        >
          <strong>Анкета</strong>
          <small class="char-form__hint" id="char-form-anketa-hint"
            >ID темы</small
          >
        </label>
        <div class="char-form__reference flex gap-sm col-span-full min-w-0">
          <input
            type="text"
            class="char-form__input w-full min-w-0"
            id="char-form-anketa"
            required
            placeholder="00"
          />
          <a
            class="button char-form__link flex items-center justify-center shrink-0"
            id="char-form-anketa-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Проверить анкету"
            >${externalLinkIcon}</a
          >
        </div>
      </div>
    </div>
    <div
      class="char-form__field char-form__field--profile subgrid min-w-0"
      id="char-form-id-field"
    >
      <div class="char-form__control subgrid col-span-full min-w-0 row-gap-xs">
        <label
          class="char-form__label flex items-center gap-sm col-span-full flex-wrap"
          for="char-form-id"
        >
          <strong>ID профиля</strong>
          <small class="char-form__hint">Только цифры</small>
        </label>
        <div class="char-form__reference flex gap-sm col-span-full min-w-0">
          <input
            type="text"
            class="char-form__input w-full min-w-0"
            id="char-form-id"
            required
            placeholder="00"
          />
          <a
            class="button char-form__link flex items-center justify-center shrink-0"
            id="char-form-id-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Проверить профиль"
            >${externalLinkIcon}</a
          >
        </div>
      </div>
    </div>
    <div
      class="char-form__field char-form__field--main flex flex-col gap-xs min-w-0"
      id="char-form-main-optional"
    >
      <div
        class="char-form__checks char-form__control flex items-center gap-sm min-w-0"
      >
        <label class="char-form__toggle flex items-center">
          <input
            type="checkbox"
            id="char-form-main-is-main"
            checked
            aria-controls="char-form-main-body"
          />
        </label>
        <label for="char-form-main-is-main">
          <strong class="char-form__label flex items-center gap-sm flex-wrap"
            >Это основной профиль</strong
          >
        </label>
      </div>
      <div class="pickers gap-sm" id="char-form-main-body">
        <input type="hidden" id="char-form-main" />
        ${getProfilePickerMarkup({
          id: "char-form-main-picker",
          label: "Имя основного профиля",
          hideLabel: true,
          disabled: true
        })}
      </div>
    </div>
    <div class="char-form__names subgrid col-span-full">
      <div class="char-form__field flex flex-col min-w-0">
        <label class="char-form__control flex flex-col gap-xs min-w-0">
          <span class="char-form__label flex items-center gap-sm flex-wrap">
            <strong>Name</strong>
            <small class="char-form__hint">Латиницей (имя профиля)</small>
          </span>
          <input
            type="text"
            class="char-form__input w-full min-w-0"
            id="char-form-name"
            required
            placeholder="Name Surname"
          />
        </label>
      </div>
      <div class="char-form__field flex flex-col min-w-0">
        <label class="char-form__control flex flex-col gap-xs min-w-0">
          <span class="char-form__label flex items-center gap-sm flex-wrap">
            <strong>Имя</strong>
            <small class="char-form__hint">Кириллицей</small>
          </span>
          <input
            type="text"
            class="char-form__input w-full min-w-0"
            id="char-form-ru"
            required
            placeholder="Имярек Имярекович"
          />
        </label>
      </div>
      <div class="char-form__field flex flex-col min-w-0">
        <label class="char-form__control flex flex-col gap-xs min-w-0">
          <span class="char-form__label flex items-center gap-sm flex-wrap">
            <strong>FC</strong>
            <small class="char-form__hint">Внешность латиницей</small>
          </span>
          <input
            type="text"
            class="char-form__input w-full min-w-0"
            id="char-form-fc"
            required
            placeholder="Name Surname"
          />
        </label>
      </div>
    </div>
    <div class="char-form__dates subgrid col-span-full row-gap-xs">
      <div
        class="char-form__field char-form__date-field char-form__date-field--birth char-form__control subgrid min-w-0"
      >
        <label
          class="char-form__label flex items-center col-span-full flex-wrap"
          for="char-form-dob"
        >
          <strong>Дата рождения</strong>
        </label>
        <input
          type="date"
          class="char-form__input w-full col-span-full min-w-0"
          id="char-form-dob"
          min="0001-01-01"
          max="9999-12-31"
        />
      </div>
      <div
        class="char-form__field char-form__date-field char-form__date-field--age char-form__control subgrid min-w-0"
      >
        <strong
          class="char-form__label flex items-center col-span-full flex-wrap"
          >Возраст</strong
        >
        <span
          class="flex items-center col-span-full"
          id="char-form-age-preview"
          aria-live="polite"
          >—</span
        >
      </div>
      <div
        class="char-form__field char-form__date-field char-form__date-field--alternative subgrid min-w-0"
      >
        <div
          class="char-form__checks char-form__control flex items-center gap-sm col-span-full min-w-0"
        >
          <label class="char-form__toggle flex items-center">
            <input
              type="checkbox"
              id="char-form-dob-alt-enabled"
              aria-controls="char-form-dob-alt-body"
              aria-expanded="false"
            />
          </label>
          <label for="char-form-dob-alt-enabled">
            <strong class="char-form__label flex items-center gap-sm flex-wrap"
              >Дополнительная дата рождения</strong
            >
          </label>
        </div>
        <div
          class="char-form__date-alt-body subgrid col-span-full"
          id="char-form-dob-alt-body"
          hidden
        >
          <input
            type="date"
            class="char-form__input char-form__date-alt-input w-full min-w-0"
            id="char-form-dob-alt"
            min="0001-01-01"
            max="9999-12-31"
            aria-label="Дополнительная дата рождения"
            disabled
          />
          <button
            class="button char-form__swap flex items-center justify-center"
            type="button"
            id="char-form-swap-dates"
            aria-label="Поменять даты местами"
            title="Поменять даты местами"
          >
            <i class="material-symbols-sharp icon-16" aria-hidden="true"
              >swap_horiz</i
            >
          </button>
        </div>
      </div>
    </div>
    ${collectionMarkup}
    <div class="char-form__field flex flex-col gap-xs min-w-0">
      <label
        class="char-form__label flex items-center flex-wrap"
        for="char-form-desc"
      >
        <strong>Описание</strong>
      </label>
      <textarea
        class="char-form__input char-form__description min-w-0 flex-1"
        id="char-form-desc"
        placeholder="Чем занимается?"
      ></textarea>
    </div>
    <div
      class="char-form__field char-form__field--who subgrid min-w-0 row-gap-xs content-start"
    >
      <div
        class="char-form__who-heading flex items-center gap-sm col-span-full flex-wrap"
      >
        <strong class="char-form__label flex items-center gap-sm flex-wrap"
          >Кто</strong
        >
        <label class="char-form__toggle flex items-center gap-xs">
          <input type="checkbox" id="char-form-gender-f" />
          <small><strong>окончания женского рода</strong></small>
        </label>
      </div>
      <div class="flex flex-col gap-xs col-span-full">
        <div
          class="char-form__options flex gap-sm flex-wrap"
          id="char-form-who-nature"
          role="radiogroup"
          aria-label="Тип"
        >
          <label class="char-form__option flex items-center gap-xs"
            ><input type="radio" name="who-nature" value="human" checked />
            человек</label
          >
          <label class="char-form__option flex items-center gap-xs"
            ><input type="radio" name="who-nature" value="hybrid" />
            полукровка</label
          >
          <label class="char-form__option flex items-center gap-xs"
            ><input type="radio" name="who-nature" value="creature" />
            существо</label
          >
          <label class="char-form__option flex items-center gap-xs"
            ><input type="radio" name="who-nature" value="other" /> ???</label
          >
        </div>
        <div
          class="char-form__options flex gap-sm flex-wrap"
          id="char-form-who-magic"
          role="group"
          aria-label="Магия"
        >
          <label class="char-form__option flex items-center gap-xs"
            ><input type="checkbox" name="who-magic" value="magician" />
            <span id="char-form-magician-label">волшебник</span></label
          >
          <label class="char-form__option flex items-center gap-xs"
            ><input type="checkbox" name="who-magic" value="hedgewitch" />
            хедж-ведьма</label
          >
        </div>
        <div class="char-form__options flex gap-sm flex-wrap">
          <label class="char-form__option flex items-center gap-xs">
            <input type="checkbox" id="char-form-cursed" />
            <span id="char-form-cursed-label">Проклят</span>
          </label>
          <label class="char-form__option flex items-center gap-xs">
            <input type="checkbox" id="char-form-alien" />
            <span>Из другого мира</span>
          </label>
        </div>
      </div>
    </div>
    <div
      class="char-form__field char-form__field--affiliations flex flex-col gap-xs min-w-0"
    >
      <strong class="char-form__label flex items-center gap-sm flex-wrap"
        >Принадлежность</strong
      >
      <div class="char-form__options flex gap-sm flex-wrap" id="char-form-aff">
        <label class="char-form__option flex items-center gap-xs"
          ><input type="checkbox" name="affiliations" value="lawenforcement" />
          полиция</label
        >
        <label class="char-form__option flex items-center gap-xs"
          ><input type="checkbox" name="affiliations" value="mafia" />
          синдикат</label
        >
        <label class="char-form__option flex items-center gap-xs"
          ><input type="checkbox" name="affiliations" value="knossos" />
          университет</label
        >
      </div>
    </div>
  </fieldset>`;

/** Common character fields; callers supply the form and workflow controls. @returns {string} */
export const getCharacterFormMarkup = () => getCharacterFieldsMarkup();

/** Acceptance dialog around the shared fields. @returns {string} */
export const getConfigFormMarkup = () =>
  /* HTML */ `<dialog
      class="char-accept"
      id="accept-new-full-character-dialog"
      closedby="any"
      aria-labelledby="anfc-dialog-title"
    >
      <div class="content">
        <article class="toolbar sticky">
          <h2 id="anfc-dialog-title">Новый персонаж</h2>
          <div class="actions">
            <button type="button" data-close-acceptance class="button-icon">
              <span class="sr-only">Закрыть</span>
              <i class="material-symbols-sharp icon-20" aria-hidden="true"
                >close</i
              >
            </button>
          </div>
        </article>
        <p class="char-accept__notes" id="anfc-notes"></p>
        <p
          class="char-accept__errors text-error"
          id="anfc-errors"
          role="alert"
          hidden
        ></p>
        <form
          class="char-form relative"
          id="char-form"
          autocomplete="off"
          novalidate
        >
          ${getCharacterFieldsMarkup(
            /* HTML */ `<div
              class="char-form__field flex flex-col col-span-full min-w-0"
              id="anfc-collection"
            >
              <label
                class="char-form__control flex flex-col gap-xs min-w-0"
                for="anfc-address"
              >
                <strong class="char-form__label">Адрес личной страницы</strong>
                <input
                  type="text"
                  class="char-form__input w-full min-w-0"
                  id="anfc-address"
                  maxlength="48"
                  aria-describedby="anfc-address-hint"
                />
                <small class="char-form__hint" id="anfc-address-hint"
                  >После /pages/: латиница, цифры, дефис и подчёркивание, до 48
                  символов.</small
                >
              </label>
            </div>`
          )}
          <p
            class="char-form__status char-accept__status col-span-full"
            id="char-form-status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          ></p>
        </form>
        <footer class="char-form__footer sticky--bottom shrink-0">
          <div class="char-form__actions flex justify-end gap-xs">
            <button
              type="reset"
              form="char-form"
              class="button"
              id="char-form-reset"
              disabled
            >
              Сбросить изменения
            </button>
            <button
              type="submit"
              form="char-form"
              class="button button--primary"
            >
              Добавить в конфиг
            </button>
          </div>
        </footer>
      </div>
    </dialog>
    <dialog
      class="char-accept char-accept--progress"
      id="anfc-progress-dialog"
      closedby="any"
      aria-labelledby="anfc-progress-title"
    >
      <div class="content">
        <article class="toolbar sticky">
          <h2 id="anfc-progress-title">Принятие персонажа</h2>
          <div class="actions">
            <button type="button" data-close-acceptance class="button-icon">
              <span class="sr-only">Закрыть</span>
              <i class="material-symbols-sharp icon-20" aria-hidden="true"
                >close</i
              >
            </button>
          </div>
        </article>
        <ol
          class="char-accept__progress"
          id="anfc-progress"
          aria-live="polite"
        ></ol>
        <div
          class="char-accept__controls sticky--bottom shrink-0 flex flex-col gap-sm"
        >
          <p
            class="char-accept__status"
            id="anfc-progress-status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          ></p>
          <label
            class="flex items-center gap-sm"
            id="anfc-letter-review"
            hidden
          >
            <input type="checkbox" id="anfc-letter-resend" />
            <span
              >Проверил
              <a id="anfc-letter-link" target="_blank" rel="noopener">тему</a>:
              письмо не опубликовано. Разрешаю повторную отправку.</span
            >
          </label>
          <div class="char-form__actions flex justify-end gap-xs">
            <button type="button" class="button" id="anfc-retry" hidden>
              Проверить сохранение
            </button>
            <button type="button" class="button" data-close-acceptance>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </dialog>`;
