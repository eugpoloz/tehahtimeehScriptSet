const STYLE_CONTROLS_SELECTOR = ".theme__container";

/** @typedef {{ id: string, icon: string, label: string }} StyleControl */

/** @type {StyleControl[]} */
const STYLE_CONTROLS = [
  {
    id: "text-increase",
    icon: "text_increase",
    label: "Увеличить шрифт"
  },
  {
    id: "text-decrease",
    icon: "text_decrease",
    label: "Уменьшить шрифт"
  },
  {
    id: "text-clear",
    icon: "format_clear",
    label: "Скинуть размер шрифта"
  }
];

/** @param {StyleControl} control */
const styleControlMarkup = ({ id, icon, label }) => {
  const tooltipId = `${id}-tooltip`;

  return `
    <div class="theme__control">
      <button type="button" id="${id}" interestfor="${tooltipId}" popovertarget="${tooltipId}" aria-labelledby="${tooltipId}">
        <i class="material-symbols-sharp">${icon}</i>
      </button>
      <span class="tooltip" id="${tooltipId}" popover="hint" role="tooltip">${label}</span>
    </div>`;
};

const STYLE_CONTROLS_HTML = `
  <!-- STYLE CONTROLS -->
  <div class="theme__container">
    <div class="theme">
      <!-- cюда ткнем переключалку light/dark -->
    </div>
    <div class="theme">${STYLE_CONTROLS.map(styleControlMarkup).join("")}
    </div>
  </div>
  <!-- / STYLE CONTROLS -->`;

/**
 * Adds the font-size controls next to the calling script, or at the end of the
 * document body when called later.
 *
 * @returns {void}
 */
function addStyleControls() {
  if (document.querySelector(STYLE_CONTROLS_SELECTOR)) {
    return;
  }

  const script = document.currentScript;
  if (script) {
    script.insertAdjacentHTML("afterend", STYLE_CONTROLS_HTML);
    return;
  }

  const body = document.body;
  if (!body) {
    return;
  }

  body.insertAdjacentHTML("beforeend", STYLE_CONTROLS_HTML);
}

export default addStyleControls;
