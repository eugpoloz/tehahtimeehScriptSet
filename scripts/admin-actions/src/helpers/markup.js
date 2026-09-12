/** Returns the config form markup. @returns {string} */
export const getConfigFormMarkup = () => `
<dialog
  class="anfc-dialog"
  id="accept-new-full-character-dialog"
  closedby="any"
  aria-labelledby="anfc-dialog-title"
>
  <div class="content">
  <article class="toolbar sticky">
    <h2 id="anfc-dialog-title">Новый персонаж</h2>
    <div class="actions">
      <button commandfor="accept-new-full-character-dialog" command="close" class="vault-modal__close">
        <span class="sr-only">Закрыть</span>
        <i class="material-symbols-sharp" aria-hidden="true">close</i>
      </button>
    </div>
  </article>
  <form class="ce-form anfc-form" id="ce-form" autocomplete="off" novalidate>
    <div class="ce-top-flags">
      <label class="ce-switch">
        <input
          type="checkbox"
          id="ce-npc"
          name="npc"
          aria-controls="ce-id-field ce-main-optional"
        />
        <span class="ce-switch-track" aria-hidden="true"></span>
        <span>NPC</span>
      </label>
      <label class="ce-field-label ms-auto">
        <input type="checkbox" id="ce-gender-f" name="genderFemale" /> Женщина
      </label>
    </div>
    <div class="ce-field" data-config-field>
      <label class="ce-field-control">
        <span class="ce-field-label">
          Name
          <small>Латиницей (имя профиля)</small>
        </span>
        <input type="text" id="ce-name" name="name" required autofocus placeholder="Name Surname" />
      </label>
    </div>
    <div class="ce-field" data-config-field>
      <label class="ce-field-control">
        <span class="ce-field-label">
          Имя
          <small>Кириллицей</small>
        </span>
        <input
          type="text"
          id="ce-ru"
          name="ru"
          required
          placeholder="Имярек Имярекович"
        />
      </label>
    </div>
    <div class="ce-field" data-config-field>
      <label class="ce-field-control">
        <span class="ce-field-label">
          Дата рождения
          <small>ДД.ММ.ГГГГ</small>
        </span>
        <input type="text" id="ce-dob" name="dob" placeholder="13.12.1989" />
      </label>
    </div>
    <div class="ce-field" data-config-field>
      <label class="ce-field-control">
        <span class="ce-field-label">
          FC
          <small>Внешность латиницей</small>
        </span>
        <input type="text" id="ce-fc" name="fc" required placeholder="Name Surname" />
      </label>
    </div>
    <div class="ce-field" id="ce-id-field" data-config-field>
      <div class="ce-field-control">
        <label class="ce-field-label" for="ce-id">
          ID профиля
          <small>Только цифры</small>
        </label>
        <div class="ce-id-row">
          <input type="text" id="ce-id" name="id" inputmode="numeric" required placeholder="00" />
          <a
            class="ce-id-link"
            id="ce-id-link"
            target="_blank"
            rel="noopener noreferrer"
            title="Проверить профиль"
            aria-label="Проверить профиль"
            hidden
          >&nearr;</a>
        </div>
      </div>
    </div>
    <div class="ce-field" id="ce-anketa-field" data-config-field>
      <div class="ce-field-control">
        <label class="ce-field-label" for="ce-anketa">
          Анкета
          <small id="ce-anketa-hint">ID темы</small>
        </label>
        <div class="ce-id-row">
          <input type="text" id="ce-anketa" name="anketa" inputmode="numeric" required placeholder="00" />
          <a
            class="ce-id-link"
            id="ce-anketa-link"
            target="_blank"
            rel="noopener noreferrer"
            title="Проверить анкету"
            aria-label="Проверить анкету"
            hidden
          >&nearr;</a>
        </div>
      </div>
    </div>
    <div class="ce-field" id="ce-main-optional" data-config-field>
      <div class="ce-optional-head">
        <label class="ce-switch compact">
          <input
            type="checkbox"
            id="ce-main-is-main"
            name="isMain"
            checked
            aria-controls="ce-main-body"
            aria-expanded="false"
            aria-label="Основной профиль"
          />
          <span class="ce-switch-track" aria-hidden="true"></span>
        </label>
        <label for="ce-main-is-main">
          <span class="ce-field-label">Основной профиль</span>
        </label>
      </div>
      <div class="ce-optional-body" id="ce-main-body" hidden>
        <input
          type="text"
          id="ce-main"
          name="main"
          disabled
          list="ce-main-list"
          placeholder="Laurent Ambrose"
          aria-label="Имя основного профиля"
        />
        <datalist id="ce-main-list"></datalist>
      </div>
    </div>
    <div class="ce-field" data-config-field>
      <span class="ce-field-label">Кто</span>
      <div class="ce-who-groups">
        <div
          class="ce-checkboxes"
          id="ce-who-nature"
          role="radiogroup"
          aria-label="Тип"
        >
          <label><input type="radio" name="who-nature" value="human" checked /> человек</label>
          <label><input type="radio" name="who-nature" value="hybrid" /> полукровка</label>
          <label><input type="radio" name="who-nature" value="creature" /> существо</label>
          <label><input type="radio" name="who-nature" value="other" /> ???</label>
        </div>
        <div
          class="ce-checkboxes"
          id="ce-who-magic"
          role="group"
          aria-label="Магия"
        >
          <label><input type="checkbox" name="who-magic" value="magician" /> <span id="ce-magician-label">волшебник</span></label>
          <label><input type="checkbox" name="who-magic" value="hedgewitch" /> хедж-ведьма</label>
        </div>
      </div>
    </div>
    <div class="ce-field" data-config-field>
      <span class="ce-field-label">Принадлежность</span>
      <div class="ce-checkboxes" id="ce-aff">
        <label><input type="checkbox" name="affiliations" value="lawenforcement" /> полиция</label>
        <label><input type="checkbox" name="affiliations" value="mafia" /> синдикат</label>
      </div>
    </div>
    <div class="ce-field full" data-config-field>
      <label class="ce-switch danger">
        <input type="checkbox" id="ce-cursed" name="cursed" />
        <span class="ce-switch-track" aria-hidden="true"></span>
        <span id="ce-cursed-label">Проклят</span>
      </label>
    </div>
    <div class="ce-field full" data-config-field>
      <label class="ce-field-control">
        <span class="ce-field-label">Описание</span>
        <textarea id="ce-desc" name="desc" placeholder="Чем занимается?"></textarea>
      </label>
    </div>
    <p class="ce-form-status" id="ce-form-status" role="status" aria-live="polite" aria-atomic="true"></p>
    <div class="ce-form-actions">
      <button type="submit" class="button button--primary">Проверить</button>
      <button type="reset" class="button" id="ce-reset" disabled>Сбросить изменения</button>
    </div>
  </form>
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
