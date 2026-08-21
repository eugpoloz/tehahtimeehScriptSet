import { handleError } from "@teh/utils";

const MODULE_NAME = "add-episode-templates";

const BUTTON_ID = "button-ep-templates";
const MENU_ID = "teh-ep-templates-menu";

/** @typedef {{ id?: string, label: string, body: string, icon?: string }} EpisodeTemplate */

/** @type {EpisodeTemplate[]} */
export const DEFAULT_EPISODE_TEMPLATES = [
  {
    id: "ep-poster",
    label: "С постером",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="22" viewBox="0 0 32 22" aria-hidden="true" focusable="false"><rect x="0.5" y="0.5" width="31" height="21" rx="2" fill="none" stroke="currentColor" stroke-width="1" opacity="0.35"/><rect x="1" y="1" width="30" height="6" rx="1.5" fill="currentColor" opacity="0.28"/><rect x="6" y="8.5" width="20" height="2" rx="1" fill="currentColor" opacity="0.4"/><rect x="9" y="12" width="14" height="1.75" rx="1" fill="currentColor" opacity="0.28"/><rect x="3" y="15.5" width="26" height="1.5" rx="0.75" fill="currentColor" opacity="0.2"/><rect x="3" y="18" width="20" height="1.5" rx="0.75" fill="currentColor" opacity="0.2"/></svg>`,
    body: `[block="hehe hehe-max hehe-ep hehe-ep--poster"]
[block=poster][img]ссылкаНаВашуКартинку[/img][/block]

[block=wrapper]

[block=heading]
[block=title][subject] или ваше название эпизода[/block]
[url=ссылкНаПрофильПерсонажа]Участник[/url]

[block=more]Дата, время, место[/block]
[/block]

[hr]
Описание
[/block][/block]`
  },
  {
    id: "ep-char",
    label: "С портретами",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="22" viewBox="0 0 32 22" aria-hidden="true" focusable="false"><rect x="0.5" y="0.5" width="31" height="21" rx="2" fill="none" stroke="currentColor" stroke-width="1" opacity="0.35"/><rect x="2.5" y="3.5" width="12.5" height="2.25" rx="1" fill="currentColor" opacity="0.4"/><rect x="2.5" y="6.75" width="9" height="1.75" rx="1" fill="currentColor" opacity="0.28"/><rect x="16" y="3.5" width="6" height="6" rx="1" fill="currentColor" opacity="0.28"/><rect x="23.5" y="3.5" width="6" height="6" rx="1" fill="currentColor" opacity="0.28"/><rect x="2.5" y="11" width="27" height="1.5" rx="0.75" fill="currentColor" opacity="0.2"/><rect x="2.5" y="14" width="21" height="1.5" rx="0.75" fill="currentColor" opacity="0.2"/><rect x="2.5" y="17" width="16" height="1.5" rx="0.75" fill="currentColor" opacity="0.15"/></svg>`,
    body: `[block="hehe hehe-max wrapper hehe-ep hehe-ep hehe-ep--char"][block=details]
[block=""][block=heading]
[block=title][subject] или ваше название эпизода[/block]
[block=more]Дата, время, место[/block]
[/block][/block]

[block=charlist]

[block=portrait][url=ссылкаНаПрофильПерсонажа][img]ссылкаНаПортретПерсонажа[/img][/url][/block]

[block=portrait][url=ссылкаНаПрофильПерсонажа][img]ссылкаНаПортретПерсонажа[/img][/url][/block]

[/block][/block]

[hr]
Описание

[/block]`
  }
];

/**
 * Inserts template text into the reply textarea (cursor-aware when `insert` exists).
 *
 * @param {string} text
 * @returns {void}
 */
const insertTemplate = (text) => {
  if (typeof insert === "function") {
    insert(text);
    return;
  }

  const textarea = /** @type {HTMLTextAreaElement | null} */ (
    document.querySelector("#main-reply")
  );
  if (!textarea) {
    return;
  }

  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? start;
  textarea.value =
    textarea.value.slice(0, start) + text + textarea.value.slice(end);
  const cursor = start + text.length;
  textarea.setSelectionRange(cursor, cursor);
  textarea.focus();
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
};

/**
 * Adds a toolbar button that opens an episode-templates menu via the Popover API.
 *
 * @param {object} [options]
 * @param {EpisodeTemplate[]} [options.templates] Template list (defaults to poster + char).
 * @param {string} [options.target="button-addition"] Toolbar button id to insert after.
 * @param {string} [options.buttonLabel="Шаблоны эпизодов"] Toolbar button title.
 * @param {string} [options.menuHeading="Вставить шаблон:"] Label above template options.
 * @returns {void}
 */
const addEpisodeTemplates = ({
  templates = DEFAULT_EPISODE_TEMPLATES,
  target = "button-addition",
  buttonLabel = "Шаблоны эпизодов",
  menuHeading = "Вставить шаблон:"
} = {}) => {
  try {
    if (!templates.length || document.getElementById(BUTTON_ID)) {
      return;
    }

    const btnTarget = document.getElementById(target);
    const tags = document.getElementById("tags");
    if (!(btnTarget instanceof HTMLElement) || !(tags instanceof HTMLElement)) {
      return;
    }

    const itemsHtml = templates
      .map((template, index) => {
        const icon = template.icon ?? "";
        return `<button type="button" role="menuitem" data-teh-ep-template="${index}"${
          template.id ? ` id="${template.id}"` : ""
        }>${icon}<span>${template.label}</span></button>`;
      })
      .join("");

    btnTarget.insertAdjacentHTML(
      "afterend",
      `<td id="${BUTTON_ID}" title="${buttonLabel}"><button type="button" popovertarget="${MENU_ID}" aria-label="${buttonLabel}"></button></td>`
    );

    tags.insertAdjacentHTML(
      "beforeend",
      `<div id="${MENU_ID}" class="teh-ep-templates-menu" popover="auto" role="menu">
  <p class="teh-ep-templates-menu__heading">${menuHeading}</p>
  ${itemsHtml}
</div>`
    );

    const menu = /** @type {HTMLElement | null} */ (
      document.getElementById(MENU_ID)
    );

    if (!(menu instanceof HTMLElement)) {
      return;
    }

    menu.addEventListener("click", (event) => {
      const item = /** @type {HTMLElement | null} */ (event.target)?.closest?.(
        "[data-teh-ep-template]"
      );
      if (!(item instanceof HTMLButtonElement)) {
        return;
      }

      const template = templates[Number(item.dataset.tehEpTemplate)];
      if (!template) {
        return;
      }

      insertTemplate(template.body);
      menu.hidePopover();
    });
  } catch (error) {
    handleError(MODULE_NAME, error);
  }
};

export default addEpisodeTemplates;
