import { fontSizeControlsMarkup } from "./font-size";
import { themeControlsMarkup } from "./theme";

const VISUAL_CONTROLS_HTML = `
  <li class="theme__container">
    <div class="theme__control">
      <button class="theme__toggle" type="button" popovertarget="theme-settings-popover" aria-haspopup="dialog">
        <span class="sr-only" id="theme-settings-title">Настройки отображения</span>
        <i class="material-symbols-sharp" aria-hidden="true">wand_stars</i>
      </button>
      <div class="theme__menu popover-custom" id="theme-settings-popover" popover="auto" role="dialog" aria-labelledby="theme-settings-title">
        ${fontSizeControlsMarkup()}
        ${themeControlsMarkup()}
      </div>
    </div>
  </li>`;

/**
 * Adds the visual controls to the forum navigation.
 *
 * @returns {boolean} Whether the controls are available.
 */
export const insertVisualControls = () => {
  if (document.querySelector(".theme__container")) {
    return true;
  }

  const navLinks = document.querySelector("#pun-navlinks ul");
  if (!navLinks) {
    return false;
  }

  navLinks.insertAdjacentHTML("beforeend", VISUAL_CONTROLS_HTML);

  return true;
};
