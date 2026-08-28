const VISUAL_CONTROLS_SELECTOR = ".theme__container";

/** @typedef {{ id: string, icon: string, label: string }} VisualControl */

/** @type {VisualControl[]} */
const VISUAL_CONTROLS = [
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

/** @param {VisualControl} control */
const visualControlMarkup = ({ id, icon, label }) => {
  const tooltipId = `${id}-tooltip`;

  return `
    <div class="theme__control">
      <button type="button" id="${id}" interestfor="${tooltipId}" popovertarget="${tooltipId}" aria-labelledby="${tooltipId}">
        <i class="material-symbols-sharp">${icon}</i>
      </button>
      <span class="tooltip" id="${tooltipId}" popover="hint" role="tooltip">${label}</span>
    </div>`;
};

const VISUAL_CONTROLS_HTML = `
  <div class="theme__container">
    <div class="theme">
      <!-- cюда ткнем переключалку light/dark -->
    </div>
    <div class="theme">${VISUAL_CONTROLS.map(visualControlMarkup).join("")}
    </div>
  </div>`;

/**
 * Adds the visual controls next to the calling script, or at the end of the
 * document body when called later.
 *
 * @returns {void}
 */
export const insertVisualControls = () => {
  if (document.querySelector(VISUAL_CONTROLS_SELECTOR)) {
    return;
  }

  const script = document.currentScript;
  if (script) {
    script.insertAdjacentHTML("afterend", VISUAL_CONTROLS_HTML);

    return;
  }

  const body = document.body;
  if (!body) {
    return;
  }

  body.insertAdjacentHTML("beforeend", VISUAL_CONTROLS_HTML);
};
