import { fontSizeControlsMarkup } from "./font-size";
import { newMsgLinkControlMarkup } from "./add-new-msg-link";
import { themeControlsMarkup } from "./theme";

const VISUAL_CONTROLS_HTML = `
  <li class="theme__container flex items-center shrink-0 grow-0 ms-auto" id="visual-controls">
    <button class="button-icon theme__toggle flex flex-col flex-nowrap items-center justify-center" type="button" popovertarget="theme-settings-popover" aria-haspopup="dialog">
      <span class="sr-only" id="theme-settings-title">Настройки отображения</span>
      <i class="material-symbols-sharp icon-20" aria-hidden="true">wand_stars</i>
    </button>
    <div class="theme__menu popover-custom" id="theme-settings-popover" popover="auto" role="dialog" aria-labelledby="theme-settings-title">
      ${fontSizeControlsMarkup()}
      ${themeControlsMarkup()}
      ${newMsgLinkControlMarkup()}
    </div>
  </li>`;

/**
 * Adds the visual controls to the forum navigation.
 *
 * @returns {boolean} Whether the controls are available.
 */
export const insertVisualControls = () => {
  if (document.getElementById("visual-controls")) {
    return true;
  }

  const navLinks = document.querySelector("#pun-navlinks ul");
  if (!navLinks) {
    return false;
  }

  navLinks.insertAdjacentHTML("beforeend", VISUAL_CONTROLS_HTML);

  return true;
};
