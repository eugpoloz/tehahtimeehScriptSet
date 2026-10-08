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
      <label class="char-form__label flex items-center gap-sm ms-auto">
        <input type="checkbox" id="char-form-gender-f" />
        <strong>Женщина</strong>
      </label>
    </div>
    <div class="char-form__field flex flex-col gap-xs">
      <label class="char-form__control flex flex-col gap-xs">
        <span class="char-form__label flex items-center gap-sm">
          <strong>Name</strong>
          <small class="char-form__hint">Латиницей (имя профиля)</small>
        </span>
        <input
          type="text"
          class="char-form__input w-full"
          id="char-form-name"
          required
          placeholder="Name Surname"
        />
      </label>
    </div>
    <div class="char-form__field flex flex-col gap-xs">
      <label class="char-form__control flex flex-col gap-xs">
        <span class="char-form__label flex items-center gap-sm">
          <strong>Имя</strong>
          <small class="char-form__hint">Кириллицей</small>
        </span>
        <input
          type="text"
          class="char-form__input w-full"
          id="char-form-ru"
          required
          placeholder="Имярек Имярекович"
        />
      </label>
    </div>
    <div class="char-form__field flex flex-col gap-xs">
      <label class="char-form__control flex flex-col gap-xs">
        <span class="char-form__label flex items-center gap-sm">
          <strong>Дата рождения</strong>
          <small class="char-form__hint">ДД.ММ.ГГГГ</small>
        </span>
        <input
          type="text"
          class="char-form__input w-full"
          id="char-form-dob"
          placeholder="13.12.1989"
        />
      </label>
    </div>
    <div class="char-form__field flex flex-col gap-xs">
      <label class="char-form__control flex flex-col gap-xs">
        <span class="char-form__label flex items-center gap-sm">
          <strong>FC</strong>
          <small class="char-form__hint">Внешность латиницей</small>
        </span>
        <input
          type="text"
          class="char-form__input w-full"
          id="char-form-fc"
          required
          placeholder="Name Surname"
        />
      </label>
    </div>
    <div
      class="char-form__field char-form__field--profile flex flex-col gap-xs"
      id="char-form-id-field"
    >
      <div
        class="char-form__control flex flex-col gap-xs flex-1 justify-between"
      >
        <label
          class="char-form__label flex items-center gap-sm"
          for="char-form-id"
        >
          <strong>ID профиля</strong>
          <small class="char-form__hint">Только цифры</small>
        </label>
        <div class="char-form__reference flex items-center gap-sm">
          <input
            type="text"
            class="char-form__input w-full"
            id="char-form-id"
            required
            placeholder="00"
          />
          <a
            class="char-form__link shrink-0"
            id="char-form-id-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Проверить профиль"
            hidden
            >↗</a
          >
        </div>
      </div>
    </div>
    <div
      class="char-form__field char-form__field--application grid-col-4"
      id="char-form-anketa-field"
    >
      <div class="char-form__control flex flex-col gap-xs justify-between">
        <label
          class="char-form__label flex items-center gap-sm"
          for="char-form-anketa"
        >
          <strong>Анкета</strong>
          <small class="char-form__hint" id="char-form-anketa-hint"
            >ID темы</small
          >
        </label>
        <div class="char-form__reference flex items-center gap-sm">
          <input
            type="text"
            class="char-form__input w-full"
            id="char-form-anketa"
            required
            placeholder="00"
          />
          <a
            class="char-form__link shrink-0"
            id="char-form-anketa-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Проверить анкету"
            hidden
            >↗</a
          >
        </div>
      </div>
    </div>
    <div
      class="char-form__field char-form__field--main flex flex-col gap-xs"
      id="char-form-main-optional"
    >
      <div class="char-form__checks flex items-center gap-sm">
        <label class="char-form__toggle flex items-center">
          <input
            type="checkbox"
            id="char-form-main-is-main"
            checked
            aria-controls="char-form-main-body"
          />
        </label>
        <label for="char-form-main-is-main">
          <strong class="char-form__label flex items-center gap-sm"
            >Основной профиль</strong
          >
        </label>
      </div>
      <div class="char-form__main-profile" id="char-form-main-body">
        <input
          type="text"
          class="char-form__input w-full"
          id="char-form-main"
          list="char-form-main-list"
          placeholder="Laurent Ambrose"
          aria-label="Имя основного профиля"
        />
        <datalist id="char-form-main-list"></datalist>
      </div>
    </div>
    ${collectionMarkup}
    <div class="char-form__field flex flex-col gap-xs">
      <strong class="char-form__label flex items-center gap-sm">Кто</strong>
      <div class="flex flex-col gap-xs">
        <div
          class="char-form__options flex gap-sm"
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
          class="char-form__options flex gap-sm"
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
      </div>
    </div>
    <div class="char-form__field flex flex-col gap-xs">
      <strong class="char-form__label flex items-center gap-sm"
        >Принадлежность</strong
      >
      <div class="char-form__options flex gap-sm" id="char-form-aff">
        <label class="char-form__option flex items-center gap-xs"
          ><input type="checkbox" name="affiliations" value="lawenforcement" />
          полиция</label
        >
        <label class="char-form__option flex items-center gap-xs"
          ><input type="checkbox" name="affiliations" value="mafia" />
          синдикат</label
        >
      </div>
    </div>
    <div class="char-form__field flex flex-col gap-xs col-span-full">
      <label class="char-form__toggle flex items-center gap-sm">
        <input type="checkbox" id="char-form-cursed" />
        <span id="char-form-cursed-label">Проклят</span>
      </label>
    </div>
    <div class="char-form__field flex flex-col gap-xs col-span-full">
      <label class="char-form__control flex flex-col gap-xs">
        <strong class="char-form__label flex items-center gap-sm"
          >Описание</strong
        >
        <textarea
          class="char-form__input char-form__description"
          id="char-form-desc"
          placeholder="Чем занимается?"
        ></textarea>
      </label>
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
        <p class="char-accept__errors" id="anfc-errors" role="alert" hidden></p>
        <form
          class="char-form grid-col-4 relative"
          id="char-form"
          autocomplete="off"
          novalidate
        >
          ${getCharacterFieldsMarkup(
            /* HTML */ `<div
              class="char-form__field flex flex-col gap-xs col-span-full"
              id="anfc-collection"
            >
              <label
                class="char-form__control flex flex-col gap-xs"
                for="anfc-address"
              >
                <strong class="char-form__label">Адрес личной страницы</strong>
                <input
                  type="text"
                  class="char-form__input w-full"
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
          <footer
            class="char-form__footer sticky--bottom shrink-0 flex flex-col gap-sm col-span-full"
          >
            <p
              class="char-form__status char-accept__status char-accept__status--error"
              id="char-form-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            ></p>
            <div class="char-form__actions flex justify-end gap-xs">
              <button type="reset" class="button" id="char-form-reset" disabled>
                Сбросить изменения
              </button>
              <button type="submit" class="button button--primary">
                Добавить в конфиг
              </button>
            </div>
          </footer>
        </form>
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
          class="char-accept__controls sticky-bottom shrink-0 flex flex-col gap-sm"
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

/** @param {string[]} names @returns {string} */
export const getMainProfileOptionsMarkup = (names) =>
  names
    .map((name) => {
      const value = name
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
      return `<option value="${value}"></option>`;
    })
    .join("");
